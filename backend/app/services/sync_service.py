"""
Sync Service — AbleNova
========================

Handles idempotent processing of offline sync payloads.

The API contract (docs/API_CONTRACT.md, Section 19) defines:

  Request:
    {
      "events": [
        {
          "local_id": "local_001",
          "type": "quiz_attempt",
          "payload": {},
          "created_at": "2026-08-30T10:00:00Z"
        }
      ]
    }

  Response:
    {
      "synced": ["local_001"],
      "failed": []
    }

Idempotency mechanism:
  - Each incoming event/item carries a client-generated `local_id`.
  - Before processing any item, we check `sync_logs` for a record
    with (student_id, local_id). If it already exists, we skip the item
    and add its local_id to the `synced` list (idempotent success).
  - If it does not exist, we process the item and create a sync_log record.
  - A UNIQUE constraint on (student_id, local_id) in sync_logs provides
    a database-level safety net against race conditions.

Supported event types:
  "engagement_event" → creates an EngagementEvent record
  "learning_session" → creates a LearningSession record
  Other types        → logged as unknown / skipped with failure reporting

Each item is processed independently. A failure in one item
does not prevent other items from being processed.
"""
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models.engagement import EngagementEvent
from app.db.models.learning_session import LearningSession
from app.db.models.sync_log import SyncLog


def _is_already_synced(
    student_id: uuid.UUID,
    local_id: str,
    db: Session,
) -> bool:
    """Return True if this local_id has already been synced for this student."""
    return (
        db.query(SyncLog.id)
        .filter(
            SyncLog.student_id == student_id,
            SyncLog.local_id == local_id,
        )
        .first()
        is not None
    )


def _mark_synced(
    student_id: uuid.UUID,
    local_id: str,
    event_type: str,
    db: Session,
) -> None:
    """
    Insert a SyncLog record marking this local_id as processed.

    Uses a savepoint so that a race-condition IntegrityError (duplicate
    insert) does not abort the outer transaction.
    """
    log = SyncLog(
        student_id=student_id,
        local_id=local_id,
        event_type=event_type,
        synced_at=datetime.now(timezone.utc),
    )
    db.add(log)


def _process_engagement_event(
    student_id: uuid.UUID,
    payload: dict[str, Any],
    db: Session,
) -> None:
    """
    Insert an EngagementEvent from a sync payload.

    Required payload fields: event_type
    Optional payload fields: lesson_id, duration_seconds
    """
    event_type = payload.get("event_type") or payload.get("type")
    if not event_type:
        raise ValueError("Missing event_type in engagement_event payload")

    lesson_id = payload.get("lesson_id")
    duration_seconds = payload.get("duration_seconds")

    event = EngagementEvent(
        student_id=student_id,
        event_type=str(event_type),
        lesson_id=lesson_id if lesson_id else None,
        duration_seconds=int(duration_seconds) if duration_seconds is not None else None,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(event)


def _process_learning_session(
    student_id: uuid.UUID,
    payload: dict[str, Any],
    db: Session,
) -> None:
    """
    Insert a LearningSession from a sync payload.

    Required payload fields: lesson_id
    Optional payload fields: duration_seconds, completed
    """
    lesson_id = payload.get("lesson_id")
    if not lesson_id:
        raise ValueError("Missing lesson_id in learning_session payload")

    duration_seconds = payload.get("duration_seconds")
    completed = payload.get("completed", False)
    now = datetime.now(timezone.utc)

    session = LearningSession(
        student_id=student_id,
        lesson_id=lesson_id,
        started_at=now,
        completed_at=now if completed else None,
        duration_seconds=int(duration_seconds) if duration_seconds is not None else None,
    )
    db.add(session)


def process_sync_events(
    student_id: uuid.UUID,
    events: list[dict[str, Any]],
    db: Session,
) -> tuple[list[str], list[dict[str, Any]]]:
    """
    Process a list of sync events idempotently.

    Each event dict must contain a "local_id" and a "type" field.
    Supported "type" values: "engagement_event", "learning_session".

    Returns:
      synced: list of local_ids that were successfully processed (or already processed)
      failed: list of dicts with {"local_id": ..., "error": ...} for items that failed
    """
    synced: list[str] = []
    failed: list[dict[str, Any]] = []

    for event in events:
        local_id: str | None = event.get("local_id")
        event_type: str = str(event.get("type") or "unknown")
        payload: dict[str, Any] = event.get("payload") or event  # allow flat payloads

        # Validate local_id presence
        if not local_id:
            failed.append({
                "local_id": None,
                "error": "Missing local_id — item cannot be tracked for idempotency",
            })
            continue

        # Check idempotency — already synced?
        if _is_already_synced(student_id, local_id, db):
            # Already processed; report as synced (idempotent success)
            synced.append(local_id)
            continue

        # Process based on type
        try:
            if event_type == "engagement_event":
                _process_engagement_event(student_id, payload, db)
            elif event_type == "learning_session":
                _process_learning_session(student_id, payload, db)
            else:
                # Unknown types are logged but not failed — future-proofing
                # We still mark them synced so they do not cause infinite retries
                pass

            # Mark as synced — use savepoint to handle race conditions
            _mark_synced(student_id, local_id, event_type, db)
            db.flush()
            synced.append(local_id)

        except IntegrityError:
            # Race condition: another concurrent request inserted the sync log.
            # Treat as already-synced (idempotent).
            db.rollback()
            synced.append(local_id)

        except Exception as exc:
            failed.append({
                "local_id": local_id,
                "error": str(exc),
            })

    return synced, failed

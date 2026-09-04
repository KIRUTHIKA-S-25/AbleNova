from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.sync import SyncPayload, SyncResponse
from app.services.sync_service import process_sync_events

router = APIRouter(
    prefix="/sync",
    tags=["Sync"],
)


def get_authenticated_student(
    current_user: User,
    db: Session,
) -> Student:
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    return student


@router.post(
    "",
    response_model=SyncResponse,
    summary="Receive offline sync events idempotently from authenticated student matching API Contract Section 19",
)
def sync_student_data(
    payload: SyncPayload,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    # Normalize incoming items into a uniform list of events with local_ids
    all_events: list[dict] = []

    # 1. API Contract events list: [{"local_id": "...", "type": "...", "payload": {...}}]
    if payload.events:
        for ev in payload.events:
            event_type = ev.get("type") or ev.get("event_type") or "engagement_event"
            local_id = ev.get("local_id") or str(uuid4())
            all_events.append({
                "local_id": local_id,
                "type": event_type,
                "payload": ev.get("payload") or ev,
            })

    # 2. Legacy sessions list
    if payload.sessions:
        for sess in payload.sessions:
            local_id = sess.get("local_id") or str(uuid4())
            all_events.append({
                "local_id": local_id,
                "type": "learning_session",
                "payload": sess,
            })

    # 3. Legacy attempts list
    if payload.attempts:
        for att in payload.attempts:
            local_id = att.get("local_id") or str(uuid4())
            all_events.append({
                "local_id": local_id,
                "type": "quiz_attempt",
                "payload": att,
            })

    synced, failed = process_sync_events(student.id, all_events, db)
    db.commit()

    return SyncResponse(
        synced=synced,
        failed=failed,
        processed_events=len(synced),
        processed_sessions=len([e for e in all_events if e["type"] == "learning_session" and e["local_id"] in synced]),
        processed_attempts=len([e for e in all_events if e["type"] == "quiz_attempt" and e["local_id"] in synced]),
        status="success" if not failed else "partial_success",
        message=f"Sync complete. Synced: {len(synced)}, Failed: {len(failed)}.",
    )

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.engagement import EngagementEvent
from app.db.models.learning_session import LearningSession
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.sync import SyncPayload, SyncResponse


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
    summary="Receive offline sync events from the authenticated student",
)
def sync_student_data(
    payload: SyncPayload,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    processed_events = 0
    processed_sessions = 0
    processed_attempts = 0

    # ----------------------------------------------------------------
    # Process engagement events
    # ----------------------------------------------------------------
    for raw_event in payload.events or []:
        event_type = raw_event.get("event_type")
        if not event_type:
            continue  # Skip invalid events

        lesson_id = raw_event.get("lesson_id")
        duration_seconds = raw_event.get("duration_seconds")

        # student_id is always from the authenticated token — never from payload
        event = EngagementEvent(
            student_id=student.id,
            event_type=str(event_type),
            lesson_id=lesson_id,
            duration_seconds=(
                int(duration_seconds) if duration_seconds is not None else None
            ),
            timestamp=datetime.now(timezone.utc),
        )

        db.add(event)
        processed_events += 1

    # ----------------------------------------------------------------
    # Process learning sessions
    # ----------------------------------------------------------------
    for raw_session in payload.sessions or []:
        lesson_id = raw_session.get("lesson_id")
        if not lesson_id:
            continue  # Skip invalid sessions

        duration_seconds = raw_session.get("duration_seconds")
        completed = raw_session.get("completed", False)

        now = datetime.now(timezone.utc)

        session = LearningSession(
            student_id=student.id,
            lesson_id=lesson_id,
            started_at=now,
            completed_at=now if completed else None,
            duration_seconds=(
                int(duration_seconds) if duration_seconds is not None else None
            ),
        )

        db.add(session)
        processed_sessions += 1

    # ----------------------------------------------------------------
    # Quiz attempts from sync payload
    # Note: Full quiz attempt processing is handled by /quiz-attempts.
    # Sync only records a count here for future offline attempt support.
    # ----------------------------------------------------------------
    for _ in payload.attempts or []:
        processed_attempts += 1  # Placeholder for future offline quiz sync

    db.commit()

    return SyncResponse(
        processed_events=processed_events,
        processed_sessions=processed_sessions,
        processed_attempts=processed_attempts,
        status="success",
        message=(
            f"Sync complete. "
            f"Events: {processed_events}, "
            f"Sessions: {processed_sessions}, "
            f"Attempts noted: {processed_attempts}."
        ),
    )

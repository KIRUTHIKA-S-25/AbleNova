from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.engagement import EngagementEvent
from app.db.models.learning_session import LearningSession
from app.db.models.mastery import StudentTopicMastery
from app.db.models.student import Student
from app.db.models.lesson import Lesson
from app.db.models.topic import Topic
from app.db.models.user import User


router = APIRouter(
    prefix="/progress",
    tags=["Progress"],
)


# ============================================================
# HELPERS
# ============================================================

def get_current_student(
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


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class LearningSessionCreateRequest(BaseModel):
    lesson_id: UUID


class LearningSessionCompleteRequest(BaseModel):
    duration_seconds: int | None = None


class EngagementEventCreateRequest(BaseModel):
    event_type: str
    lesson_id: UUID | None = None
    duration_seconds: int | None = None


class MasteryUpdateRequest(BaseModel):
    topic_id: UUID
    mastery_score: float
    confidence: float


# ============================================================
# START LEARNING SESSION
# ============================================================

@router.post(
    "/sessions",
    status_code=status.HTTP_201_CREATED,
)
def start_learning_session(
    request: LearningSessionCreateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == request.lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    session = LearningSession(
        student_id=student.id,
        lesson_id=request.lesson_id,
        started_at=datetime.now(timezone.utc),
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "student_id": session.student_id,
        "lesson_id": session.lesson_id,
        "started_at": session.started_at,
        "completed_at": session.completed_at,
        "duration_seconds": session.duration_seconds,
    }


# ============================================================
# COMPLETE LEARNING SESSION
# ============================================================

@router.put(
    "/sessions/{session_id}/complete",
)
def complete_learning_session(
    session_id: UUID,
    request: LearningSessionCompleteRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    session = (
        db.query(LearningSession)
        .filter(
            LearningSession.id == session_id,
            LearningSession.student_id == student.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning session not found",
        )

    if session.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Learning session already completed",
        )

    completed_at = datetime.now(timezone.utc)

    session.completed_at = completed_at

    if request.duration_seconds is not None:
        session.duration_seconds = request.duration_seconds
    else:
        elapsed = completed_at - session.started_at
        session.duration_seconds = max(
            0,
            int(elapsed.total_seconds()),
        )

    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "lesson_id": session.lesson_id,
        "started_at": session.started_at,
        "completed_at": session.completed_at,
        "duration_seconds": session.duration_seconds,
        "status": "completed",
    }


# ============================================================
# GET LEARNING SESSION HISTORY
# ============================================================

@router.get(
    "/sessions",
)
def get_learning_sessions(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    sessions = (
        db.query(LearningSession)
        .filter(
            LearningSession.student_id == student.id
        )
        .order_by(
            LearningSession.started_at.desc()
        )
        .all()
    )

    return [
        {
            "id": session.id,
            "lesson_id": session.lesson_id,
            "started_at": session.started_at,
            "completed_at": session.completed_at,
            "duration_seconds": session.duration_seconds,
            "status": (
                "completed"
                if session.completed_at
                else "in_progress"
            ),
        }
        for session in sessions
    ]


# ============================================================
# RECORD ENGAGEMENT EVENT
# ============================================================

@router.post(
    "/engagement",
    status_code=status.HTTP_201_CREATED,
)
def create_engagement_event(
    request: EngagementEventCreateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    if request.lesson_id:
        lesson = (
            db.query(Lesson)
            .filter(Lesson.id == request.lesson_id)
            .first()
        )
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

    event = EngagementEvent(
        student_id=student.id,
        event_type=request.event_type,
        lesson_id=request.lesson_id,
        duration_seconds=request.duration_seconds,
        timestamp=datetime.now(timezone.utc),
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "id": event.id,
        "student_id": event.student_id,
        "event_type": event.event_type,
        "lesson_id": event.lesson_id,
        "timestamp": event.timestamp,
        "duration_seconds": event.duration_seconds,
    }


# ============================================================
# GET ENGAGEMENT HISTORY
# ============================================================

@router.get(
    "/engagement",
)
def get_engagement_history(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    events = (
        db.query(EngagementEvent)
        .filter(
            EngagementEvent.student_id == student.id
        )
        .order_by(
            EngagementEvent.timestamp.desc()
        )
        .all()
    )

    return [
        {
            "id": event.id,
            "event_type": event.event_type,
            "lesson_id": event.lesson_id,
            "timestamp": event.timestamp,
            "duration_seconds": event.duration_seconds,
        }
        for event in events
    ]


# ============================================================
# UPDATE TOPIC MASTERY
# ============================================================

@router.post(
    "/mastery",
    status_code=status.HTTP_200_OK,
)
def update_topic_mastery(
    request: MasteryUpdateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    if not 0 <= request.mastery_score <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="mastery_score must be between 0 and 1",
        )

    if not 0 <= request.confidence <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="confidence must be between 0 and 1",
        )

    topic = (
        db.query(Topic)
        .filter(Topic.id == request.topic_id)
        .first()
    )

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found",
        )

    mastery = (
        db.query(StudentTopicMastery)
        .filter(
            StudentTopicMastery.student_id == student.id,
            StudentTopicMastery.topic_id == request.topic_id,
        )
        .first()
    )

    if mastery:
        mastery.mastery_score = request.mastery_score
        mastery.confidence = request.confidence
        mastery.updated_at = datetime.now(timezone.utc)

    else:
        mastery = StudentTopicMastery(
            student_id=student.id,
            topic_id=request.topic_id,
            mastery_score=request.mastery_score,
            confidence=request.confidence,
            updated_at=datetime.now(timezone.utc),
        )

        db.add(mastery)

    db.commit()
    db.refresh(mastery)

    return {
        "student_id": mastery.student_id,
        "topic_id": mastery.topic_id,
        "mastery_score": mastery.mastery_score,
        "confidence": mastery.confidence,
        "updated_at": mastery.updated_at,
    }


# ============================================================
# GET TOPIC MASTERY
# ============================================================

@router.get(
    "/mastery",
)
def get_topic_mastery(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    mastery_records = (
        db.query(StudentTopicMastery)
        .filter(
            StudentTopicMastery.student_id == student.id
        )
        .order_by(
            StudentTopicMastery.updated_at.desc()
        )
        .all()
    )

    return [
        {
            "topic_id": record.topic_id,
            "mastery_score": record.mastery_score,
            "confidence": record.confidence,
            "updated_at": record.updated_at,
        }
        for record in mastery_records
    ]


# ============================================================
# OVERALL STUDENT PROGRESS
# ============================================================

@router.get(
    "/me",
)
def get_my_progress(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_current_student(current_user, db)

    sessions = (
        db.query(LearningSession)
        .filter(
            LearningSession.student_id == student.id
        )
        .all()
    )

    completed_sessions = [
        session
        for session in sessions
        if session.completed_at is not None
    ]

    total_duration = sum(
        session.duration_seconds or 0
        for session in sessions
    )

    mastery_records = (
        db.query(StudentTopicMastery)
        .filter(
            StudentTopicMastery.student_id == student.id
        )
        .all()
    )

    if mastery_records:
        average_mastery = (
            sum(
                record.mastery_score
                for record in mastery_records
            )
            / len(mastery_records)
        )
    else:
        average_mastery = 0.0

    engagement_count = (
        db.query(EngagementEvent)
        .filter(
            EngagementEvent.student_id == student.id
        )
        .count()
    )

    return {
        "student_id": student.id,
        "total_learning_sessions": len(sessions),
        "completed_learning_sessions": len(
            completed_sessions
        ),
        "total_learning_duration_seconds": total_duration,
        "mastery_topics_tracked": len(mastery_records),
        "average_mastery_score": round(
            average_mastery,
            4,
        ),
        "engagement_events": engagement_count,
    }
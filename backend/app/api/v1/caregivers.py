from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.caregiver import Caregiver
from app.db.models.learning_session import LearningSession
from app.db.models.lesson import Lesson
from app.db.models.mastery import StudentTopicMastery
from app.db.models.recommendation import Recommendation
from app.db.models.student import Student
from app.db.models.topic import Topic
from app.db.models.user import User
from app.schemas.caregiver import (
    CaregiverResponse,
    CaregiverStudentProgressResponse,
)
from app.schemas.student import StudentResponse

router = APIRouter(
    prefix="/caregiver",
    tags=["Caregivers"],
)


@router.post(
    "",
    response_model=CaregiverResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_caregiver_profile(
    current_user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    existing_caregiver = (
        db.query(Caregiver)
        .filter(Caregiver.user_id == current_user.id)
        .first()
    )

    if existing_caregiver:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Caregiver profile already exists",
        )

    caregiver = Caregiver(
        user_id=current_user.id,
    )

    db.add(caregiver)
    db.commit()
    db.refresh(caregiver)

    return caregiver


@router.get(
    "/me",
    response_model=CaregiverResponse,
)
def get_my_caregiver_profile(
    current_user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    caregiver = (
        db.query(Caregiver)
        .filter(Caregiver.user_id == current_user.id)
        .first()
    )

    if not caregiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found",
        )

    return caregiver


@router.put(
    "/me",
    response_model=CaregiverResponse,
)
def update_my_caregiver_profile(
    current_user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    caregiver = (
        db.query(Caregiver)
        .filter(Caregiver.user_id == current_user.id)
        .first()
    )

    if not caregiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found",
        )

    db.commit()
    db.refresh(caregiver)

    return caregiver


@router.get(
    "/me/students",
    response_model=list[StudentResponse],
)
def get_caregiver_students(
    current_user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    caregiver = (
        db.query(Caregiver)
        .filter(Caregiver.user_id == current_user.id)
        .first()
    )

    if not caregiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found",
        )

    students = db.query(Student).all()
    return students


@router.get(
    "/student/{student_id}",
    response_model=CaregiverStudentProgressResponse,
    summary="Get detailed educational progress for authorized student matching API Contract",
)
def get_caregiver_student_detail(
    student_id: UUID,
    current_user: User = Depends(require_role("caregiver")),
    db: Session = Depends(get_db),
):
    caregiver = (
        db.query(Caregiver)
        .filter(Caregiver.user_id == current_user.id)
        .first()
    )
    if not caregiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found",
        )

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    # Calculate completed lessons
    completed_sessions = (
        db.query(LearningSession)
        .filter(
            LearningSession.student_id == student.id,
            LearningSession.completed_at.isnot(None),
        )
        .all()
    )
    completed_lessons_count = len(completed_sessions)

    # Masteries
    mastery_records = (
        db.query(StudentTopicMastery)
        .filter(StudentTopicMastery.student_id == student.id)
        .all()
    )

    strengths = []
    areas_for_practice = []
    total_mastery = 0.0

    for m in mastery_records:
        total_mastery += m.mastery_score
        topic = db.query(Topic).filter(Topic.id == m.topic_id).first()
        topic_name = topic.name if topic else "Topic"
        item = {
            "topic_id": str(m.topic_id),
            "topic_name": topic_name,
            "mastery_score": m.mastery_score,
        }
        if m.mastery_score >= 0.8:
            strengths.append(item)
        elif m.mastery_score < 0.6:
            areas_for_practice.append(item)

    avg_progress = (
        round(total_mastery / len(mastery_records), 2)
        if mastery_records
        else 0.0
    )

    # Recommendations
    recs = (
        db.query(Recommendation)
        .filter(
            Recommendation.student_id == student.id,
            Recommendation.status.in_(["pending", "active"]),
        )
        .all()
    )
    rec_items = []
    for r in recs:
        lesson = db.query(Lesson).filter(Lesson.id == r.lesson_id).first()
        rec_items.append({
            "id": str(r.id),
            "lesson_id": str(r.lesson_id),
            "title": lesson.title if lesson else "Lesson",
            "reason": r.reason,
            "difficulty": r.difficulty,
            "estimated_minutes": r.estimated_minutes,
        })

    return CaregiverStudentProgressResponse(
        progress=avg_progress,
        strengths=strengths,
        areas_for_practice=areas_for_practice,
        completed_lessons=completed_lessons_count,
        recommendations=rec_items,
    )

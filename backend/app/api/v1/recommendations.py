from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.db.models.lesson import Lesson
from app.db.models.recommendation import Recommendation
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationResponse,
    RecommendationStatusUpdate,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
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


@router.get(
    "/me",
    response_model=list[RecommendationResponse],
)
def get_my_recommendations(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.student_id == student.id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    return recommendations


@router.get(
    "/me/active",
    response_model=list[RecommendationResponse],
)
def get_my_active_recommendations(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.student_id == student.id,
            Recommendation.status.in_(["pending", "active"]),
        )
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    return recommendations


@router.put(
    "/{recommendation_id}/status",
    response_model=RecommendationResponse,
)
def update_recommendation_status(
    recommendation_id: UUID,
    status_update: RecommendationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.id == recommendation_id)
        .first()
    )

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )

    if current_user.role == "student":
        student = get_authenticated_student(current_user, db)
        if recommendation.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this recommendation",
            )

    recommendation.status = status_update.status
    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.post(
    "",
    response_model=RecommendationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_recommendation(
    recommendation_data: RecommendationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = (
        db.query(Student)
        .filter(Student.id == recommendation_data.student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == recommendation_data.lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    recommendation = Recommendation(
        student_id=recommendation_data.student_id,
        lesson_id=recommendation_data.lesson_id,
        reason=recommendation_data.reason,
        difficulty=recommendation_data.difficulty,
        estimated_minutes=recommendation_data.estimated_minutes,
        status="pending",
        created_at=datetime.now(UTC),
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation

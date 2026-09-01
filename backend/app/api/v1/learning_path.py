from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.db.models.learning_path import LearningPathItem
from app.db.models.student import Student
from app.db.models.lesson import Lesson
from app.db.models.user import User
from app.schemas.learning_path import (
    LearningPathItemCreate,
    LearningPathItemResponse,
    LearningPathStatusUpdate,
)


router = APIRouter(
    prefix="/learning-path",
    tags=["Learning Path"],
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
    response_model=list[LearningPathItemResponse],
)
def get_my_learning_path(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    items = (
        db.query(LearningPathItem)
        .filter(LearningPathItem.student_id == student.id)
        .order_by(LearningPathItem.order_index.asc())
        .all()
    )

    return items


@router.put(
    "/{item_id}/status",
    response_model=LearningPathItemResponse,
)
def update_learning_path_item_status(
    item_id: UUID,
    status_update: LearningPathStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(LearningPathItem)
        .filter(LearningPathItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path item not found",
        )

    if current_user.role == "student":
        student = get_authenticated_student(current_user, db)
        if item.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this learning path item",
            )

    item.status = status_update.status
    db.commit()
    db.refresh(item)

    return item


@router.post(
    "",
    response_model=LearningPathItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_learning_path_item(
    item_data: LearningPathItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = (
        db.query(Student)
        .filter(Student.id == item_data.student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == item_data.lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    item = LearningPathItem(
        student_id=item_data.student_id,
        lesson_id=item_data.lesson_id,
        order_index=item_data.order_index,
        reason=item_data.reason,
        status=item_data.status or "pending",
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item

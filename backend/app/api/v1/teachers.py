from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.teacher import Teacher
from app.db.models.subject import Subject
from app.db.models.topic import Topic
from app.db.models.lesson import Lesson
from app.db.models.user import User
from app.schemas.teacher import TeacherResponse


router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"],
)


@router.post(
    "",
    response_model=TeacherResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_teacher_profile(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    existing_teacher = (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .first()
    )

    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Teacher profile already exists",
        )

    teacher = Teacher(
        user_id=current_user.id,
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return teacher


@router.get(
    "/me",
    response_model=TeacherResponse,
)
def get_my_teacher_profile(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    teacher = (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found",
        )

    return teacher


@router.put(
    "/me",
    response_model=TeacherResponse,
)
def update_my_teacher_profile(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    teacher = (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found",
        )

    db.commit()
    db.refresh(teacher)

    return teacher


@router.get(
    "/me/content",
)
def get_teacher_content_overview(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    teacher = (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found",
        )

    subjects_count = db.query(Subject).count()
    topics_count = db.query(Topic).count()
    lessons_count = db.query(Lesson).count()

    return {
        "teacher_id": teacher.id,
        "subjects_count": subjects_count,
        "topics_count": topics_count,
        "lessons_count": lessons_count,
    }

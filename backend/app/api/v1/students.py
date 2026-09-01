from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.student import (
    StudentCreateRequest,
    StudentResponse,
)


router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


# ============================================================
# CREATE CURRENT STUDENT PROFILE
# ============================================================

@router.post(
    "/",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student_profile(
    student_data: StudentCreateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    # Check if student profile already exists
    existing_student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student profile already exists",
        )

    student = Student(
        user_id=current_user.id,
        age=student_data.age,
        grade=student_data.grade,
        preferred_language=student_data.preferred_language,
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


# ============================================================
# GET CURRENT STUDENT PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=StudentResponse,
)
def get_my_student_profile(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
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
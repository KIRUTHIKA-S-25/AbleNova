from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.accessibility import AccessibilityProfile
from app.db.models.user import User
from app.db.models.student import Student
from app.schemas.accessibility import (
    AccessibilityProfileCreate,
    AccessibilityProfileResponse,
)


router = APIRouter(
    prefix="/accessibility",
    tags=["Accessibility"],
)


# ============================================================
# GET CURRENT STUDENT ACCESSIBILITY PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=AccessibilityProfileResponse,
)
def get_my_accessibility_profile(
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

    profile = (
        db.query(AccessibilityProfile)
        .filter(
            AccessibilityProfile.student_id == student.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accessibility profile not found",
        )

    return profile


# ============================================================
# CREATE CURRENT STUDENT ACCESSIBILITY PROFILE
# ============================================================

@router.post(
    "/me",
    response_model=AccessibilityProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_accessibility_profile(
    profile_data: AccessibilityProfileCreate,
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

    existing_profile = (
        db.query(AccessibilityProfile)
        .filter(
            AccessibilityProfile.student_id == student.id
        )
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Accessibility profile already exists",
        )

    profile = AccessibilityProfile(
        student_id=student.id,
        **profile_data.model_dump(),
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


# ============================================================
# UPDATE CURRENT STUDENT ACCESSIBILITY PROFILE
# ============================================================

@router.put(
    "/me",
    response_model=AccessibilityProfileResponse,
)
def update_my_accessibility_profile(
    profile_data: AccessibilityProfileCreate,
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

    profile = (
        db.query(AccessibilityProfile)
        .filter(
            AccessibilityProfile.student_id == student.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accessibility profile not found",
        )

    for field, value in profile_data.model_dump().items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile
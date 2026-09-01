from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.caregiver import Caregiver
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.caregiver import (
    CaregiverResponse,
)
from app.schemas.student import StudentResponse


router = APIRouter(
    prefix="/caregivers",
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

    # Return registered students in system accessible to caregiver
    students = db.query(Student).all()
    return students

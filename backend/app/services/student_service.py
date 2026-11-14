from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import AppException
from app.db.models import AccessibilityProfile, Student, User
from app.schemas.student import (
    AccessibilityProfileBase,
    AccessibilityProfileRead,
    AccessibilityProfileUpdate,
    StudentProfileResponse,
    StudentUpdate,
)


class StudentService:
    """Service layer handling student profile retrieval, updates, and accessibility preferences."""

    @staticmethod
    def get_student_by_user_id(db: Session, user_id: UUID) -> Student:
        """Finds student record associated with a user account."""
        student = db.execute(
            select(Student)
            .options(
                joinedload(Student.user),
                joinedload(Student.accessibility_profile),
            )
            .where(Student.user_id == user_id)
        ).scalar_one_or_none()
        if not student:
            raise AppException(
                code="NOT_FOUND",
                message="Student profile not found for this user account.",
                status_code=404,
            )
        return student

    @staticmethod
    def get_student_by_id(db: Session, student_id: UUID) -> Student:
        """Finds student record by student UUID."""
        student = db.execute(
            select(Student)
            .options(
                joinedload(Student.user),
                joinedload(Student.accessibility_profile),
            )
            .where(Student.id == student_id)
        ).scalar_one_or_none()
        if not student:
            raise AppException(
                code="NOT_FOUND",
                message="Student not found.",
                status_code=404,
            )
        return student

    @staticmethod
    def build_profile_response(student: Student) -> StudentProfileResponse:
        """Serializes a Student entity into the API_CONTRACT.md Section 3 response schema."""
        acc = student.accessibility_profile
        acc_schema = (
            AccessibilityProfileBase.model_validate(acc)
            if acc
            else AccessibilityProfileBase()
        )
        student_name = student.user.name if student.user else "Student"
        return StudentProfileResponse(
            student_id=str(student.id),
            name=student_name,
            age=student.age,
            grade=student.grade,
            preferred_language=student.preferred_language,
            accessibility=acc_schema,
        )

    @staticmethod
    def update_profile(
        db: Session,
        student: Student,
        update_data: StudentUpdate,
    ) -> StudentProfileResponse:
        """Updates editable student profile fields and nested accessibility preferences."""
        # 1. Update basic profile fields if provided
        if update_data.age is not None:
            student.age = update_data.age
        if update_data.grade is not None:
            student.grade = update_data.grade
        if update_data.preferred_language is not None:
            student.preferred_language = update_data.preferred_language.strip().lower()

        # Update optional user display name
        if update_data.name and student.user:
            student.user.name = update_data.name.strip()

        # 2. Update nested accessibility preferences if provided
        if update_data.accessibility is not None:
            StudentService.apply_accessibility_update(
                db, student, update_data.accessibility
            )

        db.commit()
        db.refresh(student)
        return StudentService.build_profile_response(student)

    @staticmethod
    def get_accessibility(student: Student) -> AccessibilityProfileRead:
        """Retrieves the accessibility profile for a student."""
        acc = student.accessibility_profile
        if not acc:
            acc = AccessibilityProfile(
                student_id=student.id,
                text_enabled=True,
                audio_enabled=False,
                captions_enabled=False,
                simplified_content=False,
                large_text=False,
                high_contrast=False,
                reduced_motion=False,
                keyboard_navigation=True,
            )
        return AccessibilityProfileRead(
            student_id=student.id,
            text_enabled=acc.text_enabled,
            audio_enabled=acc.audio_enabled,
            captions_enabled=acc.captions_enabled,
            simplified_content=acc.simplified_content,
            large_text=acc.large_text,
            high_contrast=acc.high_contrast,
            reduced_motion=acc.reduced_motion,
            keyboard_navigation=acc.keyboard_navigation,
            updated_at=acc.updated_at or datetime.now(timezone.utc),
        )

    @staticmethod
    def apply_accessibility_update(
        db: Session,
        student: Student,
        update_data: AccessibilityProfileUpdate,
    ) -> AccessibilityProfile:
        """Applies partial updates to a student's accessibility preferences."""
        acc = student.accessibility_profile
        if not acc:
            acc = AccessibilityProfile(student_id=student.id)
            db.add(acc)
            db.flush()

        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            if hasattr(acc, field) and value is not None:
                setattr(acc, field, value)

        acc.updated_at = datetime.now(timezone.utc)
        return acc

    @staticmethod
    def update_accessibility(
        db: Session,
        student: Student,
        update_data: AccessibilityProfileUpdate,
    ) -> AccessibilityProfileRead:
        """Updates accessibility preferences and commits changes."""
        acc = StudentService.apply_accessibility_update(db, student, update_data)
        db.commit()
        db.refresh(acc)
        return AccessibilityProfileRead(
            student_id=student.id,
            text_enabled=acc.text_enabled,
            audio_enabled=acc.audio_enabled,
            captions_enabled=acc.captions_enabled,
            simplified_content=acc.simplified_content,
            large_text=acc.large_text,
            high_contrast=acc.high_contrast,
            reduced_motion=acc.reduced_motion,
            keyboard_navigation=acc.keyboard_navigation,
            updated_at=acc.updated_at,
        )

import logging
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_student, verify_student_access
from app.core.exceptions import AppException
from app.db.database import get_db
from app.db.models import Student, User
from app.schemas.common import UserRole
from app.schemas.student import (
    AccessibilityProfileRead,
    AccessibilityProfileUpdate,
    StudentProfileResponse,
    StudentUpdate,
)
from app.services.student_service import StudentService

logger = logging.getLogger("ablenova.api.students")

router = APIRouter(tags=["Student Profile & Accessibility"])


# ==============================================================================
# Authenticated Student Own Profile
# ==============================================================================

@router.get(
    "/student/profile",
    response_model=StudentProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current student's own profile and accessibility preferences",
)
@router.get(
    "/students/profile",
    response_model=StudentProfileResponse,
    include_in_schema=False,
)
async def get_my_student_profile(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> StudentProfileResponse:
    """Retrieves profile and accessibility preferences for the authenticated student."""
    student = StudentService.get_student_by_user_id(db, current_user.id)
    return StudentService.build_profile_response(student)


@router.put(
    "/student/profile",
    response_model=StudentProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current student's own profile and accessibility preferences",
)
@router.put(
    "/students/profile",
    response_model=StudentProfileResponse,
    include_in_schema=False,
)
async def update_my_student_profile(
    update_data: StudentUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> StudentProfileResponse:
    """Updates editable profile attributes and nested accessibility preferences for current student."""
    student = StudentService.get_student_by_user_id(db, current_user.id)
    return StudentService.update_profile(db, student, update_data)


# ==============================================================================
# Role-Verified Student Profile by ID (Teacher / Caregiver / Admin / Student)
# ==============================================================================

@router.get(
    "/student/profile/{student_id}",
    response_model=StudentProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student profile by student ID with relationship-based authorization",
)
@router.get(
    "/students/{student_id}",
    response_model=StudentProfileResponse,
    include_in_schema=False,
)
@router.get(
    "/students/{student_id}/profile",
    response_model=StudentProfileResponse,
    include_in_schema=False,
)
async def get_student_profile_by_id(
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentProfileResponse:
    """Retrieves permitted student profile details.
    Enforces authorization:
    - Students may only view their own record.
    - Teachers may only view students linked in `teacher_students`.
    - Caregivers may only view students linked in `caregiver_students`.
    - Admins may view any student record.
    """
    student = verify_student_access(student_id, current_user, db)
    return StudentService.build_profile_response(student)


@router.put(
    "/student/profile/{student_id}",
    response_model=StudentProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update student profile by ID (Student self or Admin only)",
)
@router.put(
    "/students/{student_id}",
    response_model=StudentProfileResponse,
    include_in_schema=False,
)
async def update_student_profile_by_id(
    student_id: UUID,
    update_data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentProfileResponse:
    """Updates permitted profile fields for target student.
    Teachers and caregivers are strictly forbidden from modifying student profiles.
    """
    if current_user.role in (UserRole.TEACHER.value, UserRole.CAREGIVER.value):
        raise AppException(
            code="FORBIDDEN",
            message="Teachers and caregivers are not permitted to modify student profiles.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    student = verify_student_access(student_id, current_user, db)
    return StudentService.update_profile(db, student, update_data)


# ==============================================================================
# Standalone Accessibility Preferences Endpoints
# ==============================================================================

@router.get(
    "/student/accessibility",
    response_model=AccessibilityProfileRead,
    status_code=status.HTTP_200_OK,
    summary="Get current student's accessibility preferences",
)
@router.get(
    "/students/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
async def get_my_accessibility_preferences(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> AccessibilityProfileRead:
    """Retrieves current student's accessibility settings."""
    student = StudentService.get_student_by_user_id(db, current_user.id)
    return StudentService.get_accessibility(student)


@router.put(
    "/student/accessibility",
    response_model=AccessibilityProfileRead,
    status_code=status.HTTP_200_OK,
    summary="Update current student's accessibility preferences",
)
@router.patch(
    "/student/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
@router.put(
    "/students/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
@router.patch(
    "/students/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
async def update_my_accessibility_preferences(
    update_data: AccessibilityProfileUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
) -> AccessibilityProfileRead:
    """Updates current student's accessibility preferences with partial update support."""
    student = StudentService.get_student_by_user_id(db, current_user.id)
    return StudentService.update_accessibility(db, student, update_data)


@router.get(
    "/student/accessibility/{student_id}",
    response_model=AccessibilityProfileRead,
    status_code=status.HTTP_200_OK,
    summary="Get accessibility preferences by student ID (Authorized roles only)",
)
@router.get(
    "/students/{student_id}/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
async def get_student_accessibility_by_id(
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccessibilityProfileRead:
    """Retrieves student accessibility settings for authorized roles (Self, Linked Teacher, Linked Caregiver, Admin)."""
    student = verify_student_access(student_id, current_user, db)
    return StudentService.get_accessibility(student)


@router.put(
    "/student/accessibility/{student_id}",
    response_model=AccessibilityProfileRead,
    status_code=status.HTTP_200_OK,
    summary="Update accessibility preferences by student ID (Student self or Admin only)",
)
@router.patch(
    "/student/accessibility/{student_id}",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
@router.put(
    "/students/{student_id}/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
@router.patch(
    "/students/{student_id}/accessibility",
    response_model=AccessibilityProfileRead,
    include_in_schema=False,
)
async def update_student_accessibility_by_id(
    student_id: UUID,
    update_data: AccessibilityProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccessibilityProfileRead:
    """Updates student accessibility settings.
    Teachers and caregivers are not permitted to modify a student's accessibility preferences.
    """
    if current_user.role in (UserRole.TEACHER.value, UserRole.CAREGIVER.value):
        raise AppException(
            code="FORBIDDEN",
            message="Teachers and caregivers are not permitted to modify student accessibility preferences.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    student = verify_student_access(student_id, current_user, db)
    return StudentService.update_accessibility(db, student, update_data)


# ==============================================================================
# Placeholder for Future Phase Endpoints
# ==============================================================================

@router.get("/student/learning-path")
async def get_learning_path():
    return {"message": "Personalized learning path endpoint ready"}

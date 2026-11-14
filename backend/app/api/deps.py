import logging
from typing import Callable, List, Optional, Union
from uuid import UUID
from fastapi import Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import decode_access_token
from app.db.database import get_db
from app.db.models import CaregiverStudent, Student, TeacherStudent, User
from app.schemas.common import UserRole

logger = logging.getLogger("ablenova.auth.deps")

security_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that extracts, decodes, and validates the Bearer token,
    then loads the authenticated User from the database.
    """
    if not credentials:
        raise AppException(
            code="UNAUTHORIZED",
            message="Missing authentication token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise AppException(
            code="UNAUTHORIZED",
            message="Invalid or expired token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AppException(
            code="UNAUTHORIZED",
            message="Token payload missing subject claim",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        user_id = UUID(user_id_str)
    except (ValueError, TypeError):
        raise AppException(
            code="UNAUTHORIZED",
            message="Invalid user ID format in token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Load fresh user state directly from database to prevent trusting stale token claims
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise AppException(
            code="UNAUTHORIZED",
            message="User account not found or deactivated",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return user


def require_roles(*allowed_roles: Union[UserRole, str]) -> Callable:
    """Dependency factory enforcing role-based authorization.
    Verifies that the authenticated user possesses one of the designated roles.
    """
    role_strings = [r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles]

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in role_strings:
            logger.warning(
                "Access denied for user %s: has role '%s', requires one of %s",
                current_user.id,
                current_user.role,
                role_strings,
            )
            raise AppException(
                code="FORBIDDEN",
                message="Insufficient permissions for this resource",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        return current_user

    return role_checker


# Role-specific shortcut dependencies
require_student = require_roles(UserRole.STUDENT, UserRole.ADMIN)
require_teacher = require_roles(UserRole.TEACHER, UserRole.ADMIN)
require_caregiver = require_roles(UserRole.CAREGIVER, UserRole.ADMIN)
require_admin = require_roles(UserRole.ADMIN)


def verify_student_access(
    student_id: UUID,
    current_user: User,
    db: Session,
) -> Student:
    """Child privacy & authorization guard: enforces that only authorized entities
    can view or modify a student's educational data.
    
    Access Rules:
    1. Student: May only access their own records (student.user_id == current_user.id).
    2. Teacher: May only access students explicitly linked in TeacherStudent.
    3. Caregiver: May only access students explicitly linked in CaregiverStudent.
    4. Admin: Permitted system-wide access.
    
    Prevents Insecure Direct Object References (IDOR).
    """
    student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
    if not student:
        raise AppException(
            code="NOT_FOUND",
            message="Student not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # Student accessing own profile
    if current_user.role == UserRole.STUDENT.value:
        if student.user_id != current_user.id:
            raise AppException(
                code="FORBIDDEN",
                message="Students may only access their own records",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        return student

    # Teacher accessing linked student
    if current_user.role == UserRole.TEACHER.value:
        if not current_user.teacher:
            raise AppException(
                code="FORBIDDEN",
                message="Teacher profile not initialized",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        link = db.execute(
            select(TeacherStudent).where(
                TeacherStudent.teacher_id == current_user.teacher.id,
                TeacherStudent.student_id == student_id,
            )
        ).scalar_one_or_none()
        if not link:
            raise AppException(
                code="FORBIDDEN",
                message="You are not authorized to access this student's records",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        return student

    # Caregiver accessing linked student
    if current_user.role == UserRole.CAREGIVER.value:
        if not current_user.caregiver:
            raise AppException(
                code="FORBIDDEN",
                message="Caregiver profile not initialized",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        link = db.execute(
            select(CaregiverStudent).where(
                CaregiverStudent.caregiver_id == current_user.caregiver.id,
                CaregiverStudent.student_id == student_id,
            )
        ).scalar_one_or_none()
        if not link:
            raise AppException(
                code="FORBIDDEN",
                message="You are not authorized to access this student's records",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        return student

    # Admin access
    if current_user.role == UserRole.ADMIN.value:
        return student

    raise AppException(
        code="FORBIDDEN",
        message="Access denied for this role",
        status_code=status.HTTP_403_FORBIDDEN,
    )


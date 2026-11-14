import logging
import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import AppException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    is_account_locked,
    record_failed_login,
    reset_failed_logins,
    verify_password,
)
from app.db.database import get_db
from app.db.models import AccessibilityProfile, Caregiver, Student, Teacher, User
from app.schemas.common import UserRole
from app.schemas.user import (
    TokenRefreshRequest,
    TokenRefreshResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserRead,
)

logger = logging.getLogger("ablenova.api.auth")

router = APIRouter(tags=["Authentication"])


@router.post(
    "/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Creates a new user account, initializes the role-specific profile,
    and returns initial access & refresh tokens.
    """
    clean_email = user_in.email.lower().strip()

    # Check for existing account to prevent duplicate registration
    existing_user = db.execute(select(User).where(User.email == clean_email)).scalar_one_or_none()
    if existing_user:
        raise AppException(
            code="VALIDATION_ERROR",
            message="An account with this email already exists.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Hash password securely
    hashed_pwd = get_password_hash(user_in.password)

    # Create User record
    role_str = user_in.role.value if isinstance(user_in.role, UserRole) else str(user_in.role)
    new_user = User(
        id=uuid.uuid4(),
        email=clean_email,
        name=user_in.name.strip(),
        role=role_str,
        password_hash=hashed_pwd,
    )
    db.add(new_user)
    db.flush()

    # Initialize domain profile based on selected role
    if role_str == UserRole.STUDENT.value:
        student = Student(
            id=uuid.uuid4(),
            user_id=new_user.id,
            age=10,  # Default starter age, editable via student profile
            grade=5,  # Default starter grade
            preferred_language="en",
        )
        db.add(student)
        db.flush()
        # Initialize default privacy-preserving accessibility profile
        acc_profile = AccessibilityProfile(
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
        db.add(acc_profile)
    elif role_str == UserRole.TEACHER.value:
        teacher = Teacher(id=uuid.uuid4(), user_id=new_user.id)
        db.add(teacher)
    elif role_str == UserRole.CAREGIVER.value:
        caregiver = Caregiver(id=uuid.uuid4(), user_id=new_user.id)
        db.add(caregiver)

    db.commit()
    db.refresh(new_user)

    # Issue tokens
    access_token = create_access_token(
        subject=str(new_user.id),
        extra_claims={"role": new_user.role},
    )
    refresh_token = create_refresh_token(subject=str(new_user.id))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=UserRead.model_validate(new_user),
    )


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login and token issuance",
)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticates credentials, guards against brute-force attacks,
    and returns access & refresh tokens.
    """
    clean_email = login_data.email.lower().strip()

    # Check brute-force lockout
    if is_account_locked(clean_email):
        raise AppException(
            code="FORBIDDEN",
            message="Account temporarily locked due to excessive failed attempts. Please try again later.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    user = db.execute(select(User).where(User.email == clean_email)).scalar_one_or_none()

    # Generic error message to prevent user enumeration
    if not user or not verify_password(login_data.password, user.password_hash):
        record_failed_login(clean_email)
        raise AppException(
            code="UNAUTHORIZED",
            message="Invalid email or password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Reset failed attempts upon successful login
    reset_failed_logins(clean_email)

    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"role": user.role},
    )
    refresh_token = create_refresh_token(subject=str(user.id))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=UserRead.model_validate(user),
    )


@router.get(
    "/me",
    summary="Get current authenticated user (API_CONTRACT.md Section 2)",
)
@router.get(
    "/auth/me",
    summary="Get current authenticated user alternative path",
)
async def get_current_authenticated_user(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Returns profile for currently authenticated user adhering to API_CONTRACT.md Section 2."""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.post(
    "/auth/refresh",
    response_model=TokenRefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token using refresh token",
)
async def refresh_token(
    refresh_in: TokenRefreshRequest,
    db: Session = Depends(get_db),
) -> TokenRefreshResponse:
    """Rotates access token using a valid, non-expired refresh token."""
    payload = decode_refresh_token(refresh_in.refresh_token)
    if not payload:
        raise AppException(
            code="UNAUTHORIZED",
            message="Invalid or expired refresh token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AppException(
            code="UNAUTHORIZED",
            message="Refresh token missing subject claim.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise AppException(
            code="UNAUTHORIZED",
            message="Invalid user ID in refresh token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise AppException(
            code="UNAUTHORIZED",
            message="User account not found or deactivated.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    new_access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"role": user.role},
    )

    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="bearer",
    )


@router.post(
    "/auth/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout current user",
)
async def logout(
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    """Concludes session for the authenticated user."""
    return {"message": "Logged out successfully."}

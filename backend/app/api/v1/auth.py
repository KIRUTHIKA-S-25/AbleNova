import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import AppException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    hash_token,
    is_login_rate_limited,
    record_failed_login_attempt,
    reset_failed_login_attempts,
    revoke_all_user_refresh_tokens,
    revoke_refresh_token_by_hash,
    store_refresh_token,
    verify_password,
)
from app.db.database import get_db
from app.db.models import AccessibilityProfile, RefreshToken, Student, User
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
    summary="Register a new student account",
)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Creates a new student user account and default accessibility profile.
    
    Security Hardening:
    - Public registration is strictly restricted to the least-privileged role (student).
    - Any attempt to self-provision teacher, caregiver, or administrator roles is rejected.
    - Role is hardcoded on creation to prevent client-side privilege escalation.
    """
    clean_email = user_in.email.lower().strip()

    # Reject role escalation attempts
    if user_in.role and user_in.role != UserRole.STUDENT:
        raise AppException(
            code="ROLE_NOT_PERMITTED",
            message="Public registration is restricted to student accounts. Teacher, caregiver, and administrator roles require administrative provisioning.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Check for existing account
    existing_user = db.execute(select(User).where(User.email == clean_email)).scalar_one_or_none()
    if existing_user:
        raise AppException(
            code="VALIDATION_ERROR",
            message="An account with this email already exists.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Hash password securely
    hashed_pwd = get_password_hash(user_in.password)

    # Create User record: strictly enforce STUDENT role
    new_user = User(
        id=uuid.uuid4(),
        email=clean_email,
        name=user_in.name.strip(),
        role=UserRole.STUDENT.value,
        password_hash=hashed_pwd,
    )
    db.add(new_user)
    db.flush()

    # Provision student profile and default privacy-preserving accessibility profile
    student = Student(
        id=uuid.uuid4(),
        user_id=new_user.id,
        age=10,
        grade=5,
        preferred_language="en",
    )
    db.add(student)
    db.flush()

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
    db.commit()
    db.refresh(new_user)

    # Issue tokens
    access_token = create_access_token(
        subject=str(new_user.id),
        extra_claims={"role": new_user.role},
    )
    refresh_token = create_refresh_token(subject=str(new_user.id))
    refresh_payload = decode_refresh_token(refresh_token)
    if refresh_payload:
        store_refresh_token(db, new_user.id, refresh_token, refresh_payload)

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
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticates credentials using database-backed rate limiting and issues tokens."""
    clean_email = login_data.email.lower().strip()
    client_ip = request.client.host if request.client else None

    # Check database-backed rate limiting across all workers
    if is_login_rate_limited(db, clean_email):
        raise AppException(
            code="FORBIDDEN",
            message="Account temporarily locked due to excessive failed attempts. Please try again later.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    user = db.execute(select(User).where(User.email == clean_email)).scalar_one_or_none()

    # Generic error message to prevent user enumeration
    if not user or not verify_password(login_data.password, user.password_hash):
        record_failed_login_attempt(db, clean_email, ip_address=client_ip)
        raise AppException(
            code="UNAUTHORIZED",
            message="Invalid email or password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Clear failed attempts upon successful login
    reset_failed_login_attempts(db, clean_email)

    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"role": user.role},
    )
    refresh_token = create_refresh_token(subject=str(user.id))
    refresh_payload = decode_refresh_token(refresh_token)
    if refresh_payload:
        store_refresh_token(db, user.id, refresh_token, refresh_payload)

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
    summary="Refresh access token using refresh token with rotation and revocation",
)
async def refresh_token(
    refresh_in: TokenRefreshRequest,
    db: Session = Depends(get_db),
) -> TokenRefreshResponse:
    """Rotates refresh token and returns a new access token and rotated refresh token.
    Detects reuse of previously rotated or revoked tokens and revokes the entire token family.
    """
    raw_token = refresh_in.refresh_token
    payload = decode_refresh_token(raw_token)
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

    # Lookup persistent token record by hash
    token_h = hash_token(raw_token)
    token_record = db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_h)
    ).scalar_one_or_none()

    if not token_record:
        raise AppException(
            code="UNAUTHORIZED",
            message="Refresh token not recognized or already revoked.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Detect token reuse
    if token_record.revoked:
        logger.warning(
            "Security alert: Revoked refresh token presented for user %s. Revoking all active sessions.",
            user_id,
        )
        revoke_all_user_refresh_tokens(db, user_id)
        raise AppException(
            code="UNAUTHORIZED",
            message="Refresh token has been revoked. Token reuse detected.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Verify expiration
    now = datetime.now(timezone.utc)
    expires_at = token_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        token_record.revoked = True
        token_record.revoked_at = now
        db.commit()
        raise AppException(
            code="UNAUTHORIZED",
            message="Refresh token has expired.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise AppException(
            code="UNAUTHORIZED",
            message="User account not found or deactivated.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Rotate token: revoke current token
    token_record.revoked = True
    token_record.revoked_at = now

    # Issue new access token and rotated refresh token
    new_access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"role": user.role},
    )
    new_refresh_token = create_refresh_token(subject=str(user.id))
    new_payload = decode_refresh_token(new_refresh_token)
    if new_payload:
        store_refresh_token(db, user.id, new_refresh_token, new_payload)

    db.commit()

    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="bearer",
        refresh_token=new_refresh_token,
    )


@router.post(
    "/auth/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout current user and revoke refresh tokens",
)
async def logout(
    logout_data: Optional[TokenRefreshRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """Revokes active refresh tokens and concludes session for the authenticated user."""
    if logout_data and logout_data.refresh_token:
        token_h = hash_token(logout_data.refresh_token)
        revoke_refresh_token_by_hash(db, token_h)

    # Revoke all active refresh tokens for the user to guarantee complete session termination
    revoke_all_user_refresh_tokens(db, current_user.id)

    return {"message": "Logged out successfully. Refresh tokens revoked."}

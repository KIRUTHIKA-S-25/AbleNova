import uuid
from datetime import timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.config import Settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    is_login_rate_limited,
    record_failed_login_attempt,
    reset_failed_login_attempts,
)
from app.db.database import SessionLocal
from app.db.models import AccessibilityProfile, Caregiver, Student, Teacher, User


@pytest.mark.asyncio
async def test_public_registration_cannot_create_teacher_account(async_client: AsyncClient):
    """Verify that public registration rejects attempts to register as a teacher."""
    email = f"attacker_teacher_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Teacher Impersonator",
        "email": email,
        "password": "Password123!",
        "role": "teacher",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "ROLE_NOT_PERMITTED"

    # Ensure no teacher or user record was committed
    with SessionLocal() as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        assert user is None
        teacher = db.execute(select(Teacher).join(User).where(User.email == email)).scalar_one_or_none()
        assert teacher is None


@pytest.mark.asyncio
async def test_public_registration_cannot_create_caregiver_account(async_client: AsyncClient):
    """Verify that public registration rejects attempts to register as a caregiver."""
    email = f"attacker_caregiver_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Caregiver Impersonator",
        "email": email,
        "password": "Password123!",
        "role": "caregiver",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "ROLE_NOT_PERMITTED"

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        assert user is None
        caregiver = db.execute(select(Caregiver).join(User).where(User.email == email)).scalar_one_or_none()
        assert caregiver is None


@pytest.mark.asyncio
async def test_public_registration_cannot_create_admin_account(async_client: AsyncClient):
    """Verify that public registration rejects attempts to register as an admin."""
    email = f"attacker_admin_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Admin Impersonator",
        "email": email,
        "password": "Password123!",
        "role": "admin",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "ROLE_NOT_PERMITTED"

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        assert user is None


@pytest.mark.asyncio
async def test_legitimate_student_registration_succeeds(async_client: AsyncClient):
    """Verify that normal student registration succeeds and provisions student profile."""
    email = f"valid_student_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Valid Student",
        "email": email,
        "password": "Password123!",
        "role": "student",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "student"
    assert "access_token" in data
    assert "refresh_token" in data

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        assert user is not None
        assert user.role == "student"
        student = db.execute(select(Student).where(Student.user_id == user.id)).scalar_one_or_none()
        assert student is not None
        acc_prof = db.execute(select(AccessibilityProfile).where(AccessibilityProfile.student_id == student.id)).scalar_one_or_none()
        assert acc_prof is not None


@pytest.mark.asyncio
async def test_rotated_refresh_token_cannot_be_reused(async_client: AsyncClient):
    """Verify refresh-token rotation: old tokens are invalidated upon use, and reuse triggers revocation."""
    email = f"rotate_test_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "RotatePassword123!"
    reg_res = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Rotate User", "email": email, "password": pwd, "role": "student"},
    )
    assert reg_res.status_code == 201
    r1 = reg_res.json()["refresh_token"]

    # 1. Rotate R1 -> receive R2
    ref_res1 = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": r1})
    assert ref_res1.status_code == 200
    r2 = ref_res1.json()["refresh_token"]
    assert r2 != r1

    # 2. Attempt to reuse R1 (should be rejected as already revoked / rotated)
    ref_res2 = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": r1})
    assert ref_res2.status_code == 401
    assert "revoked" in ref_res2.json()["error"]["message"].lower()

    # 3. Reuse detection: presenting an already-revoked token invalidates active tokens in the family
    ref_res3 = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": r2})
    assert ref_res3.status_code == 401


@pytest.mark.asyncio
async def test_revoked_refresh_token_cannot_refresh(async_client: AsyncClient):
    """Verify that an explicitly revoked refresh token cannot generate new access tokens."""
    email = f"revoke_test_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "RevokePassword123!"
    reg_res = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Revoke User", "email": email, "password": pwd, "role": "student"},
    )
    tokens = reg_res.json()
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # Logout to revoke the refresh token
    logout_res = await async_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"refresh_token": refresh_token},
    )
    assert logout_res.status_code == 200

    # Attempt to refresh with the revoked token
    attempt_res = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert attempt_res.status_code == 401
    assert "revoked" in attempt_res.json()["error"]["message"].lower()


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(async_client: AsyncClient):
    """Verify that calling logout invalidates session refresh tokens."""
    email = f"logout_sec_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "LogoutPassword123!"
    reg_res = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Logout Sec", "email": email, "password": pwd, "role": "student"},
    )
    tokens = reg_res.json()
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # User logs out
    res = await async_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert res.status_code == 200

    # The refresh token must be rejected
    ref_res = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 401


@pytest.mark.asyncio
async def test_invalid_and_expired_refresh_tokens_rejected(async_client: AsyncClient):
    """Verify rejection of malformed tokens, expired tokens, and wrong token types."""
    # 1. Malformed token
    res1 = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": "malformed.jwt.token"})
    assert res1.status_code == 401

    # 2. Access token mistakenly passed as refresh token
    user_id = uuid.uuid4()
    access_tok = create_access_token(subject=str(user_id))
    res2 = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": access_tok})
    assert res2.status_code == 401

    # 3. Expired refresh token
    expired_tok = create_refresh_token(subject=str(user_id), expires_delta=timedelta(seconds=-10))
    res3 = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": expired_tok})
    assert res3.status_code == 401


@pytest.mark.asyncio
async def test_rate_limiting_across_database_storage(async_client: AsyncClient):
    """Verify that failed login attempts are persisted and enforced via database storage."""
    target_email = f"rate_limit_target_{uuid.uuid4().hex[:8]}@example.com"

    with SessionLocal() as db:
        # Initially not rate limited
        assert is_login_rate_limited(db, target_email) is False

        # Simulate 5 failed attempts recorded in database
        for _ in range(5):
            record_failed_login_attempt(db, target_email, ip_address="127.0.0.1")

        # Now rate limited
        assert is_login_rate_limited(db, target_email) is True

    # Attempting login via HTTP endpoint should yield 403 Forbidden
    res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": target_email, "password": "WrongPassword123!"},
    )
    assert res.status_code == 403
    assert "temporarily locked" in res.json()["error"]["message"].lower()

    # Reset attempts in database
    with SessionLocal() as db:
        reset_failed_login_attempts(db, target_email)
        assert is_login_rate_limited(db, target_email) is False


def test_production_configuration_rejects_insecure_secrets():
    """Verify that production environment rejects missing, default, or weak JWT secrets."""
    # 1. Rejects known development default secret in production
    with pytest.raises(ValueError, match="JWT_SECRET must be set to a secure"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET="dev-secret-key-change-in-production-ablenova",
        )

    # 2. Rejects weak short secret in production (< 32 chars)
    with pytest.raises(ValueError, match="at least 32 characters"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET="short-secret-under-32-chars!",
        )

    # 3. Accepts strong 32+ char secret in production
    prod_settings = Settings(
        ENVIRONMENT="production",
        JWT_SECRET="super-secure-production-jwt-signing-key-with-sufficient-entropy-32+",
    )
    assert prod_settings.ENVIRONMENT == "production"

    # 4. Allows dev default in development environment
    dev_settings = Settings(
        ENVIRONMENT="development",
        JWT_SECRET="dev-secret-key-change-in-production-ablenova",
    )
    assert dev_settings.ENVIRONMENT == "development"


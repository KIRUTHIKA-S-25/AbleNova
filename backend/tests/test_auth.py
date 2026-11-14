import uuid
from datetime import timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    get_password_hash,
    reset_failed_logins,
    verify_password,
)
from app.db.database import SessionLocal
from app.db.models import AccessibilityProfile, Caregiver, Student, Teacher, User


@pytest.mark.asyncio
async def test_registration_success(async_client: AsyncClient):
    """Verify successful registration initializes user, role profile, and tokens."""
    unique_email = f"student_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Alice Learner",
        "email": unique_email,
        "password": "StrongPassword123",
        "role": "student",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == unique_email
    assert data["user"]["name"] == "Alice Learner"
    assert data["user"]["role"] == "student"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

    # Verify domain profile initialized in database
    with SessionLocal() as db:
        user_record = db.execute(select(User).where(User.email == unique_email)).scalar_one_or_none()
        assert user_record is not None
        assert user_record.student is not None
        assert user_record.student.accessibility_profile is not None
        assert user_record.student.accessibility_profile.text_enabled is True


@pytest.mark.asyncio
async def test_registration_duplicate_email(async_client: AsyncClient):
    """Verify duplicate email registration is rejected with appropriate error format."""
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "First User",
        "email": email,
        "password": "Password123",
        "role": "student",
    }
    res1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    err = res2.json()
    assert "error" in err
    assert err["error"]["code"] == "VALIDATION_ERROR"
    assert "already exists" in err["error"]["message"].lower()


@pytest.mark.asyncio
async def test_registration_invalid_email(async_client: AsyncClient):
    """Verify email format validation."""
    payload = {
        "name": "Bad Email",
        "email": "not-an-email-at-all",
        "password": "Password123",
        "role": "student",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    err = response.json()
    assert err["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_registration_weak_password(async_client: AsyncClient):
    """Verify password length constraints."""
    payload = {
        "name": "Short Pwd",
        "email": f"short_{uuid.uuid4().hex[:8]}@example.com",
        "password": "123",
        "role": "student",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    err = response.json()
    assert err["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_password_hash_stored_not_plaintext(async_client: AsyncClient):
    """Verify passwords are salted and hashed with bcrypt, never stored as plaintext."""
    raw_password = "SecretPlaintextPassword!123"
    email = f"hash_test_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Hash Check",
        "email": email,
        "password": raw_password,
        "role": "teacher",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        assert user is not None
        assert user.password_hash != raw_password
        assert user.password_hash.startswith("$2b$") or user.password_hash.startswith("$2a$")
        assert verify_password(raw_password, user.password_hash) is True
        assert verify_password("WrongPassword", user.password_hash) is False


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    """Verify successful authentication and token issuance."""
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "LoginPassword456"
    reg_payload = {"name": "Login User", "email": email, "password": pwd, "role": "caregiver"}
    await async_client.post("/api/v1/auth/register", json=reg_payload)

    login_res = await async_client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email


@pytest.mark.asyncio
async def test_login_incorrect_password(async_client: AsyncClient):
    """Verify invalid password returns generic 401 to prevent enumeration."""
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "CorrectPassword123"
    await async_client.post("/api/v1/auth/register", json={"name": "U", "email": email, "password": pwd, "role": "student"})

    response = await async_client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword"})
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"
    assert data["error"]["message"] == "Invalid email or password."


@pytest.mark.asyncio
async def test_login_unknown_account(async_client: AsyncClient):
    """Verify non-existent account returns same generic 401 error as wrong password."""
    response = await async_client.post("/api/v1/auth/login", json={"email": "nonexistent_account@example.com", "password": "AnyPassword"})
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"
    assert data["error"]["message"] == "Invalid email or password."


@pytest.mark.asyncio
async def test_login_rate_limiting_lockout(async_client: AsyncClient):
    """Verify brute-force protection locks out account after excessive failed attempts."""
    email = f"brute_{uuid.uuid4().hex[:8]}@example.com"
    reset_failed_logins(email)
    await async_client.post("/api/v1/auth/register", json={"name": "Brute", "email": email, "password": "RealPassword123", "role": "student"})

    # Trigger 5 failed attempts
    for _ in range(5):
        await async_client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword"})

    # 6th attempt should be locked out
    locked_res = await async_client.post("/api/v1/auth/login", json={"email": email, "password": "RealPassword123"})
    assert locked_res.status_code == 403
    assert locked_res.json()["error"]["code"] == "FORBIDDEN"
    assert "locked" in locked_res.json()["error"]["message"].lower()

    # Clean up
    reset_failed_logins(email)


@pytest.mark.asyncio
async def test_token_refresh_lifecycle(async_client: AsyncClient):
    """Verify token refresh generates new access token and rejects invalid/access tokens."""
    email = f"ref_{uuid.uuid4().hex[:8]}@example.com"
    reg = await async_client.post("/api/v1/auth/register", json={"name": "Ref", "email": email, "password": "Password123", "role": "student"})
    tokens = reg.json()
    refresh_token = tokens["refresh_token"]
    access_token = tokens["access_token"]

    # 1. Refresh with valid refresh token
    ref_res = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    assert "access_token" in ref_data

    # 2. Refresh with access token MUST be rejected
    bad_ref = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})
    assert bad_ref.status_code == 401
    assert bad_ref.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_current_user_me(async_client: AsyncClient):
    """Verify GET /api/v1/me and GET /api/v1/auth/me return authenticated user details."""
    email = f"me_{uuid.uuid4().hex[:8]}@example.com"
    reg = await async_client.post("/api/v1/auth/register", json={"name": "Me User", "email": email, "password": "Password123", "role": "student"})
    token = reg.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res1 = await async_client.get("/api/v1/me", headers=headers)
    assert me_res1.status_code == 200
    data1 = me_res1.json()
    assert data1["email"] == email
    assert data1["name"] == "Me User"
    assert data1["role"] == "student"

    me_res2 = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_res2.status_code == 200
    data2 = me_res2.json()
    assert data2["email"] == email


@pytest.mark.asyncio
async def test_logout_endpoint(async_client: AsyncClient):
    """Verify logout endpoint responds cleanly."""
    email = f"logout_{uuid.uuid4().hex[:8]}@example.com"
    reg = await async_client.post("/api/v1/auth/register", json={"name": "Logout", "email": email, "password": "Password123", "role": "student"})
    token = reg.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    res = await async_client.post("/api/v1/auth/logout", headers=headers)
    assert res.status_code == 200
    assert "logged out" in res.json()["message"].lower()

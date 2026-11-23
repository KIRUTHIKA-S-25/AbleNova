import uuid
from datetime import timedelta
import pytest
from httpx import AsyncClient
from jose import jwt

from app.api.deps import (
    get_current_user,
    require_admin,
    require_caregiver,
    require_roles,
    require_student,
    require_teacher,
    verify_student_access,
)
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import create_access_token, create_refresh_token
from app.db.database import SessionLocal
from app.db.models import (
    AccessibilityProfile,
    Caregiver,
    CaregiverStudent,
    Student,
    Teacher,
    TeacherStudent,
    User,
)
from app.schemas.common import UserRole


@pytest.mark.asyncio
async def test_authentication_missing_token(async_client: AsyncClient):
    """Verify accessing protected endpoint without token returns 401."""
    res = await async_client.get("/api/v1/me")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"
    assert "missing" in res.json()["error"]["message"].lower()


@pytest.mark.asyncio
async def test_authentication_malformed_token(async_client: AsyncClient):
    """Verify malformed authorization token returns 401."""
    headers = {"Authorization": "Bearer malformed.token.gibberish"}
    res = await async_client.get("/api/v1/me", headers=headers)
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_authentication_expired_token(async_client: AsyncClient):
    """Verify expired token returns 401."""
    user_id = uuid.uuid4()
    expired_token = create_access_token(
        subject=str(user_id),
        expires_delta=timedelta(seconds=-10),
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    res = await async_client.get("/api/v1/me", headers=headers)
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_authentication_invalid_signature(async_client: AsyncClient):
    """Verify token signed with an invalid/untrusted secret returns 401."""
    tampered_token = jwt.encode(
        {"sub": str(uuid.uuid4()), "type": "access"},
        "wrong-untrusted-secret-key",
        algorithm="HS256",
    )
    headers = {"Authorization": f"Bearer {tampered_token}"}
    res = await async_client.get("/api/v1/me", headers=headers)
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_authentication_incorrect_token_type(async_client: AsyncClient):
    """Verify refresh token cannot be used to access regular protected endpoints."""
    refresh_tok = create_refresh_token(subject=str(uuid.uuid4()))
    headers = {"Authorization": f"Bearer {refresh_tok}"}
    res = await async_client.get("/api/v1/me", headers=headers)
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


def test_role_based_authorization_checks():
    """Verify role-based authorization dependency factories."""
    student_user = User(id=uuid.uuid4(), email="s@test.org", name="S", role="student", password_hash="h")
    teacher_user = User(id=uuid.uuid4(), email="t@test.org", name="T", role="teacher", password_hash="h")
    caregiver_user = User(id=uuid.uuid4(), email="c@test.org", name="C", role="caregiver", password_hash="h")

    # Student checker
    check_student = require_roles("student")
    assert check_student(student_user) == student_user
    with pytest.raises(AppException) as exc:
        check_student(teacher_user)
    assert exc.value.status_code == 403
    assert exc.value.code == "FORBIDDEN"

    # Teacher checker
    check_teacher = require_roles("teacher")
    assert check_teacher(teacher_user) == teacher_user
    with pytest.raises(AppException) as exc:
        check_teacher(student_user)
    assert exc.value.status_code == 403

    # Caregiver checker
    check_caregiver = require_roles("caregiver")
    assert check_caregiver(caregiver_user) == caregiver_user
    with pytest.raises(AppException) as exc:
        check_caregiver(teacher_user)
    assert exc.value.status_code == 403


def test_student_data_protection_student_self_access():
    """Verify students can access only their own records, not other students."""
    with SessionLocal() as db:
        uid = uuid.uuid4().hex[:8]
        user_a = User(id=uuid.uuid4(), email=f"sa_{uid}@test.org", name="Student A", role="student", password_hash="h")
        user_b = User(id=uuid.uuid4(), email=f"sb_{uid}@test.org", name="Student B", role="student", password_hash="h")
        db.add_all([user_a, user_b])
        db.flush()

        student_a = Student(id=uuid.uuid4(), user_id=user_a.id, age=10, grade=5)
        student_b = Student(id=uuid.uuid4(), user_id=user_b.id, age=11, grade=6)
        db.add_all([student_a, student_b])
        db.commit()

        # 1. Student A accessing own record: Permitted
        verified = verify_student_access(student_a.id, user_a, db)
        assert verified.id == student_a.id

        # 2. Student A accessing Student B's record: FORBIDDEN
        with pytest.raises(AppException) as exc:
            verify_student_access(student_b.id, user_a, db)
        assert exc.value.status_code == 403
        assert exc.value.code == "FORBIDDEN"
        assert "own records" in exc.value.message.lower()


def test_student_data_protection_teacher_access():
    """Verify teachers can access ONLY linked students, never unlinked students."""
    with SessionLocal() as db:
        uid = uuid.uuid4().hex[:8]
        teacher_u = User(id=uuid.uuid4(), email=f"teach_{uid}@test.org", name="T Auth", role="teacher", password_hash="h")
        student_u1 = User(id=uuid.uuid4(), email=f"st1_{uid}@test.org", name="St 1", role="student", password_hash="h")
        student_u2 = User(id=uuid.uuid4(), email=f"st2_{uid}@test.org", name="St 2", role="student", password_hash="h")
        db.add_all([teacher_u, student_u1, student_u2])
        db.flush()

        teacher = Teacher(id=uuid.uuid4(), user_id=teacher_u.id)
        student1 = Student(id=uuid.uuid4(), user_id=student_u1.id, age=10, grade=5)
        student2 = Student(id=uuid.uuid4(), user_id=student_u2.id, age=12, grade=7)
        db.add_all([teacher, student1, student2])
        db.flush()

        # Link student1 to teacher
        link = TeacherStudent(teacher_id=teacher.id, student_id=student1.id)
        db.add(link)
        db.commit()

        # Load fresh teacher relationship
        db.refresh(teacher_u)

        # 1. Accessing linked student1: Permitted
        allowed_student = verify_student_access(student1.id, teacher_u, db)
        assert allowed_student.id == student1.id

        # 2. Accessing unlinked student2: FORBIDDEN
        with pytest.raises(AppException) as exc:
            verify_student_access(student2.id, teacher_u, db)
        assert exc.value.status_code == 403
        assert exc.value.code == "FORBIDDEN"
        assert "not authorized" in exc.value.message.lower()


def test_student_data_protection_caregiver_access():
    """Verify caregivers can access ONLY linked students, never unlinked students."""
    with SessionLocal() as db:
        uid = uuid.uuid4().hex[:8]
        caregiver_u = User(id=uuid.uuid4(), email=f"care_{uid}@test.org", name="C Auth", role="caregiver", password_hash="h")
        student_u1 = User(id=uuid.uuid4(), email=f"st_care1_{uid}@test.org", name="St Care 1", role="student", password_hash="h")
        student_u2 = User(id=uuid.uuid4(), email=f"st_care2_{uid}@test.org", name="St Care 2", role="student", password_hash="h")
        db.add_all([caregiver_u, student_u1, student_u2])
        db.flush()

        caregiver = Caregiver(id=uuid.uuid4(), user_id=caregiver_u.id)
        student1 = Student(id=uuid.uuid4(), user_id=student_u1.id, age=10, grade=5)
        student2 = Student(id=uuid.uuid4(), user_id=student_u2.id, age=12, grade=7)
        db.add_all([caregiver, student1, student2])
        db.flush()

        # Link student1 to caregiver
        link = CaregiverStudent(caregiver_id=caregiver.id, student_id=student1.id, relationship_type="parent")
        db.add(link)
        db.commit()

        # Load fresh caregiver relationship
        db.refresh(caregiver_u)

        # 1. Accessing linked student1: Permitted
        allowed = verify_student_access(student1.id, caregiver_u, db)
        assert allowed.id == student1.id

        # 2. Accessing unlinked student2: FORBIDDEN
        with pytest.raises(AppException) as exc:
            verify_student_access(student2.id, caregiver_u, db)
        assert exc.value.status_code == 403
        assert exc.value.code == "FORBIDDEN"


def test_student_data_protection_nonexistent_student():
    """Verify requesting non-existent student returns 404."""
    with SessionLocal() as db:
        uid = uuid.uuid4().hex[:8]
        user = User(id=uuid.uuid4(), email=f"random_{uid}@test.org", name="Random", role="admin", password_hash="h")
        db.add(user)
        db.commit()

        non_existent_id = uuid.uuid4()
        with pytest.raises(AppException) as exc:
            verify_student_access(non_existent_id, user, db)
        assert exc.value.status_code == 404
        assert exc.value.code == "NOT_FOUND"


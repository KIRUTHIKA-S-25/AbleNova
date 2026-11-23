import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.security import create_access_token, get_password_hash
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


@pytest.fixture
def test_users_and_students():
    """Provisions a test dataset containing two students, two teachers, and two caregivers."""
    with SessionLocal() as db:
        uid = uuid.uuid4().hex[:8]

        # 1. Student A
        user_sa = User(
            id=uuid.uuid4(),
            email=f"sa_{uid}@test.org",
            name="Alice Student",
            role="student",
            password_hash=get_password_hash("Password123!"),
        )
        student_a = Student(
            id=uuid.uuid4(),
            user_id=user_sa.id,
            age=10,
            grade=5,
            preferred_language="en",
        )
        acc_a = AccessibilityProfile(
            student_id=student_a.id,
            text_enabled=True,
            audio_enabled=False,
            captions_enabled=False,
            simplified_content=False,
            large_text=False,
            high_contrast=False,
            reduced_motion=False,
            keyboard_navigation=True,
        )

        # 2. Student B
        user_sb = User(
            id=uuid.uuid4(),
            email=f"sb_{uid}@test.org",
            name="Bob Student",
            role="student",
            password_hash=get_password_hash("Password123!"),
        )
        student_b = Student(
            id=uuid.uuid4(),
            user_id=user_sb.id,
            age=12,
            grade=7,
            preferred_language="es",
        )
        acc_b = AccessibilityProfile(
            student_id=student_b.id,
            text_enabled=True,
            audio_enabled=True,
            captions_enabled=True,
            simplified_content=True,
            large_text=True,
            high_contrast=True,
            reduced_motion=True,
            keyboard_navigation=True,
        )

        # 3. Teacher 1 (Linked to Student A only)
        user_t1 = User(
            id=uuid.uuid4(),
            email=f"t1_{uid}@test.org",
            name="Teacher One",
            role="teacher",
            password_hash=get_password_hash("Password123!"),
        )
        teacher_1 = Teacher(id=uuid.uuid4(), user_id=user_t1.id)

        # 4. Teacher 2 (Linked to Student B only)
        user_t2 = User(
            id=uuid.uuid4(),
            email=f"t2_{uid}@test.org",
            name="Teacher Two",
            role="teacher",
            password_hash=get_password_hash("Password123!"),
        )
        teacher_2 = Teacher(id=uuid.uuid4(), user_id=user_t2.id)

        # 5. Caregiver 1 (Linked to Student A only)
        user_c1 = User(
            id=uuid.uuid4(),
            email=f"c1_{uid}@test.org",
            name="Caregiver One",
            role="caregiver",
            password_hash=get_password_hash("Password123!"),
        )
        caregiver_1 = Caregiver(id=uuid.uuid4(), user_id=user_c1.id)

        # 6. Caregiver 2 (Linked to Student B only)
        user_c2 = User(
            id=uuid.uuid4(),
            email=f"c2_{uid}@test.org",
            name="Caregiver Two",
            role="caregiver",
            password_hash=get_password_hash("Password123!"),
        )
        caregiver_2 = Caregiver(id=uuid.uuid4(), user_id=user_c2.id)

        db.add_all([
            user_sa, student_a, acc_a,
            user_sb, student_b, acc_b,
            user_t1, teacher_1,
            user_t2, teacher_2,
            user_c1, caregiver_1,
            user_c2, caregiver_2,
        ])
        db.flush()

        # Link Teacher 1 -> Student A
        link_t1_sa = TeacherStudent(teacher_id=teacher_1.id, student_id=student_a.id)
        # Link Teacher 2 -> Student B
        link_t2_sb = TeacherStudent(teacher_id=teacher_2.id, student_id=student_b.id)
        # Link Caregiver 1 -> Student A
        link_c1_sa = CaregiverStudent(caregiver_id=caregiver_1.id, student_id=student_a.id, relationship_type="mother")
        # Link Caregiver 2 -> Student B
        link_c2_sb = CaregiverStudent(caregiver_id=caregiver_2.id, student_id=student_b.id, relationship_type="father")

        db.add_all([link_t1_sa, link_t2_sb, link_c1_sa, link_c2_sb])
        db.commit()

        tokens = {
            "token_sa": create_access_token(subject=str(user_sa.id), extra_claims={"role": "student"}),
            "token_sb": create_access_token(subject=str(user_sb.id), extra_claims={"role": "student"}),
            "token_t1": create_access_token(subject=str(user_t1.id), extra_claims={"role": "teacher"}),
            "token_t2": create_access_token(subject=str(user_t2.id), extra_claims={"role": "teacher"}),
            "token_c1": create_access_token(subject=str(user_c1.id), extra_claims={"role": "caregiver"}),
            "token_c2": create_access_token(subject=str(user_c2.id), extra_claims={"role": "caregiver"}),
            "student_a_id": str(student_a.id),
            "student_b_id": str(student_b.id),
            "user_sa_id": str(user_sa.id),
        }
        return tokens


# ==============================================================================
# 1. Student Profile Tests (Requirements 1-6)
# ==============================================================================

@pytest.mark.asyncio
async def test_01_authenticated_student_can_retrieve_own_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 1: Authenticated student can retrieve their own profile."""
    token = test_users_and_students["token_sa"]
    student_id = test_users_and_students["student_a_id"]

    res = await async_client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_id
    assert data["name"] == "Alice Student"
    assert data["age"] == 10
    assert data["grade"] == 5
    assert data["preferred_language"] == "en"
    assert "accessibility" in data
    assert data["accessibility"]["keyboard_navigation"] is True


@pytest.mark.asyncio
async def test_02_student_can_update_permitted_profile_fields(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 2: Student can update permitted profile fields."""
    token = test_users_and_students["token_sa"]
    student_id = test_users_and_students["student_a_id"]

    update_payload = {
        "age": 11,
        "grade": 6,
        "preferred_language": "fr",
        "accessibility": {
            "large_text": True,
            "high_contrast": True,
        },
    }
    res = await async_client.put(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token}"},
        json=update_payload,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_id
    assert data["age"] == 11
    assert data["grade"] == 6
    assert data["preferred_language"] == "fr"
    assert data["accessibility"]["large_text"] is True
    assert data["accessibility"]["high_contrast"] is True

    # Verify database persistence
    with SessionLocal() as db:
        st = db.execute(select(Student).where(Student.id == uuid.UUID(student_id))).scalar_one()
        assert st.age == 11
        assert st.grade == 6
        assert st.preferred_language == "fr"
        assert st.accessibility_profile.large_text is True


@pytest.mark.asyncio
async def test_03_student_cannot_update_protected_fields(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 3: Student cannot update protected fields such as role or account identity."""
    token = test_users_and_students["token_sa"]
    student_id = test_users_and_students["student_a_id"]
    user_id = test_users_and_students["user_sa_id"]

    malicious_payload = {
        "role": "teacher",
        "id": str(uuid.uuid4()),
        "user_id": str(uuid.uuid4()),
        "email": "hacker@evil.com",
        "password": "HackedPassword123!",
        "age": 10,
    }
    res = await async_client.put(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token}"},
        json=malicious_payload,
    )
    assert res.status_code == 200

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.id == uuid.UUID(user_id))).scalar_one()
        assert user.role == "student"
        assert user.email != "hacker@evil.com"
        assert user.id == uuid.UUID(user_id)


@pytest.mark.asyncio
async def test_04_student_cannot_retrieve_another_student_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 4: Student cannot retrieve another student's profile."""
    token_sa = test_users_and_students["token_sa"]
    student_b_id = test_users_and_students["student_b_id"]

    res = await async_client.get(
        f"/api/v1/student/profile/{student_b_id}",
        headers={"Authorization": f"Bearer {token_sa}"},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_05_student_cannot_update_another_student_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 5: Student cannot update another student's profile."""
    token_sa = test_users_and_students["token_sa"]
    student_b_id = test_users_and_students["student_b_id"]

    res = await async_client.put(
        f"/api/v1/student/profile/{student_b_id}",
        headers={"Authorization": f"Bearer {token_sa}"},
        json={"age": 15},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_06_unauthenticated_requests_are_rejected(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 6: Unauthenticated requests are rejected."""
    student_id = test_users_and_students["student_a_id"]

    res_get = await async_client.get("/api/v1/student/profile")
    assert res_get.status_code == 401

    res_put = await async_client.put("/api/v1/student/profile", json={"age": 10})
    assert res_put.status_code == 401

    res_by_id = await async_client.get(f"/api/v1/student/profile/{student_id}")
    assert res_by_id.status_code == 401


# ==============================================================================
# 2. Teacher and Caregiver Access Tests (Requirements 7-13)
# ==============================================================================

@pytest.mark.asyncio
async def test_07_linked_teacher_can_retrieve_student_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 7: Linked teacher can retrieve the permitted student profile."""
    token_t1 = test_users_and_students["token_t1"]
    student_a_id = test_users_and_students["student_a_id"]

    # Test via /student/profile/{student_id}
    res = await async_client.get(
        f"/api/v1/student/profile/{student_a_id}",
        headers={"Authorization": f"Bearer {token_t1}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_a_id
    assert data["name"] == "Alice Student"

    # Test via /teacher/students/{student_id}
    res_t = await async_client.get(
        f"/api/v1/teacher/students/{student_a_id}",
        headers={"Authorization": f"Bearer {token_t1}"},
    )
    assert res_t.status_code == 200
    assert res_t.json()["student_id"] == student_a_id


@pytest.mark.asyncio
async def test_08_unlinked_teacher_cannot_retrieve_student_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 8: Unlinked teacher cannot retrieve that profile."""
    token_t1 = test_users_and_students["token_t1"]  # Linked to A only
    student_b_id = test_users_and_students["student_b_id"]  # Unlinked to T1

    res = await async_client.get(
        f"/api/v1/student/profile/{student_b_id}",
        headers={"Authorization": f"Bearer {token_t1}"},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_09_linked_caregiver_can_retrieve_student_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 9: Linked caregiver can retrieve the permitted student profile."""
    token_c1 = test_users_and_students["token_c1"]
    student_a_id = test_users_and_students["student_a_id"]

    res = await async_client.get(
        f"/api/v1/student/profile/{student_a_id}",
        headers={"Authorization": f"Bearer {token_c1}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_a_id
    assert data["name"] == "Alice Student"

    # Test via /caregiver/student/{student_id}
    res_c = await async_client.get(
        f"/api/v1/caregiver/student/{student_a_id}",
        headers={"Authorization": f"Bearer {token_c1}"},
    )
    assert res_c.status_code == 200
    assert res_c.json()["student_id"] == student_a_id


@pytest.mark.asyncio
async def test_10_unlinked_caregiver_cannot_retrieve_student_profile(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 10: Unlinked caregiver cannot retrieve that profile."""
    token_c1 = test_users_and_students["token_c1"]  # Linked to A only
    student_b_id = test_users_and_students["student_b_id"]  # Unlinked to C1

    res = await async_client.get(
        f"/api/v1/student/profile/{student_b_id}",
        headers={"Authorization": f"Bearer {token_c1}"},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_11_teacher_cannot_access_student_linked_only_to_another_teacher(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 11: Teacher cannot access a student linked only to another teacher."""
    token_t2 = test_users_and_students["token_t2"]  # Linked only to B
    student_a_id = test_users_and_students["student_a_id"]  # Linked only to T1

    res = await async_client.get(
        f"/api/v1/student/profile/{student_a_id}",
        headers={"Authorization": f"Bearer {token_t2}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_12_caregiver_cannot_access_student_linked_only_to_another_caregiver(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 12: Caregiver cannot access a student linked only to another caregiver."""
    token_c2 = test_users_and_students["token_c2"]  # Linked only to B
    student_a_id = test_users_and_students["student_a_id"]  # Linked only to C1

    res = await async_client.get(
        f"/api/v1/student/profile/{student_a_id}",
        headers={"Authorization": f"Bearer {token_c2}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_13_unauthorized_roles_cannot_use_restricted_endpoints(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 13: Unauthorized roles cannot use restricted endpoints."""
    token_t1 = test_users_and_students["token_t1"]

    # Teacher attempting to call student-only self-profile endpoint /student/profile
    res = await async_client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token_t1}"},
    )
    assert res.status_code in (403, 404)


# ==============================================================================
# 3. Accessibility Preferences Tests (Requirements 14-20)
# ==============================================================================

@pytest.mark.asyncio
async def test_14_student_can_retrieve_accessibility_preferences(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 14: Student can retrieve their accessibility preferences."""
    token = test_users_and_students["token_sa"]
    student_id = test_users_and_students["student_a_id"]

    res = await async_client.get(
        "/api/v1/student/accessibility",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_id
    assert "keyboard_navigation" in data
    assert "text_enabled" in data
    assert "high_contrast" in data


@pytest.mark.asyncio
async def test_15_student_can_update_valid_accessibility_preferences(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 15: Student can update valid accessibility preferences."""
    token = test_users_and_students["token_sa"]
    student_id = test_users_and_students["student_a_id"]

    update_payload = {
        "large_text": True,
        "captions_enabled": True,
        "reduced_motion": True,
    }
    res = await async_client.put(
        "/api/v1/student/accessibility",
        headers={"Authorization": f"Bearer {token}"},
        json=update_payload,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["large_text"] is True
    assert data["captions_enabled"] is True
    assert data["reduced_motion"] is True

    # Check database persistence
    with SessionLocal() as db:
        acc = db.execute(
            select(AccessibilityProfile).where(
                AccessibilityProfile.student_id == uuid.UUID(student_id)
            )
        ).scalar_one()
        assert acc.large_text is True
        assert acc.captions_enabled is True
        assert acc.reduced_motion is True


@pytest.mark.asyncio
async def test_16_invalid_values_are_rejected(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 16: Invalid values are rejected."""
    token = test_users_and_students["token_sa"]

    # 1. Non-boolean string for boolean accessibility option
    res1 = await async_client.put(
        "/api/v1/student/accessibility",
        headers={"Authorization": f"Bearer {token}"},
        json={"large_text": "non_boolean_string"},
    )
    assert res1.status_code == 422

    # 2. Out-of-range student age (< 3 or > 25)
    res2 = await async_client.put(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"age": 100},
    )
    assert res2.status_code == 422

    # 3. Invalid grade (< 1 or > 12)
    res3 = await async_client.put(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"grade": 0},
    )
    assert res3.status_code == 422


@pytest.mark.asyncio
async def test_17_partial_updates_preserve_omitted_fields(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 17: Partial updates preserve fields not included in the request."""
    token = test_users_and_students["token_sa"]
    student_id = test_users_and_students["student_a_id"]

    # Set initial state
    await async_client.put(
        "/api/v1/student/accessibility",
        headers={"Authorization": f"Bearer {token}"},
        json={"text_enabled": True, "audio_enabled": True, "high_contrast": False},
    )

    # Partial update: modify only high_contrast
    res = await async_client.patch(
        "/api/v1/student/accessibility",
        headers={"Authorization": f"Bearer {token}"},
        json={"high_contrast": True},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["high_contrast"] is True
    # Preserved previously set fields
    assert data["text_enabled"] is True
    assert data["audio_enabled"] is True


@pytest.mark.asyncio
async def test_18_student_cannot_update_another_student_preferences(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 18: Student cannot update another student's preferences."""
    token_sa = test_users_and_students["token_sa"]
    student_b_id = test_users_and_students["student_b_id"]

    res = await async_client.put(
        f"/api/v1/student/accessibility/{student_b_id}",
        headers={"Authorization": f"Bearer {token_sa}"},
        json={"large_text": True},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_19_teacher_and_caregiver_cannot_modify_student_preferences(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 19: Teacher/caregiver cannot modify preferences unless explicitly permitted by API contract."""
    token_t1 = test_users_and_students["token_t1"]
    token_c1 = test_users_and_students["token_c1"]
    student_a_id = test_users_and_students["student_a_id"]

    # Teacher attempted modification
    res_t = await async_client.put(
        f"/api/v1/student/accessibility/{student_a_id}",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"large_text": True},
    )
    assert res_t.status_code == 403
    assert "not permitted" in res_t.json()["error"]["message"].lower()

    # Caregiver attempted modification
    res_c = await async_client.put(
        f"/api/v1/student/accessibility/{student_a_id}",
        headers={"Authorization": f"Bearer {token_c1}"},
        json={"large_text": True},
    )
    assert res_c.status_code == 403
    assert "not permitted" in res_c.json()["error"]["message"].lower()


@pytest.mark.asyncio
async def test_20_responses_do_not_expose_credentials_or_unrelated_data(
    async_client: AsyncClient, test_users_and_students
):
    """Requirement 20: Responses do not expose unrelated personal, credentials, or authentication data."""
    token = test_users_and_students["token_sa"]

    res = await async_client.get(
        "/api/v1/student/profile",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()

    # Forbidden fields
    assert "password" not in data
    assert "password_hash" not in data
    assert "token" not in data
    assert "access_token" not in data
    assert "refresh_token" not in data
    assert "diagnosis" not in data
    assert "medical" not in data
    assert "user_id" not in data

    acc = data["accessibility"]
    assert "diagnosis" not in acc
    assert "condition" not in acc
    assert "disability" not in acc

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
    LearningObjective,
    Lesson,
    LessonResource,
    Student,
    StudentTopicMastery,
    Subject,
    Teacher,
    TeacherStudent,
    Topic,
    User,
)


@pytest.fixture
def curriculum_test_data():
    """Provisions a test dataset with teachers, caregivers, students, and relationship links."""
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
            audio_enabled=True,
            captions_enabled=True,
            simplified_content=True,
            large_text=False,
            high_contrast=True,
            reduced_motion=True,
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
            audio_enabled=False,
            captions_enabled=False,
            simplified_content=False,
        )

        # 3. Teacher 1 (Linked to Student A)
        user_t1 = User(
            id=uuid.uuid4(),
            email=f"t1_{uid}@test.org",
            name="Teacher One",
            role="teacher",
            password_hash=get_password_hash("Password123!"),
        )
        teacher_1 = Teacher(id=uuid.uuid4(), user_id=user_t1.id)

        # 4. Teacher 2 (Linked to Student B, NOT Student A)
        user_t2 = User(
            id=uuid.uuid4(),
            email=f"t2_{uid}@test.org",
            name="Teacher Two",
            role="teacher",
            password_hash=get_password_hash("Password123!"),
        )
        teacher_2 = Teacher(id=uuid.uuid4(), user_id=user_t2.id)

        # 5. Caregiver 1 (Linked to Student A)
        user_c1 = User(
            id=uuid.uuid4(),
            email=f"c1_{uid}@test.org",
            name="Caregiver One",
            role="caregiver",
            password_hash=get_password_hash("Password123!"),
        )
        caregiver_1 = Caregiver(id=uuid.uuid4(), user_id=user_c1.id)

        # 6. Caregiver 2 (Unlinked to Student A)
        user_c2 = User(
            id=uuid.uuid4(),
            email=f"c2_{uid}@test.org",
            name="Caregiver Two",
            role="caregiver",
            password_hash=get_password_hash("Password123!"),
        )
        caregiver_2 = Caregiver(id=uuid.uuid4(), user_id=user_c2.id)

        # 7. Admin
        user_admin = User(
            id=uuid.uuid4(),
            email=f"admin_{uid}@test.org",
            name="Admin User",
            role="admin",
            password_hash=get_password_hash("Password123!"),
        )

        db.add_all([
            user_sa, student_a, acc_a,
            user_sb, student_b, acc_b,
            user_t1, teacher_1,
            user_t2, teacher_2,
            user_c1, caregiver_1,
            user_c2, caregiver_2,
            user_admin,
        ])
        db.flush()

        # Link Teacher 1 -> Student A
        link_t1_sa = TeacherStudent(teacher_id=teacher_1.id, student_id=student_a.id)
        # Link Teacher 2 -> Student B
        link_t2_sb = TeacherStudent(teacher_id=teacher_2.id, student_id=student_b.id)
        # Link Caregiver 1 -> Student A
        link_c1_sa = CaregiverStudent(caregiver_id=caregiver_1.id, student_id=student_a.id, relationship_type="mother")

        db.add_all([link_t1_sa, link_t2_sb, link_c1_sa])
        db.commit()

        # Generate tokens
        token_sa = create_access_token(subject=str(user_sa.id), extra_claims={"role": "student"})
        token_sb = create_access_token(subject=str(user_sb.id), extra_claims={"role": "student"})
        token_t1 = create_access_token(subject=str(user_t1.id), extra_claims={"role": "teacher"})
        token_t2 = create_access_token(subject=str(user_t2.id), extra_claims={"role": "teacher"})
        token_c1 = create_access_token(subject=str(user_c1.id), extra_claims={"role": "caregiver"})
        token_c2 = create_access_token(subject=str(user_c2.id), extra_claims={"role": "caregiver"})
        token_admin = create_access_token(subject=str(user_admin.id), extra_claims={"role": "admin"})

        return {
            "token_sa": token_sa,
            "token_sb": token_sb,
            "token_t1": token_t1,
            "token_t2": token_t2,
            "token_c1": token_c1,
            "token_c2": token_c2,
            "token_admin": token_admin,
            "student_a_id": str(student_a.id),
            "student_b_id": str(student_b.id),
            "teacher_1_id": str(teacher_1.id),
            "teacher_2_id": str(teacher_2.id),
            "uid": uid,
        }


# ==============================================================================
# 1. Subject Listing
# ==============================================================================

@pytest.mark.asyncio
async def test_01_subject_listing(async_client: AsyncClient, curriculum_test_data):
    """Scenario 1: List available educational subjects."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    # Provision subject
    res_create = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "name": f"Mathematics {uid}",
            "description": "Core Math",
            "grade_level_min": 1,
            "grade_level_max": 8,
            "is_active": True,
            "language": "en",
        },
    )
    assert res_create.status_code == 201

    # List subjects
    res = await async_client.get("/api/v1/subjects")
    assert res.status_code == 200
    data = res.json()
    assert "subjects" in data
    assert any(s["name"] == f"Mathematics {uid}" for s in data["subjects"])


# ==============================================================================
# 2. Subject Retrieval
# ==============================================================================

@pytest.mark.asyncio
async def test_02_subject_retrieval(async_client: AsyncClient, curriculum_test_data):
    """Scenario 2: Retrieve subject details including child topics."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    res_create = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Science {uid}", "description": "Life and physical sciences"},
    )
    subject_id = res_create.json()["id"]

    res = await async_client.get(f"/api/v1/subjects/{subject_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == subject_id
    assert data["name"] == f"Science {uid}"
    assert "topics" in data


# ==============================================================================
# 3. Invalid Subject IDs
# ==============================================================================

@pytest.mark.asyncio
async def test_03_invalid_subject_ids(async_client: AsyncClient):
    """Scenario 3: Non-existent or malformed subject IDs return 404 NOT_FOUND."""
    fake_uuid = str(uuid.uuid4())
    res_fake = await async_client.get(f"/api/v1/subjects/{fake_uuid}")
    assert res_fake.status_code == 404
    assert res_fake.json()["error"]["code"] == "NOT_FOUND"

    res_invalid = await async_client.get("/api/v1/subjects/invalid-uuid-string")
    assert res_invalid.status_code == 404


# ==============================================================================
# 4. Topic Listing
# ==============================================================================

@pytest.mark.asyncio
async def test_04_topic_listing(async_client: AsyncClient, curriculum_test_data):
    """Scenario 4: Retrieve topics belonging to a subject adhering to API contract."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Language Arts {uid}"},
    )
    sub_id = res_sub.json()["id"]

    res_top = await async_client.post(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "name": f"Grammar Fundamentals {uid}",
            "description": "Nouns and verbs",
            "difficulty": "beginner",
            "order_index": 1,
        },
    )
    assert res_top.status_code == 201

    res_list = await async_client.get(f"/api/v1/subjects/{sub_id}/topics")
    assert res_list.status_code == 200
    data = res_list.json()
    assert "topics" in data
    assert any(t["name"] == f"Grammar Fundamentals {uid}" for t in data["topics"])


# ==============================================================================
# 5. Topic Retrieval
# ==============================================================================

@pytest.mark.asyncio
async def test_05_topic_retrieval(async_client: AsyncClient, curriculum_test_data):
    """Scenario 5: Retrieve topic detail including child lessons and prerequisite info."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"History {uid}"},
    )
    sub_id = res_sub.json()["id"]

    res_top = await async_client.post(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Ancient Civilizations {uid}", "difficulty": "intermediate"},
    )
    top_id = res_top.json()["id"]

    res_get = await async_client.get(f"/api/v1/topics/{top_id}")
    assert res_get.status_code == 200
    topic_data = res_get.json()
    assert topic_data["id"] == top_id
    assert topic_data["name"] == f"Ancient Civilizations {uid}"
    assert "lessons" in topic_data


# ==============================================================================
# 6. Grade-Based Filtering
# ==============================================================================

@pytest.mark.asyncio
async def test_06_grade_based_filtering(async_client: AsyncClient, curriculum_test_data):
    """Scenario 6: Filter subjects and lessons by grade level."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    # Subject for grade 1-3
    await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "name": f"Early Math {uid}",
            "grade_level_min": 1,
            "grade_level_max": 3,
        },
    )

    # Subject for grade 4-6
    await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "name": f"Intermediate Math {uid}",
            "grade_level_min": 4,
            "grade_level_max": 6,
        },
    )

    # Query for grade 2 -> Early Math only
    res_g2 = await async_client.get("/api/v1/subjects", params={"grade": 2})
    assert res_g2.status_code == 200
    names_g2 = [s["name"] for s in res_g2.json()["subjects"]]
    assert f"Early Math {uid}" in names_g2
    assert f"Intermediate Math {uid}" not in names_g2

    # Query for grade 5 -> Intermediate Math only
    res_g5 = await async_client.get("/api/v1/subjects", params={"grade": 5})
    assert res_g5.status_code == 200
    names_g5 = [s["name"] for s in res_g5.json()["subjects"]]
    assert f"Intermediate Math {uid}" in names_g5
    assert f"Early Math {uid}" not in names_g5


# ==============================================================================
# 7. Language Filtering
# ==============================================================================

@pytest.mark.asyncio
async def test_07_language_filtering(async_client: AsyncClient, curriculum_test_data):
    """Scenario 7: Multilingual curriculum support with language filtering."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    # English subject
    await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"English Literature {uid}", "language": "en"},
    )
    # Spanish subject
    await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Literatura Espanola {uid}", "language": "es"},
    )

    # Filter by Spanish (es)
    res_es = await async_client.get("/api/v1/subjects", params={"language": "es"})
    assert res_es.status_code == 200
    es_names = [s["name"] for s in res_es.json()["subjects"]]
    assert f"Literatura Espanola {uid}" in es_names
    assert f"English Literature {uid}" not in es_names


# ==============================================================================
# 8. Topic Prerequisites & Locking
# ==============================================================================

@pytest.mark.asyncio
async def test_08_topic_prerequisites_and_locking(async_client: AsyncClient, curriculum_test_data):
    """Scenario 8: Topic prerequisite tracking locks advanced topics until prerequisites are mastered."""
    token_t1 = curriculum_test_data["token_t1"]
    token_sa = curriculum_test_data["token_sa"]
    student_a_id = curriculum_test_data["student_a_id"]
    uid = curriculum_test_data["uid"]

    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Arithmetic {uid}"},
    )
    sub_id = res_sub.json()["id"]

    # Topic 1: Addition (Foundational)
    res_t1 = await async_client.post(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Addition {uid}", "order_index": 1},
    )
    topic_1_id = res_t1.json()["id"]

    # Topic 2: Multiplication (Requires Addition)
    res_t2 = await async_client.post(
        "/api/v1/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "subject_id": sub_id,
            "name": f"Multiplication {uid}",
            "order_index": 2,
            "prerequisite_topic_id": topic_1_id,
        },
    )
    topic_2_id = res_t2.json()["id"]

    # Student A queries topics: Topic 2 MUST be locked
    res_list = await async_client.get(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_sa}"},
    )
    assert res_list.status_code == 200
    topics = res_list.json()["topics"]
    t1_item = next(t for t in topics if t["id"] == topic_1_id)
    t2_item = next(t for t in topics if t["id"] == topic_2_id)
    assert t1_item["is_locked"] is False
    assert t2_item["is_locked"] is True

    # Now simulate Student A mastering Topic 1
    with SessionLocal() as db:
        mastery = StudentTopicMastery(
            student_id=uuid.UUID(student_a_id),
            topic_id=uuid.UUID(topic_1_id),
            mastery_score=0.85,
            confidence=0.90,
        )
        db.merge(mastery)
        db.commit()

    # Re-query: Topic 2 MUST now be unlocked!
    res_unlocked = await async_client.get(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_sa}"},
    )
    t2_unlocked = next(t for t in res_unlocked.json()["topics"] if t["id"] == topic_2_id)
    assert t2_unlocked["is_locked"] is False


# ==============================================================================
# 9. Curriculum Hierarchy (Subject -> Topic -> Lesson -> Objectives)
# ==============================================================================

@pytest.mark.asyncio
async def test_09_curriculum_hierarchy(async_client: AsyncClient, curriculum_test_data):
    """Scenario 9: Complete structured hierarchy navigation."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    # 1. Subject
    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Astronomy {uid}", "description": "Space science"},
    )
    sub_id = res_sub.json()["id"]

    # 2. Topic
    res_top = await async_client.post(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Planets {uid}", "order_index": 1},
    )
    top_id = res_top.json()["id"]

    # 3. Lesson
    res_les = await async_client.post(
        "/api/v1/lessons",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "topic_id": top_id,
            "title": f"Mars Exploration {uid}",
            "standard_content": "Mars is the fourth planet from the Sun.",
            "simplified_content": "Mars is the red planet.",
        },
    )
    les_id = res_les.json()["id"]

    # 4. Learning Objective
    res_obj = await async_client.post(
        f"/api/v1/lessons/{les_id}/objectives",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"description": "Identify three geological features of Mars", "order_index": 1},
    )
    assert res_obj.status_code == 201

    # Verify hierarchy retrieval
    res_detail = await async_client.get(f"/api/v1/lessons/{les_id}")
    assert res_detail.status_code == 200
    data = res_detail.json()
    assert data["topic_id"] == top_id
    assert len(data["objectives"]) == 1
    assert data["objectives"][0]["description"] == "Identify three geological features of Mars"


# ==============================================================================
# 10. Student-Specific Curriculum
# ==============================================================================

@pytest.mark.asyncio
async def test_10_student_specific_curriculum(async_client: AsyncClient, curriculum_test_data):
    """Scenario 10: Personalized curriculum overview and next recommended topic."""
    token_sa = curriculum_test_data["token_sa"]
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    # Create grade 5 subject with sort prefix so it is prioritized
    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "name": f"0_Social Studies {uid}",
            "grade_level_min": 5,
            "grade_level_max": 5,
        },
    )
    sub_id = res_sub.json()["id"]

    # Create topic
    res_top = await async_client.post(
        f"/api/v1/subjects/{sub_id}/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Community Helper Roles {uid}", "grade_level": 5},
    )
    top_id = res_top.json()["id"]

    # Create published lesson
    await async_client.post(
        "/api/v1/lessons",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "topic_id": top_id,
            "title": f"Firefighters and Paramedics {uid}",
            "standard_content": "Emergency responders protect communities.",
            "simplified_content": "Firefighters help keep us safe.",
            "audio_url": "https://cdn.ablenova.org/audio/firefighters.mp3",
            "is_published": True,
        },
    )

    # 1. Student queries own curriculum
    res_curr = await async_client.get(
        "/api/v1/student/curriculum",
        headers={"Authorization": f"Bearer {token_sa}"},
    )
    assert res_curr.status_code == 200
    curr_data = res_curr.json()
    assert curr_data["grade"] == 5
    assert curr_data["preferred_language"] == "en"
    assert any(s["name"] == f"0_Social Studies {uid}" for s in curr_data["subjects"])

    # 2. Student queries next progression step
    res_next = await async_client.get(
        "/api/v1/student/curriculum/next",
        headers={"Authorization": f"Bearer {token_sa}"},
    )
    assert res_next.status_code == 200
    next_data = res_next.json()
    assert next_data["topic"] is not None
    assert next_data["next_lesson"] is not None
    assert "firefighters" in next_data["next_lesson"]["title"].lower()


# ==============================================================================
# 11. Unauthorized Access
# ==============================================================================

@pytest.mark.asyncio
async def test_11_unauthorized_access(async_client: AsyncClient, curriculum_test_data):
    """Scenario 11: Students cannot create curriculum, and unauthorized users cannot edit."""
    token_sa = curriculum_test_data["token_sa"]

    # Student cannot create subject
    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_sa}"},
        json={"name": "Hacked Subject"},
    )
    assert res_sub.status_code == 403

    # Student cannot create lesson
    res_les = await async_client.post(
        "/api/v1/lessons",
        headers={"Authorization": f"Bearer {token_sa}"},
        json={
            "topic_id": str(uuid.uuid4()),
            "title": "Hacked Lesson",
            "standard_content": "content",
            "simplified_content": "simplified",
        },
    )
    assert res_les.status_code == 403


# ==============================================================================
# 12. Teacher Relationship Authorization
# ==============================================================================

@pytest.mark.asyncio
async def test_12_teacher_relationship_authorization(async_client: AsyncClient, curriculum_test_data):
    """Scenario 12: Verified teacher can view student curriculum; unlinked teacher is rejected."""
    token_t1 = curriculum_test_data["token_t1"]
    token_t2 = curriculum_test_data["token_t2"]
    student_a_id = curriculum_test_data["student_a_id"]

    # Teacher 1 is linked to Student A -> 200 OK
    res_linked = await async_client.get(
        f"/api/v1/students/{student_a_id}/curriculum",
        headers={"Authorization": f"Bearer {token_t1}"},
    )
    assert res_linked.status_code == 200
    assert res_linked.json()["student_id"] == student_a_id

    # Teacher 2 is NOT linked to Student A -> 403 Forbidden
    res_unlinked = await async_client.get(
        f"/api/v1/students/{student_a_id}/curriculum",
        headers={"Authorization": f"Bearer {token_t2}"},
    )
    assert res_unlinked.status_code == 403
    assert res_unlinked.json()["error"]["code"] == "FORBIDDEN"


# ==============================================================================
# 13. Caregiver Relationship Authorization
# ==============================================================================

@pytest.mark.asyncio
async def test_13_caregiver_relationship_authorization(async_client: AsyncClient, curriculum_test_data):
    """Scenario 13: Verified caregiver can view student curriculum; unlinked caregiver is rejected."""
    token_c1 = curriculum_test_data["token_c1"]
    token_c2 = curriculum_test_data["token_c2"]
    student_a_id = curriculum_test_data["student_a_id"]

    # Caregiver 1 is linked to Student A -> 200 OK
    res_linked = await async_client.get(
        f"/api/v1/students/{student_a_id}/curriculum",
        headers={"Authorization": f"Bearer {token_c1}"},
    )
    assert res_linked.status_code == 200

    # Caregiver 2 is NOT linked to Student A -> 403 Forbidden
    res_unlinked = await async_client.get(
        f"/api/v1/students/{student_a_id}/curriculum",
        headers={"Authorization": f"Bearer {token_c2}"},
    )
    assert res_unlinked.status_code == 403


# ==============================================================================
# 14. Accessibility Metadata
# ==============================================================================

@pytest.mark.asyncio
async def test_14_accessibility_metadata(async_client: AsyncClient, curriculum_test_data):
    """Scenario 14: Comprehensive disability-friendly learning metadata exposed properly."""
    token_t1 = curriculum_test_data["token_t1"]
    uid = curriculum_test_data["uid"]

    res_sub = await async_client.post(
        "/api/v1/subjects",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Music Literacy {uid}"},
    )
    res_top = await async_client.post(
        f"/api/v1/subjects/{res_sub.json()['id']}/topics",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={"name": f"Rhythm {uid}"},
    )

    res_les = await async_client.post(
        "/api/v1/lessons",
        headers={"Authorization": f"Bearer {token_t1}"},
        json={
            "topic_id": res_top.json()["id"],
            "title": f"Steady Beat {uid}",
            "standard_content": "Rhythm is an ordered pattern of sounds.",
            "simplified_content": "Beat is the heartbeat of music.",
            "audio_url": "https://cdn.ablenova.org/audio/beat.mp3",
            "caption_text": "Listen to the steady drum tap.",
            "accessibility_metadata": {
                "has_audio": True,
                "has_captions": True,
                "has_simplified": True,
                "text_alternatives": True,
                "keyboard_accessible": True,
                "high_contrast_ready": True,
                "screen_reader_optimized": True,
                "reduced_motion_compatible": True,
                "supported_languages": ["en", "es"],
            },
        },
    )
    assert res_les.status_code == 201
    lesson_data = res_les.json()
    acc = lesson_data["accessibility"]
    assert acc["has_audio"] is True
    assert acc["has_captions"] is True
    assert acc["has_simplified"] is True
    assert acc["keyboard_accessible"] is True
    assert acc["high_contrast_ready"] is True
    assert acc["screen_reader_optimized"] is True
    assert "es" in acc["supported_languages"]


# ==============================================================================
# 15. Empty Curriculum Handling
# ==============================================================================

@pytest.mark.asyncio
async def test_15_empty_curriculum_handling(async_client: AsyncClient, curriculum_test_data):
    """Scenario 15: Graceful responses when no subjects or topics exist for a student's grade."""
    uid = uuid.uuid4().hex[:8]
    with SessionLocal() as db:
        user_empty = User(
            id=uuid.uuid4(),
            email=f"empty_{uid}@test.org",
            name="Empty Student",
            role="student",
            password_hash=get_password_hash("Password123!"),
        )
        student_empty = Student(
            id=uuid.uuid4(),
            user_id=user_empty.id,
            age=18,
            grade=12,
            preferred_language="fr",
        )
        db.add_all([user_empty, student_empty])
        db.commit()
        token_empty = create_access_token(subject=str(user_empty.id), extra_claims={"role": "student"})

    res_next = await async_client.get(
        "/api/v1/student/curriculum/next",
        headers={"Authorization": f"Bearer {token_empty}"},
    )
    assert res_next.status_code == 200
    data = res_next.json()
    assert data["topic"] is None
    assert data["next_lesson"] is None
    assert "completed" in data["recommendation_reason"].lower() or "job" in data["recommendation_reason"].lower()


# ==============================================================================
# 16. Database Migration Behavior
# ==============================================================================

def test_16_database_migration_behavior():
    """Scenario 16: Verify Alembic revisions discovered up to curriculum extension head."""
    import os
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
    assert os.path.isfile(alembic_ini_path)

    alembic_cfg = Config(alembic_ini_path)
    script = ScriptDirectory.from_config(alembic_cfg)

    heads = script.get_heads()
    assert len(heads) == 1
    assert heads[0] in ["e5f6a7b8c9d0", "f6a7b8c9d0e1"]

    revisions = [r.revision for r in script.walk_revisions()]
    assert "0001_setup_extensions" in revisions
    assert "8c12c5387ad5" in revisions
    assert "d4e5f6a7b8c9" in revisions
    assert "e5f6a7b8c9d0" in revisions
    assert "f6a7b8c9d0e1" in revisions

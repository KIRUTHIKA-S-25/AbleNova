"""Integration tests for AI Learning Engine and Content Ingestion API endpoints.
Verifies contract adherence (API_CONTRACT.md Sec 13, 14, 20) and authorization rules.
"""
import io
import uuid
import pytest
from app.core.security import create_access_token
from app.db.models.curriculum import Subject, Topic
from app.db.models.student import AccessibilityProfile, Student
from app.db.models.user import Teacher, User
from app.schemas.common import UserRole


@pytest.fixture
def auth_headers(db_session):
    """Create a student user and return authorization bearer headers."""
    user = User(
        email=f"student_ai_{uuid.uuid4().hex[:6]}@example.com",
        name="Sam Student",
        password_hash="hashed_password",
        role=UserRole.STUDENT.value,
    )
    db_session.add(user)
    db_session.commit()

    student = Student(
        user_id=user.id,
        age=10,
        grade=5,
        preferred_language="en",
    )
    db_session.add(student)
    db_session.commit()

    ap = AccessibilityProfile(
        student_id=student.id,
        text_enabled=True,
        simplified_content=True,
    )
    db_session.add(ap)
    db_session.commit()

    token = create_access_token(subject=str(user.id), extra_claims={"role": user.role})
    return {
        "Authorization": f"Bearer {token}",
        "user": user,
        "student": student,
    }


@pytest.fixture
def teacher_auth_headers(db_session):
    """Create a teacher user and return authorization bearer headers."""
    user = User(
        email=f"teacher_ai_{uuid.uuid4().hex[:6]}@example.com",
        name="Ms. Johnson",
        password_hash="hashed_password",
        role=UserRole.TEACHER.value,
    )
    db_session.add(user)
    db_session.commit()

    teacher = Teacher(user_id=user.id)
    db_session.add(teacher)
    db_session.commit()

    token = create_access_token(subject=str(user.id), extra_claims={"role": user.role})
    return {
        "Authorization": f"Bearer {token}",
        "user": user,
        "teacher": teacher,
    }


# ==============================================================================
# 1. POST /api/v1/ai/explanation (API_CONTRACT.md Sec 13)
# ==============================================================================

def test_api_ai_explanation_contract_adherence(client, auth_headers):
    payload = {
        "lesson_id": "lesson_001",
        "question": "Explain this simply",
        "mode": "simplified",
    }
    response = client.post(
        "/api/v1/ai/explanation",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "source_ids" in data
    assert data["mode"] == "simplified"
    assert "request_id" in data


def test_api_ai_explanation_requires_auth(client):
    payload = {
        "lesson_id": "lesson_001",
        "question": "What is an atom?",
        "mode": "standard",
    }
    response = client.post("/api/v1/ai/explanation", json=payload)
    assert response.status_code == 401
    err = response.json()
    assert err["error"]["code"] == "UNAUTHORIZED"


def test_api_ai_explanation_idor_protection(client, auth_headers, db_session):
    """A student may not specify another student's ID."""
    other_user = User(
        email=f"other_{uuid.uuid4().hex[:6]}@example.com",
        name="Other Student",
        password_hash="hashed_pw",
        role=UserRole.STUDENT.value,
    )
    db_session.add(other_user)
    db_session.commit()

    other_student = Student(user_id=other_user.id, age=12, grade=7)
    db_session.add(other_student)
    db_session.commit()

    payload = {
        "lesson_id": "lesson_001",
        "question": "Help me with homework",
        "student_id": str(other_student.id),
    }
    response = client.post(
        "/api/v1/ai/explanation",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 403
    err = response.json()
    assert err["error"]["code"] == "FORBIDDEN"


# ==============================================================================
# 2. POST /api/v1/ai/ask
# ==============================================================================

def test_api_ai_ask(client, auth_headers):
    payload = {
        "question": "Why is the sky blue?",
        "mode": "standard",
    }
    response = client.post(
        "/api/v1/ai/ask",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "request_id" in data
    assert "source_ids" in data


# ==============================================================================
# 3. POST /api/v1/ai/simplify
# ==============================================================================

def test_api_ai_simplify(client, auth_headers):
    payload = {
        "text": "Cellular respiration is a series of chemical reactions that break down glucose to produce ATP.",
        "target_grade": 4,
    }
    response = client.post(
        "/api/v1/ai/simplify",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "simplified_text" in data
    assert data["target_grade"] == 4
    assert isinstance(data["key_points"], list)


# ==============================================================================
# 4. POST /api/v1/ai/translate
# ==============================================================================

def test_api_ai_translate(client, auth_headers):
    payload = {
        "text": "Welcome to your math lesson today!",
        "target_language": "es",
    }
    response = client.post(
        "/api/v1/ai/translate",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert data["target_language"] == "es"


# ==============================================================================
# 5. POST /api/v1/ai/summarize
# ==============================================================================

def test_api_ai_summarize(client, auth_headers):
    payload = {
        "text": (
            "The water cycle describes how water evaporates from the surface of the earth, "
            "rises into the atmosphere, cools and condenses into rain or snow in clouds, "
            "and falls again to the surface as precipitation."
        ),
        "bullet_count": 3,
    }
    response = client.post(
        "/api/v1/ai/summarize",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert len(data["bullets"]) >= 1


# ==============================================================================
# 6. POST /api/v1/ai/hints
# ==============================================================================

def test_api_ai_hints(client, auth_headers):
    payload = {
        "question": "What is 15 multiplied by 4?",
        "hint_level": 1,
    }
    response = client.post(
        "/api/v1/ai/hints",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "hint" in data
    assert data["hint_level"] == 1
    assert "has_more_hints" in data


# ==============================================================================
# 7. POST /api/v1/ai/visual-description
# ==============================================================================

def test_api_ai_visual_description(client, auth_headers):
    payload = {
        "diagram_type": "diagram",
        "context_text": "Illustration of the inner core, outer core, mantle, and crust of the Earth.",
    }
    response = client.post(
        "/api/v1/ai/visual-description",
        json=payload,
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "description" in data
    assert "tactile_guidance" in data
    assert isinstance(data["key_elements"], list)


# ==============================================================================
# 8. GET /api/v1/ai/sources/{request_id}
# ==============================================================================

def test_api_ai_sources_lookup(client, auth_headers):
    # First generate an explanation to seed attribution cache
    exp_resp = client.post(
        "/api/v1/ai/explanation",
        json={"lesson_id": "lesson_100", "question": "What is evaporation?"},
        headers={"Authorization": auth_headers["Authorization"]},
    )
    req_id = exp_resp.json()["request_id"]

    # Now query sources
    source_resp = client.get(
        f"/api/v1/ai/sources/{req_id}",
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert source_resp.status_code == 200
    data = source_resp.json()
    assert data["request_id"] == req_id
    assert "sources" in data
    assert data["retrieval_strategy"] == "chromadb_semantic_vector"


def test_api_ai_sources_not_found(client, auth_headers):
    response = client.get(
        "/api/v1/ai/sources/nonexistent_req_id",
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 404
    err = response.json()
    assert err["error"]["code"] == "NOT_FOUND"


# ==============================================================================
# 9. POST /api/v1/content/upload (API_CONTRACT.md Sec 14)
# ==============================================================================

def test_api_content_upload_by_teacher(client, teacher_auth_headers, db_session):
    subject = Subject(name=f"Geography {uuid.uuid4().hex[:6]}", grade_level_min=4, grade_level_max=8)
    db_session.add(subject)
    db_session.commit()

    topic = Topic(subject_id=subject.id, name="Landforms", order_index=1)
    db_session.add(topic)
    db_session.commit()

    file_content = b"Mountains are elevated portions of the Earth's crust, generally with steep sides that show significant exposed bedrock."
    file_obj = io.BytesIO(file_content)

    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("mountains.txt", file_obj, "text/plain")},
        data={
            "subject_id": str(subject.id),
            "topic_id": str(topic.id),
            "grade": 5,
            "language": "en",
            "difficulty": "beginner",
        },
        headers={"Authorization": teacher_auth_headers["Authorization"]},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "processed"
    assert data["chunks_count"] > 0
    assert "document_id" in data


def test_api_content_upload_forbidden_for_student(client, auth_headers, db_session):
    subject = Subject(name=f"History {uuid.uuid4().hex[:6]}", grade_level_min=5, grade_level_max=8)
    db_session.add(subject)
    db_session.commit()

    topic = Topic(subject_id=subject.id, name="Ancient Civilizations", order_index=1)
    db_session.add(topic)
    db_session.commit()

    file_obj = io.BytesIO(b"Sample curriculum content.")
    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("history.txt", file_obj, "text/plain")},
        data={
            "subject_id": str(subject.id),
            "topic_id": str(topic.id),
            "grade": 5,
        },
        headers={"Authorization": auth_headers["Authorization"]},
    )
    assert response.status_code == 403
    err = response.json()
    assert err["error"]["code"] == "FORBIDDEN"

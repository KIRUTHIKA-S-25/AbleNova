import uuid
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.schemas import (
    AccessibilityProfileBase,
    AccessibilityProfileUpdate,
    AIExplanationRequest,
    AIExplanationResponse,
    AnswerSubmission,
    ContentDocumentCreate,
    ContentDocumentRead,
    DifficultyLevel,
    LessonContent,
    LessonDetailResponse,
    QuestionCreate,
    QuestionRead,
    QuizRead,
    QuizResultResponse,
    QuizSubmission,
    RecommendationRead,
    StudentBase,
    StudentCreate,
    StudentProfileResponse,
    StudentProgressResponse,
    SubjectItemResponse,
    SubjectListResponse,
    SyncRequest,
    SyncResponse,
    TopicItemResponse,
    TopicListResponse,
    UserCreate,
    UserRead,
    UserRole,
)


def test_user_create_validation():
    """Verify validation on user creation schema."""
    valid = UserCreate(
        email="student@ablenova.edu",
        name="Sam Student",
        password="ValidPassword123",
        role=UserRole.STUDENT,
    )
    assert valid.email == "student@ablenova.edu"
    assert valid.role == UserRole.STUDENT

    # Invalid email
    with pytest.raises(ValidationError):
        UserCreate(email="not-an-email", name="Bad", password="ValidPassword123")

    # Short password
    with pytest.raises(ValidationError):
        UserCreate(email="user@test.org", name="Short", password="123")


def test_user_read_never_exposes_password():
    """Verify UserRead schema does not contain password_hash field."""
    user_data = {
        "id": uuid.uuid4(),
        "email": "safe@test.org",
        "name": "Safe User",
        "role": UserRole.TEACHER,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "password_hash": "super_secret_hash_value",  # Should be ignored/omitted
    }
    user_read = UserRead.model_validate(user_data)
    assert not hasattr(user_read, "password_hash")
    dumped = user_read.model_dump()
    assert "password_hash" not in dumped
    assert "password" not in dumped


def test_student_and_accessibility_profile_validation():
    """Verify bounds and privacy rules on student & accessibility profiles."""
    valid_student = StudentCreate(
        user_id=uuid.uuid4(),
        age=12,
        grade=7,
        preferred_language="en",
    )
    assert valid_student.age == 12

    # Age too low (< 3)
    with pytest.raises(ValidationError):
        StudentCreate(user_id=uuid.uuid4(), age=1, grade=1)

    # Grade too high (> 12)
    with pytest.raises(ValidationError):
        StudentCreate(user_id=uuid.uuid4(), age=10, grade=15)

    # Accessibility profile default flags
    acc = AccessibilityProfileBase()
    assert acc.text_enabled is True
    assert acc.audio_enabled is False
    assert acc.high_contrast is False
    assert acc.keyboard_navigation is True
    # Ensure zero medical/diagnostic fields exist
    assert not hasattr(acc, "medical_condition")
    assert not hasattr(acc, "diagnosis")


def test_student_profile_response_structure():
    """Verify StudentProfileResponse adherence to API_CONTRACT.md Section 3."""
    profile = StudentProfileResponse(
        student_id="student_001",
        name="Alex",
        age=12,
        grade=7,
        preferred_language="en",
        accessibility=AccessibilityProfileBase(high_contrast=True, simplified_content=True),
    )
    dump = profile.model_dump()
    assert dump["student_id"] == "student_001"
    assert dump["accessibility"]["high_contrast"] is True
    assert dump["accessibility"]["simplified_content"] is True


def test_curriculum_and_lesson_schemas():
    """Verify curriculum schemas match API_CONTRACT.md Sections 4, 5, 6."""
    sub_item = SubjectItemResponse(id="sub_001", name="Mathematics", description="Math", progress=0.68)
    sub_list = SubjectListResponse(subjects=[sub_item])
    assert sub_list.subjects[0].progress == 0.68

    top_item = TopicItemResponse(id="top_001", subject_id="sub_001", name="Fractions", progress=0.65, mastery=0.62, difficulty="intermediate")
    top_list = TopicListResponse(topics=[top_item])
    assert top_list.topics[0].mastery == 0.62

    lesson_detail = LessonDetailResponse(
        id="lesson_001",
        topic_id="top_001",
        title="Intro to Fractions",
        difficulty="beginner",
        language="en",
        estimated_minutes=10,
        content=LessonContent(
            standard="Standard lesson text.",
            simplified="Simplified text.",
            audio_url=None,
            caption_text=None,
        ),
    )
    assert lesson_detail.content.simplified == "Simplified text."


def test_question_read_security_omits_correct_answer():
    """CRITICAL SECURITY: QuestionRead MUST NOT expose correct_answer."""
    question_data = {
        "id": "q_001",
        "type": "multiple_choice",
        "question": "What is 1/2?",
        "options": ["A", "B", "C", "D"],
        "difficulty": "beginner",
        "correct_answer": "B",  # Backend only
    }
    q_read = QuestionRead.model_validate(question_data)
    assert not hasattr(q_read, "correct_answer")
    assert "correct_answer" not in q_read.model_dump()


def test_quiz_submission_and_result_schemas():
    """Verify Quiz submission and result evaluation schemas match contract."""
    submission = QuizSubmission(
        answers=[
            AnswerSubmission(question_id="q_001", answer="B", time_taken_seconds=12)
        ]
    )
    assert len(submission.answers) == 1
    assert submission.answers[0].answer == "B"

    result = QuizResultResponse(
        score=7,
        total=10,
        accuracy=0.70,
        time_taken_seconds=180,
        topic_results=[{"topic_id": "top_001", "accuracy": 0.70}],
        feedback="Good progress.",
        recommendation_id="rec_001",
    )
    assert result.accuracy == 0.70
    assert result.score == 7


def test_sync_request_and_response_schemas():
    """Verify offline sync payload schemas match API_CONTRACT.md Section 19."""
    sync_req = SyncRequest(
        events=[
            {
                "local_id": "local_001",
                "type": "quiz_attempt",
                "payload": {"score": 8},
                "created_at": datetime.now(timezone.utc),
            }
        ]
    )
    assert len(sync_req.events) == 1
    assert sync_req.events[0].local_id == "local_001"

    sync_res = SyncResponse(synced=["local_001"], failed=[])
    assert sync_res.synced == ["local_001"]
    assert sync_res.failed == []


def test_orm_serialization():
    """Verify ORM model to Pydantic schema serialization."""
    from app.db.models import User
    user = User(
        id=uuid.uuid4(),
        email="orm_test@example.com",
        name="ORM User",
        role="student",
        password_hash="hidden_hash",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    schema = UserRead.model_validate(user)
    assert schema.email == "orm_test@example.com"
    assert schema.id == user.id
    assert not hasattr(schema, "password_hash")

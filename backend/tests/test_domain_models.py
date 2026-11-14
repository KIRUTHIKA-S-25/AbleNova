import uuid
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.models import (
    AccessibilityProfile,
    Caregiver,
    CaregiverStudent,
    ContentChunk,
    ContentDocument,
    EngagementEvent,
    LearningPathItem,
    LearningSession,
    Lesson,
    Question,
    QuestionAttempt,
    Quiz,
    QuizAttempt,
    Recommendation,
    Student,
    StudentTopicMastery,
    Subject,
    Teacher,
    TeacherStudent,
    Topic,
    User,
)


@pytest.fixture
def db_session():
    """In-memory SQLite session with all domain model tables created."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def test_user_and_student_creation_and_relationships(db_session):
    """Verify user, student, and accessibility profile creation and 1-to-1 relationships."""
    user = User(
        email="student@example.com",
        name="Alex Smith",
        role="student",
        password_hash="hashed_secret",
    )
    db_session.add(user)
    db_session.commit()

    student = Student(
        user_id=user.id,
        age=11,
        grade=6,
        preferred_language="en",
    )
    db_session.add(student)
    db_session.commit()

    acc_profile = AccessibilityProfile(
        student_id=student.id,
        text_enabled=True,
        audio_enabled=True,
        captions_enabled=True,
        simplified_content=True,
        large_text=False,
        high_contrast=True,
        reduced_motion=True,
        keyboard_navigation=True,
    )
    db_session.add(acc_profile)
    db_session.commit()

    # Query back
    fetched_user = db_session.execute(select(User).where(User.id == user.id)).scalar_one()
    assert fetched_user.student is not None
    assert fetched_user.student.age == 11
    assert fetched_user.student.accessibility_profile.high_contrast is True
    assert fetched_user.student.accessibility_profile.simplified_content is True


def test_unique_user_email_constraint(db_session):
    """Verify unique constraint on user email."""
    user1 = User(email="duplicate@example.com", name="User 1", password_hash="hash1")
    user2 = User(email="duplicate@example.com", name="User 2", password_hash="hash2")
    db_session.add(user1)
    db_session.commit()

    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_teacher_student_and_caregiver_student_relationships(db_session):
    """Verify explicit authorization links between teachers/caregivers and students."""
    teacher_user = User(email="teacher@school.edu", name="Teacher Jane", role="teacher", password_hash="hash")
    caregiver_user = User(email="parent@home.org", name="Parent Bob", role="caregiver", password_hash="hash")
    student_user = User(email="student2@school.edu", name="Student Sam", role="student", password_hash="hash")
    db_session.add_all([teacher_user, caregiver_user, student_user])
    db_session.commit()

    teacher = Teacher(user_id=teacher_user.id)
    caregiver = Caregiver(user_id=caregiver_user.id)
    student = Student(user_id=student_user.id, age=10, grade=5)
    db_session.add_all([teacher, caregiver, student])
    db_session.commit()

    # Explicit relationships
    ts = TeacherStudent(teacher_id=teacher.id, student_id=student.id)
    cs = CaregiverStudent(caregiver_id=caregiver.id, student_id=student.id, relationship_type="parent")
    db_session.add_all([ts, cs])
    db_session.commit()

    # Verify many-to-many relationship navigation
    assert student in teacher.students
    assert teacher in student.teachers
    assert student in caregiver.students
    assert caregiver in student.caregivers


def test_curriculum_and_quiz_hierarchy(db_session):
    """Verify subject -> topic -> lesson -> quiz -> questions -> attempts hierarchy."""
    subject = Subject(name="Mathematics", description="Math fundamentals")
    db_session.add(subject)
    db_session.commit()

    topic = Topic(subject_id=subject.id, name="Fractions", difficulty="beginner")
    db_session.add(topic)
    db_session.commit()

    lesson = Lesson(
        topic_id=topic.id,
        title="Intro to Fractions",
        difficulty="beginner",
        standard_content="Half of a whole is 1/2.",
        simplified_content="1 out of 2 parts.",
    )
    db_session.add(lesson)
    db_session.commit()

    quiz = Quiz(lesson_id=lesson.id, title="Fractions Checkpoint")
    db_session.add(quiz)
    db_session.commit()

    question = Question(
        quiz_id=quiz.id,
        topic_id=topic.id,
        question_text="What fraction represents half?",
        question_type="multiple_choice",
        options=["1/4", "1/2", "3/4", "1/1"],
        correct_answer="1/2",
        explanation="One part out of two equal parts.",
        difficulty="beginner",
    )
    db_session.add(question)
    db_session.commit()

    assert question in quiz.questions
    assert quiz in lesson.quizzes
    assert lesson in topic.lessons
    assert topic in subject.topics

    # Student quiz attempt
    u = User(email="student_quiz@test.org", name="Quiz Student", password_hash="hash")
    db_session.add(u)
    db_session.commit()
    st = Student(user_id=u.id, age=10, grade=4)
    db_session.add(st)
    db_session.commit()

    attempt = QuizAttempt(
        student_id=st.id,
        quiz_id=quiz.id,
        score=1,
        total_questions=1,
        accuracy=1.0,
        time_taken_seconds=35,
    )
    db_session.add(attempt)
    db_session.commit()

    q_attempt = QuestionAttempt(
        attempt_id=attempt.id,
        question_id=question.id,
        student_answer="1/2",
        is_correct=True,
        time_taken_seconds=35,
    )
    db_session.add(q_attempt)
    db_session.commit()

    assert q_attempt in attempt.question_attempts
    assert attempt in st.quiz_attempts


def test_progress_recommendation_and_mastery(db_session):
    """Verify topic mastery, learning sessions, recommendations and learning path items."""
    u = User(email="progress_user@test.org", name="Progress User", password_hash="hash")
    db_session.add(u)
    db_session.commit()
    st = Student(user_id=u.id, age=12, grade=7)
    sub = Subject(name="Science", description="Natural Sciences")
    db_session.add_all([st, sub])
    db_session.commit()

    top = Topic(subject_id=sub.id, name="Solar System")
    db_session.add(top)
    db_session.commit()

    les = Lesson(topic_id=top.id, title="The Planets", standard_content="...", simplified_content="...")
    db_session.add(les)
    db_session.commit()

    # Mastery
    mastery = StudentTopicMastery(
        student_id=st.id,
        topic_id=top.id,
        mastery_score=0.85,
        confidence=0.9,
    )
    db_session.add(mastery)

    # Learning session
    session = LearningSession(
        student_id=st.id,
        lesson_id=les.id,
        duration_seconds=450,
    )
    db_session.add(session)

    # Telemetry event
    event = EngagementEvent(
        student_id=st.id,
        event_type="lesson_completed",
        lesson_id=les.id,
        duration_seconds=450,
    )
    db_session.add(event)

    # Recommendation
    rec = Recommendation(
        student_id=st.id,
        lesson_id=les.id,
        reason="Strengthen planetary knowledge",
        difficulty="beginner",
        estimated_minutes=15,
        status="recommended",
    )
    db_session.add(rec)

    # Learning path item
    lpi = LearningPathItem(
        student_id=st.id,
        lesson_id=les.id,
        order_index=1,
        reason="Foundational topic",
        status="recommended",
    )
    db_session.add(lpi)
    db_session.commit()

    # Verification
    assert mastery.mastery_score == 0.85
    assert rec in st.recommendations
    assert lpi in st.learning_path_items
    assert session in st.learning_sessions
    assert event in st.engagement_events


def test_content_document_and_chunks(db_session):
    """Verify content documents and vector chunk storage."""
    teacher_u = User(email="t_content@test.org", name="Teacher Content", role="teacher", password_hash="hash")
    db_session.add(teacher_u)
    db_session.commit()
    t = Teacher(user_id=teacher_u.id)
    sub = Subject(name="History")
    db_session.add_all([t, sub])
    db_session.commit()

    top = Topic(subject_id=sub.id, name="Ancient Civilizations")
    db_session.add(top)
    db_session.commit()

    doc = ContentDocument(
        teacher_id=t.id,
        file_name="ancient_egypt.pdf",
        storage_path="documents/ancient_egypt.pdf",
        subject_id=sub.id,
        topic_id=top.id,
        grade=6,
        difficulty="beginner",
        status="processed",
    )
    db_session.add(doc)
    db_session.commit()

    chunk = ContentChunk(
        document_id=doc.id,
        content="The Pyramids of Giza were built during the Old Kingdom.",
        embedding=[0.05] * 768,
        page_number=1,
        chunk_index=0,
    )
    db_session.add(chunk)
    db_session.commit()

    assert chunk in doc.chunks
    assert len(chunk.embedding) == 768


def test_cascade_deletion(db_session):
    """Verify that deleting a User cascades to delete Student and AccessibilityProfile."""
    user = User(email="cascade@test.org", name="Cascade User", password_hash="hash")
    db_session.add(user)
    db_session.commit()

    student = Student(user_id=user.id, age=12, grade=6)
    db_session.add(student)
    db_session.commit()

    acc = AccessibilityProfile(student_id=student.id)
    db_session.add(acc)
    db_session.commit()

    # Delete user
    db_session.delete(user)
    db_session.commit()

    assert db_session.execute(select(Student).where(Student.id == student.id)).scalar_one_or_none() is None
    assert db_session.execute(select(AccessibilityProfile).where(AccessibilityProfile.student_id == student.id)).scalar_one_or_none() is None

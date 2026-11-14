import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID


class Quiz(Base):
    """Quiz assessment model associated with a lesson and topic."""
    __tablename__ = "quizzes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False)
    topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="SET NULL"), index=True, nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False, index=True, nullable=False)
    passing_threshold = Column(Float, default=0.70, nullable=False)
    max_attempts = Column(Integer, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    lesson = relationship("Lesson", back_populates="quizzes")
    topic = relationship("Topic", backref="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan", order_by="Question.order_index")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    """Question item model.
    Note: 'correct_answer' is strictly backend-only and must never be exposed
    through client-facing quiz retrieval endpoints.
    """
    __tablename__ = "questions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(GUID(), ForeignKey("quizzes.id", ondelete="CASCADE"), index=True, nullable=False)
    topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice", nullable=False)  # multiple_choice, multiple_select, true_false
    options = Column(JSON, nullable=False)
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(50), default="beginner", nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    marks = Column(Integer, default=1, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    topic = relationship("Topic", back_populates="questions")
    attempts = relationship("QuestionAttempt", back_populates="question", cascade="all, delete-orphan")


class QuizAttempt(Base):
    """Official student quiz attempt evaluated and stored by the backend."""
    __tablename__ = "quiz_attempts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    quiz_id = Column(GUID(), ForeignKey("quizzes.id", ondelete="CASCADE"), index=True, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    is_passed = Column(Boolean, default=False, nullable=False)
    time_taken_seconds = Column(Integer, nullable=False)
    client_submission_id = Column(String(255), index=True, nullable=True)
    feedback = Column(Text, nullable=True)
    recommendation_id = Column(GUID(), ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    student = relationship("Student", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    recommendation = relationship("Recommendation")
    question_attempts = relationship("QuestionAttempt", back_populates="attempt", cascade="all, delete-orphan")


class QuestionAttempt(Base):
    """Item-level response record within a quiz attempt."""
    __tablename__ = "question_attempts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(GUID(), ForeignKey("quiz_attempts.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id = Column(GUID(), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    student_answer = Column(String(255), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    marks_obtained = Column(Float, default=0.0, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)

    # Relationships
    attempt = relationship("QuizAttempt", back_populates="question_attempts")
    question = relationship("Question", back_populates="attempts")

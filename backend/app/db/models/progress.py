import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID


class StudentTopicMastery(Base):
    """Educational topic mastery estimation model.
    Note: Represents educational progress estimation based on quiz and lesson activity;
    does not constitute medical or psychological diagnosis.
    """
    __tablename__ = "student_topic_mastery"

    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True)
    mastery_score = Column(Float, nullable=False, default=0.0)
    confidence = Column(Float, nullable=False, default=0.0)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    student = relationship("Student", back_populates="topic_mastery")
    topic = relationship("Topic", back_populates="student_masteries")


class LearningSession(Base):
    """Learning engagement session record."""
    __tablename__ = "learning_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False)
    started_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="learning_sessions")
    lesson = relationship("Lesson", back_populates="learning_sessions")


class EngagementEvent(Base):
    """Telemetry for learning activity without behavioral surveillance."""
    __tablename__ = "engagement_events"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    event_type = Column(String(100), nullable=False)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    duration_seconds = Column(Integer, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="engagement_events")


class Recommendation(Base):
    """Adaptive learning recommendation model."""
    __tablename__ = "recommendations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False)
    reason = Column(Text, nullable=False)
    difficulty = Column(String(50), default="beginner", nullable=False)
    estimated_minutes = Column(Integer, default=10, nullable=False)
    status = Column(String(50), default="recommended", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    student = relationship("Student", back_populates="recommendations")
    lesson = relationship("Lesson", back_populates="recommendations")


class LearningPathItem(Base):
    """Ordered item within a student's personalized learning sequence."""
    __tablename__ = "learning_path_items"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False)
    order_index = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="recommended", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    student = relationship("Student", back_populates="learning_path_items")
    lesson = relationship("Lesson", back_populates="learning_path_items")

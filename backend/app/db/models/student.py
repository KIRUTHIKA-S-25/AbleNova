import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID, TimestampMixin


class Student(Base, TimestampMixin):
    """Student domain profile entity."""
    __tablename__ = "students"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    grade = Column(Integer, nullable=False)
    preferred_language = Column(String(10), default="en", nullable=False)

    # Relationships
    user = relationship("User", back_populates="student")
    accessibility_profile = relationship(
        "AccessibilityProfile",
        back_populates="student",
        uselist=False,
        cascade="all, delete-orphan",
    )
    teachers = relationship("Teacher", secondary="teacher_students", back_populates="students")
    caregivers = relationship("Caregiver", secondary="caregiver_students", back_populates="students")

    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")
    topic_mastery = relationship("StudentTopicMastery", back_populates="student", cascade="all, delete-orphan")
    learning_sessions = relationship("LearningSession", back_populates="student", cascade="all, delete-orphan")
    engagement_events = relationship("EngagementEvent", back_populates="student", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="student", cascade="all, delete-orphan")
    learning_path_items = relationship("LearningPathItem", back_populates="student", cascade="all, delete-orphan")


class AccessibilityProfile(Base):
    """Child privacy-preserving accessibility preferences model.
    Contains NO medical diagnoses or unnecessary personal identifiers.
    Focuses strictly on presentation and assistive learning configurations.
    """
    __tablename__ = "accessibility_profiles"

    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    text_enabled = Column(Boolean, default=True, nullable=False)
    audio_enabled = Column(Boolean, default=False, nullable=False)
    captions_enabled = Column(Boolean, default=False, nullable=False)
    simplified_content = Column(Boolean, default=False, nullable=False)
    large_text = Column(Boolean, default=False, nullable=False)
    high_contrast = Column(Boolean, default=False, nullable=False)
    reduced_motion = Column(Boolean, default=False, nullable=False)
    keyboard_navigation = Column(Boolean, default=True, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    student = relationship("Student", back_populates="accessibility_profile")

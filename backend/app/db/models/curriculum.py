import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID, TimestampMixin


class Subject(Base):
    """Educational subject model (e.g., Mathematics, Science, English)."""
    __tablename__ = "subjects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    content_documents = relationship("ContentDocument", back_populates="subject", cascade="all, delete-orphan")


class Topic(Base):
    """Educational topic belonging to a subject (e.g., Fractions, Photosynthesis)."""
    __tablename__ = "topics"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    subject_id = Column(GUID(), ForeignKey("subjects.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), default="intermediate", nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    subject = relationship("Subject", back_populates="topics")
    lessons = relationship("Lesson", back_populates="topic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    student_masteries = relationship("StudentTopicMastery", back_populates="topic", cascade="all, delete-orphan")
    content_documents = relationship("ContentDocument", back_populates="topic", cascade="all, delete-orphan")


class Lesson(Base, TimestampMixin):
    """Educational lesson model supporting adaptive presentation tiers."""
    __tablename__ = "lessons"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="beginner", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    estimated_minutes = Column(Integer, default=10, nullable=False)
    standard_content = Column(Text, nullable=False)
    simplified_content = Column(Text, nullable=False)
    audio_url = Column(String(1024), nullable=True)
    caption_text = Column(Text, nullable=True)
    source_document_id = Column(GUID(), ForeignKey("content_documents.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    topic = relationship("Topic", back_populates="lessons")
    quizzes = relationship("Quiz", back_populates="lesson", cascade="all, delete-orphan")
    source_document = relationship("ContentDocument", back_populates="lessons")
    learning_sessions = relationship("LearningSession", back_populates="lesson", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="lesson", cascade="all, delete-orphan")
    learning_path_items = relationship("LearningPathItem", back_populates="lesson", cascade="all, delete-orphan")

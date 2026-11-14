import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID, TimestampMixin


class Subject(Base):
    """Educational subject model (e.g., Mathematics, Science, English)."""
    __tablename__ = "subjects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    grade_level_min = Column(Integer, default=1, nullable=False)
    grade_level_max = Column(Integer, default=12, nullable=False)
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan", order_by="Topic.order_index")
    content_documents = relationship("ContentDocument", back_populates="subject", cascade="all, delete-orphan")


class Topic(Base):
    """Educational topic belonging to a subject (e.g., Fractions, Photosynthesis) with prerequisite progression."""
    __tablename__ = "topics"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    subject_id = Column(GUID(), ForeignKey("subjects.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), default="intermediate", nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    grade_level = Column(Integer, default=5, nullable=False)
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    prerequisite_topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
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
    prerequisite = relationship(
        "Topic",
        remote_side=[id],
        foreign_keys=[prerequisite_topic_id],
        backref="dependent_topics",
    )


class Lesson(Base, TimestampMixin):
    """Educational lesson model supporting adaptive presentation tiers and curriculum metadata."""
    __tablename__ = "lessons"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), default="beginner", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    estimated_minutes = Column(Integer, default=10, nullable=False)
    grade_level = Column(Integer, default=5, nullable=False)
    is_published = Column(Boolean, default=True, index=True, nullable=False)
    standard_content = Column(Text, nullable=False)
    simplified_content = Column(Text, nullable=False)
    audio_url = Column(String(1024), nullable=True)
    caption_text = Column(Text, nullable=True)
    accessibility_metadata = Column(JSON, nullable=True)
    created_by_teacher_id = Column(GUID(), ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True)
    source_document_id = Column(GUID(), ForeignKey("content_documents.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    topic = relationship("Topic", back_populates="lessons")
    quizzes = relationship("Quiz", back_populates="lesson", cascade="all, delete-orphan")
    source_document = relationship("ContentDocument", back_populates="lessons")
    learning_sessions = relationship("LearningSession", back_populates="lesson", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="lesson", cascade="all, delete-orphan")
    learning_path_items = relationship("LearningPathItem", back_populates="lesson", cascade="all, delete-orphan")
    learning_objectives = relationship(
        "LearningObjective",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="LearningObjective.order_index",
    )
    resources = relationship("LessonResource", back_populates="lesson", cascade="all, delete-orphan")
    created_by_teacher = relationship("Teacher", back_populates="lessons", foreign_keys=[created_by_teacher_id])


class LearningObjective(Base):
    """Specific measurable learning objective associated with an educational lesson."""
    __tablename__ = "learning_objectives"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False)
    description = Column(Text, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    lesson = relationship("Lesson", back_populates="learning_objectives")


class LessonResource(Base):
    """Metadata for external or attached educational media and accessible learning resources."""
    __tablename__ = "lesson_resources"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(50), nullable=False)  # e.g., document, audio, video, image, worksheet, link
    url = Column(String(1024), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    format = Column(String(50), nullable=True)  # e.g., pdf, mp3, mp4, png, webp
    accessibility_description = Column(Text, nullable=True)  # alt-text, transcript, audio description
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    lesson = relationship("Lesson", back_populates="resources")

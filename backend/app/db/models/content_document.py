import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class ContentDocument(Base):
    __tablename__ = "content_documents"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    teacher_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False,
    )

    file_name = Column(
        String,
        nullable=False,
    )

    storage_path = Column(
        String,
        nullable=False,
    )

    subject_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("subjects.id", ondelete="SET NULL"),
        nullable=True,
    )

    topic_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
    )

    grade = Column(
        Integer,
        nullable=True,
    )

    language = Column(
        String,
        nullable=False,
        default="en",
    )

    difficulty = Column(
        String,
        nullable=False,
        default="beginner",
    )

    status = Column(
        String,
        nullable=False,
        default="uploaded",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )

    # Relationships
    chunks = relationship(
        "ContentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
    )

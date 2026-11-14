import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID, VectorType


class ContentDocument(Base):
    """Metadata for uploaded learning documents stored in Supabase Storage."""
    __tablename__ = "content_documents"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(GUID(), ForeignKey("teachers.id", ondelete="CASCADE"), index=True, nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(1024), nullable=False)
    subject_id = Column(GUID(), ForeignKey("subjects.id", ondelete="CASCADE"), index=True, nullable=False)
    topic_id = Column(GUID(), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    grade = Column(Integer, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    difficulty = Column(String(50), default="beginner", nullable=False)
    status = Column(String(50), default="uploaded", nullable=False)  # uploaded, processing, processed, failed
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    teacher = relationship("Teacher", back_populates="content_documents")
    subject = relationship("Subject", back_populates="content_documents")
    topic = relationship("Topic", back_populates="content_documents")
    chunks = relationship("ContentChunk", back_populates="document", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="source_document")


class ContentChunk(Base):
    """Extracted text chunk with vector embedding for RAG retrieval."""
    __tablename__ = "content_chunks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    document_id = Column(GUID(), ForeignKey("content_documents.id", ondelete="CASCADE"), index=True, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(VectorType(768), nullable=True)
    page_number = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=False)
    chunk_metadata = Column(JSON, nullable=True)

    # Relationships
    document = relationship("ContentDocument", back_populates="chunks")

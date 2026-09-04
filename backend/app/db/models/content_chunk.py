import uuid

from sqlalchemy import Column, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class ContentChunk(Base):
    __tablename__ = "content_chunks"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    document_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("content_documents.id", ondelete="CASCADE"),
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    embedding = Column(
        Text,
        nullable=True,
        comment="Vector embedding stored as JSON-encoded array of floats",
    )

    page_number = Column(
        Integer,
        nullable=True,
    )

    chunk_index = Column(
        Integer,
        nullable=False,
        default=0,
    )

    metadata_json = Column(
        JSONB,
        nullable=True,
    )

    # Relationships
    document = relationship(
        "ContentDocument",
        back_populates="chunks",
    )

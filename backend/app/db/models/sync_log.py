"""
SyncLog model — tracks synced local_id strings for idempotency.

Each row records that a particular (student_id, local_id) pair has been
successfully processed. A UNIQUE constraint on (student_id, local_id)
prevents duplicate processing even under concurrent retries.
"""
import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id"),
        nullable=False,
    )

    local_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="unknown",
    )

    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("student_id", "local_id", name="uq_sync_logs_student_local"),
    )

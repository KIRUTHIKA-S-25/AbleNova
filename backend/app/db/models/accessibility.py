import uuid

from sqlalchemy import Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class AccessibilityProfile(Base):
    __tablename__ = "accessibility_profiles"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id"),
        primary_key=True,
    )

    text_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    audio_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    captions_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    simplified_content: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    large_text: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    high_contrast: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    reduced_motion: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    keyboard_navigation: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    student = relationship(
        "Student",
        back_populates="accessibility_profile",
    )

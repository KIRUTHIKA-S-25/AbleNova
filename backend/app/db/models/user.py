import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.db.models.base import GUID, TimestampMixin


class User(Base, TimestampMixin):
    """User account model for authentication, authorization, and base profile."""
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")
    password_hash = Column(String(255), nullable=False)

    # 1-to-1 role extensions
    student = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    teacher = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")
    caregiver = relationship("Caregiver", back_populates="user", uselist=False, cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Teacher(Base):
    """Teacher profile entity managing students and uploaded learning content."""
    __tablename__ = "teachers"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="teacher")
    students = relationship("Student", secondary="teacher_students", back_populates="teachers")
    content_documents = relationship("ContentDocument", back_populates="teacher", cascade="all, delete-orphan")


class Caregiver(Base):
    """Caregiver profile entity monitoring student progress."""
    __tablename__ = "caregivers"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="caregiver")
    students = relationship("Student", secondary="caregiver_students", back_populates="caregivers")


class TeacherStudent(Base):
    """Explicit authorized relationship between teachers and students."""
    __tablename__ = "teacher_students"

    teacher_id = Column(GUID(), ForeignKey("teachers.id", ondelete="CASCADE"), primary_key=True)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )


class CaregiverStudent(Base):
    """Explicit authorized relationship between caregivers and students."""
    __tablename__ = "caregiver_students"

    caregiver_id = Column(GUID(), ForeignKey("caregivers.id", ondelete="CASCADE"), primary_key=True)
    student_id = Column(GUID(), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    relationship_type = Column(String(50), default="guardian", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )


class RefreshToken(Base):
    """Persistent storage for refresh tokens with rotation and revocation support."""
    __tablename__ = "refresh_tokens"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    jti = Column(String(255), unique=True, index=True, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")


class FailedLoginAttempt(Base):
    """Tracks failed authentication attempts for persistent rate limiting across workers."""
    __tablename__ = "failed_login_attempts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    identifier = Column(String(255), index=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    attempted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

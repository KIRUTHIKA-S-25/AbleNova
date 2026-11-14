from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema, UserRole


class UserBase(BaseSchema):
    """Base fields for User entity."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=6, max_length=128)


class UserUpdate(BaseSchema):
    """Schema for updating user details."""
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[UserRole] = None


class UserRead(UserBase):
    """Public user response model — never exposes password_hash."""
    id: UUID
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseSchema):
    """Authentication token response adhering to API_CONTRACT.md Section 2."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class TeacherRead(BaseSchema):
    """Teacher profile details."""
    id: UUID
    user_id: UUID
    created_at: datetime
    user: Optional[UserRead] = None


class CaregiverRead(BaseSchema):
    """Caregiver profile details."""
    id: UUID
    user_id: UUID
    created_at: datetime
    user: Optional[UserRead] = None

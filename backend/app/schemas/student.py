from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema
from app.schemas.user import UserRead


class AccessibilityProfileBase(BaseSchema):
    """Child privacy-preserving accessibility preferences.
    Contains strictly assistive presentation settings with zero medical diagnosis fields.
    """
    text_enabled: bool = True
    audio_enabled: bool = False
    captions_enabled: bool = False
    simplified_content: bool = False
    large_text: bool = False
    high_contrast: bool = False
    reduced_motion: bool = False
    keyboard_navigation: bool = True


class AccessibilityProfileUpdate(BaseSchema):
    """Partial update for accessibility preferences."""
    text_enabled: Optional[bool] = None
    audio_enabled: Optional[bool] = None
    captions_enabled: Optional[bool] = None
    simplified_content: Optional[bool] = None
    large_text: Optional[bool] = None
    high_contrast: Optional[bool] = None
    reduced_motion: Optional[bool] = None
    keyboard_navigation: Optional[bool] = None


class AccessibilityProfileRead(AccessibilityProfileBase):
    student_id: UUID
    updated_at: datetime


class StudentBase(BaseSchema):
    age: int = Field(..., ge=3, le=25, description="Student age in years")
    grade: int = Field(..., ge=1, le=12, description="Educational grade level")
    preferred_language: str = Field(default="en", min_length=2, max_length=10)


class StudentCreate(StudentBase):
    user_id: UUID
    accessibility: Optional[AccessibilityProfileBase] = None


class StudentUpdate(BaseSchema):
    age: Optional[int] = Field(None, ge=3, le=25)
    grade: Optional[int] = Field(None, ge=1, le=12)
    preferred_language: Optional[str] = Field(None, min_length=2, max_length=10)
    accessibility: Optional[AccessibilityProfileUpdate] = None


class StudentRead(StudentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    accessibility_profile: Optional[AccessibilityProfileBase] = None


class StudentProfileResponse(BaseSchema):
    """Standard Student profile response format per API_CONTRACT.md Section 3."""
    student_id: str
    name: str
    age: int
    grade: int
    preferred_language: str
    accessibility: AccessibilityProfileBase

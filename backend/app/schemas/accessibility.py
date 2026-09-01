from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AccessibilityProfileCreate(BaseModel):
    text_enabled: bool = True
    audio_enabled: bool = False
    captions_enabled: bool = True
    simplified_content: bool = False
    large_text: bool = False
    high_contrast: bool = False
    reduced_motion: bool = False
    keyboard_navigation: bool = True


class AccessibilityProfileResponse(BaseModel):
    student_id: UUID

    text_enabled: bool
    audio_enabled: bool
    captions_enabled: bool
    simplified_content: bool
    large_text: bool
    high_contrast: bool
    reduced_motion: bool
    keyboard_navigation: bool

    model_config = ConfigDict(
        from_attributes=True
    )
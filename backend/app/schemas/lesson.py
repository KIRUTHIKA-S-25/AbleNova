from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LessonCreate(BaseModel):
    topic_id: UUID
    title: str
    difficulty: str
    language: str
    estimated_minutes: int
    standard_content: str | None = None
    simplified_content: str | None = None
    audio_url: str | None = None
    caption_text: str | None = None
    source_document_id: UUID | None = None


class LessonResponse(BaseModel):
    id: UUID
    topic_id: UUID
    title: str
    difficulty: str
    language: str
    estimated_minutes: int
    standard_content: str | None = None
    simplified_content: str | None = None
    audio_url: str | None = None
    caption_text: str | None = None
    source_document_id: UUID | None = None

    model_config = ConfigDict(from_attributes=True)

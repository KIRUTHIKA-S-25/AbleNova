from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema, DifficultyLevel


# ==============================================================================
# Subject Schemas
# ==============================================================================

class SubjectBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class SubjectRead(SubjectBase):
    id: UUID
    created_at: datetime


class SubjectItemResponse(BaseSchema):
    """Subject list item adhering to API_CONTRACT.md Section 4."""
    id: str
    name: str
    description: Optional[str] = None
    progress: float = Field(default=0.0, ge=0.0, le=1.0)


class SubjectListResponse(BaseSchema):
    subjects: List[SubjectItemResponse]


# ==============================================================================
# Topic Schemas
# ==============================================================================

class TopicBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE
    order_index: int = 0


class TopicCreate(TopicBase):
    subject_id: UUID


class TopicUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    order_index: Optional[int] = None


class TopicRead(TopicBase):
    id: UUID
    subject_id: UUID
    created_at: datetime


class TopicItemResponse(BaseSchema):
    """Topic list item adhering to API_CONTRACT.md Section 5."""
    id: str
    subject_id: str
    name: str
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    mastery: float = Field(default=0.0, ge=0.0, le=1.0)
    difficulty: str


class TopicListResponse(BaseSchema):
    topics: List[TopicItemResponse]


# ==============================================================================
# Lesson Schemas
# ==============================================================================

class LessonContent(BaseSchema):
    """Structured lesson content presentation for adaptive client-side rendering."""
    standard: str
    simplified: str
    audio_url: Optional[str] = None
    caption_text: Optional[str] = None


class LessonBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255)
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    language: str = Field(default="en", min_length=2, max_length=10)
    estimated_minutes: int = Field(default=10, ge=1)
    standard_content: str
    simplified_content: str
    audio_url: Optional[str] = None
    caption_text: Optional[str] = None


class LessonCreate(LessonBase):
    topic_id: UUID
    source_document_id: Optional[UUID] = None


class LessonUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    difficulty: Optional[DifficultyLevel] = None
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    estimated_minutes: Optional[int] = Field(None, ge=1)
    standard_content: Optional[str] = None
    simplified_content: Optional[str] = None
    audio_url: Optional[str] = None
    caption_text: Optional[str] = None


class LessonRead(LessonBase):
    id: UUID
    topic_id: UUID
    source_document_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class LessonDetailResponse(BaseSchema):
    """Lesson response format adhering to API_CONTRACT.md Section 6."""
    id: str
    topic_id: str
    title: str
    difficulty: str
    language: str
    estimated_minutes: int
    content: LessonContent

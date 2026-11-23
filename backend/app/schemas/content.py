from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema, DifficultyLevel


class ContentDocumentBase(BaseSchema):
    file_name: str = Field(..., min_length=1, max_length=255)
    grade: int = Field(..., ge=1, le=12)
    language: str = Field(default="en", min_length=2, max_length=10)
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER


class ContentDocumentCreate(ContentDocumentBase):
    teacher_id: UUID
    storage_path: str
    subject_id: UUID
    topic_id: UUID


class ContentDocumentRead(ContentDocumentBase):
    id: UUID
    teacher_id: UUID
    storage_path: str
    subject_id: UUID
    topic_id: UUID
    status: str
    created_at: datetime


class ContentChunkBase(BaseSchema):
    content: str
    page_number: Optional[int] = None
    chunk_index: int = 0
    chunk_metadata: Optional[Dict[str, Any]] = None


class ContentChunkCreate(ContentChunkBase):
    document_id: UUID
    embedding: Optional[List[float]] = None


class ContentChunkRead(ContentChunkBase):
    id: UUID
    document_id: UUID


# ==============================================================================
# AI Explanation Schemas (API_CONTRACT.md Section 13)
# ==============================================================================

class AIExplanationRequest(BaseSchema):
    """Student question request adhering to API_CONTRACT.md Section 13."""
    lesson_id: str
    question: str = Field(..., min_length=1)
    mode: str = Field(default="simplified", description="standard, simplified, hint, example, summary")


class AIExplanationResponse(BaseSchema):
    """AI answer response adhering to API_CONTRACT.md Section 13."""
    response: str
    source_ids: List[str] = Field(default_factory=list)
    mode: str

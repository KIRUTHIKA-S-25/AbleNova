from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RecommendationCreate(BaseModel):
    student_id: UUID
    lesson_id: UUID
    reason: str
    difficulty: str
    estimated_minutes: int


class RecommendationStatusUpdate(BaseModel):
    status: str


class RecommendationResponse(BaseModel):
    id: UUID
    student_id: UUID
    lesson_id: UUID
    reason: str
    difficulty: str
    estimated_minutes: int
    created_at: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CaregiverCreateRequest(BaseModel):
    pass


class CaregiverResponse(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaregiverStudentProgressResponse(BaseModel):
    progress: float
    strengths: list[dict] = []
    areas_for_practice: list[dict] = []
    completed_lessons: int = 0
    recommendations: list[dict] = []

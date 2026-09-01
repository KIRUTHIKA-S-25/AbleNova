from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LearningPathItemCreate(BaseModel):
    student_id: UUID
    lesson_id: UUID
    order_index: int
    reason: str | None = None
    status: str = "pending"


class LearningPathStatusUpdate(BaseModel):
    status: str


class LearningPathItemResponse(BaseModel):
    id: UUID
    student_id: UUID
    lesson_id: UUID
    order_index: int
    reason: str | None = None
    status: str

    model_config = ConfigDict(from_attributes=True)

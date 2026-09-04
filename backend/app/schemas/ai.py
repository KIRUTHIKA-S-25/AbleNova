from uuid import UUID

from pydantic import BaseModel


class AIExplanationRequest(BaseModel):
    lesson_id: UUID | None = None
    question: str
    mode: str = "standard"  # standard, simplified, hint, example, summary


class AIExplanationResponse(BaseModel):
    response: str
    source_ids: list[str] = []
    mode: str

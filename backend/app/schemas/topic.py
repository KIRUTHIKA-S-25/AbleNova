from uuid import UUID

from pydantic import BaseModel


class TopicCreate(BaseModel):
    subject_id: UUID
    name: str
    description: str | None = None


class TopicResponse(BaseModel):
    id: UUID
    subject_id: UUID
    name: str
    description: str | None = None

    model_config = {
        "from_attributes": True
    }
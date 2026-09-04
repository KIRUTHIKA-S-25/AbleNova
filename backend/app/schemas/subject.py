from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SubjectBase(BaseModel):
    name: str
    description: str | None = None


class SubjectResponse(SubjectBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

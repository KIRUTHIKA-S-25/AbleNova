from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StudentCreateRequest(BaseModel):
    age: int
    grade: int
    preferred_language: str


class StudentResponse(BaseModel):
    id: UUID
    user_id: UUID
    age: int
    grade: int
    preferred_language: str

    model_config = ConfigDict(from_attributes=True)

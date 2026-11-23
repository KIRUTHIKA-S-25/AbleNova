from enum import Enum
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base Pydantic schema configured for ORM compatibility."""
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
    )


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    CAREGIVER = "caregiver"
    ADMIN = "admin"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ContentStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"


class RecommendationStatus(str, Enum):
    RECOMMENDED = "recommended"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISMISSED = "dismissed"

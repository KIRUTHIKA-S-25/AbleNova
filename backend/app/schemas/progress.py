from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# LEARNING SESSION
# ============================================================

class LearningSessionCreateRequest(BaseModel):
    lesson_id: UUID


class LearningSessionResponse(BaseModel):
    id: UUID
    student_id: UUID
    lesson_id: UUID
    started_at: datetime
    completed_at: datetime | None
    duration_seconds: int | None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# ENGAGEMENT
# ============================================================

class EngagementCreateRequest(BaseModel):
    event_type: str
    lesson_id: UUID | None = None
    duration_seconds: int | None = None


class EngagementResponse(BaseModel):
    id: UUID
    student_id: UUID
    event_type: str
    lesson_id: UUID | None
    timestamp: datetime
    duration_seconds: int | None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PROGRESS OVERVIEW
# ============================================================

class ProgressOverviewResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    total_learning_time_seconds: int
    engagement_events: int
    average_mastery: float


# ============================================================
# MASTERY
# ============================================================

class MasteryResponse(BaseModel):
    student_id: UUID
    topic_id: UUID
    mastery_score: float
    confidence: float
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# LEARNING PATH
# ============================================================

class LearningPathResponse(BaseModel):
    id: UUID
    student_id: UUID
    lesson_id: UUID
    order_index: int
    reason: str | None
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )
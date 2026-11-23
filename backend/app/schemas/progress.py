from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema


# ==============================================================================
# Mastery Schemas
# ==============================================================================

class StudentTopicMasteryBase(BaseSchema):
    mastery_score: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)


class StudentTopicMasteryRead(StudentTopicMasteryBase):
    student_id: UUID
    topic_id: UUID
    updated_at: datetime


# ==============================================================================
# Progress Overview Schemas
# ==============================================================================

class StudentProgressResponse(BaseSchema):
    """Progress overview format adhering to API_CONTRACT.md Section 10."""
    overall_progress: float = Field(..., ge=0.0, le=1.0)
    subjects: List[Any] = Field(default_factory=list)
    recent_scores: List[Any] = Field(default_factory=list)
    weak_topics: List[Any] = Field(default_factory=list)
    strong_topics: List[Any] = Field(default_factory=list)
    learning_time_minutes: int = Field(default=0, ge=0)


# ==============================================================================
# Recommendation Schemas
# ==============================================================================

class RecommendationRead(BaseSchema):
    """Adaptive recommendation item adhering to API_CONTRACT.md Section 11."""
    id: str
    lesson_id: str
    title: str
    reason: str
    difficulty: str
    estimated_minutes: int


class RecommendationsResponse(BaseSchema):
    recommendations: List[RecommendationRead]


# ==============================================================================
# Learning Path Schemas
# ==============================================================================

class LearningPathItemRead(BaseSchema):
    """Personalized learning path sequence item adhering to API_CONTRACT.md Section 12."""
    lesson_id: str
    order: int
    reason: str
    status: str = "recommended"


class LearningPathResponse(BaseSchema):
    items: List[LearningPathItemRead]


# ==============================================================================
# Sessions & Telemetry Schemas
# ==============================================================================

class LearningSessionCreate(BaseSchema):
    student_id: UUID
    lesson_id: UUID


class LearningSessionRead(BaseSchema):
    id: UUID
    student_id: UUID
    lesson_id: UUID
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None


class EngagementEventCreate(BaseSchema):
    student_id: UUID
    event_type: str = Field(..., min_length=1, max_length=100)
    lesson_id: Optional[UUID] = None
    duration_seconds: Optional[int] = None


class EngagementEventRead(EngagementEventCreate):
    id: UUID
    timestamp: datetime

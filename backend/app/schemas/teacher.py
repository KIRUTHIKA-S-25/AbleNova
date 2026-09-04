from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TeacherCreateRequest(BaseModel):
    pass


class TeacherResponse(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeacherStudentSummaryItem(BaseModel):
    student_id: UUID
    name: str
    progress: float
    mastery: float
    engagement: float
    last_active: str | None = None


class TeacherStudentsListResponse(BaseModel):
    students: list[TeacherStudentSummaryItem] = []


class TeacherStudentDetailResponse(BaseModel):
    student_id: UUID
    name: str
    age: int
    grade: int
    preferred_language: str
    overall_progress: float
    average_mastery: float
    completed_sessions_count: int
    total_study_minutes: int
    mastery_by_topic: list[dict] = []
    recent_quiz_attempts: list[dict] = []


class TeacherAnalyticsResponse(BaseModel):
    average_progress: float
    difficult_topics: list[dict] = []
    performance_trend: list[dict] = []
    engagement_trend: list[dict] = []

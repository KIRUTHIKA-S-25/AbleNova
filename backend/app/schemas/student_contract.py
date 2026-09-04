from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AccessibilityPreferences(BaseModel):
    text_enabled: bool = True
    audio_enabled: bool = True
    captions_enabled: bool = True
    simplified_content: bool = True
    large_text: bool = False
    high_contrast: bool = False
    reduced_motion: bool = False
    keyboard_navigation: bool = True

    model_config = ConfigDict(from_attributes=True)


class StudentProfileResponse(BaseModel):
    student_id: UUID
    name: str
    age: int
    grade: int
    preferred_language: str
    accessibility: AccessibilityPreferences

    model_config = ConfigDict(from_attributes=True)


class StudentProfileUpdateRequest(BaseModel):
    preferred_language: str | None = None
    age: int | None = None
    grade: int | None = None
    accessibility: AccessibilityPreferences | None = None


class SubjectProgressItem(BaseModel):
    subject_id: UUID
    name: str
    progress: float


class RecentScoreItem(BaseModel):
    quiz_id: UUID
    quiz_title: str
    score: int
    total: int
    accuracy: float
    created_at: str


class TopicPerformanceItem(BaseModel):
    topic_id: UUID
    topic_name: str
    mastery_score: float
    confidence: float


class StudentProgressResponse(BaseModel):
    overall_progress: float
    subjects: list[SubjectProgressItem] = []
    recent_scores: list[RecentScoreItem] = []
    weak_topics: list[TopicPerformanceItem] = []
    strong_topics: list[TopicPerformanceItem] = []
    learning_time_minutes: int = 0


class StudentRecommendationItem(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str
    reason: str
    difficulty: str
    estimated_minutes: int


class StudentRecommendationsResponse(BaseModel):
    recommendations: list[StudentRecommendationItem] = []


class StudentLearningPathItemResponse(BaseModel):
    lesson_id: UUID
    order: int
    reason: str | None = None
    status: str


class StudentLearningPathResponse(BaseModel):
    items: list[StudentLearningPathItemResponse] = []

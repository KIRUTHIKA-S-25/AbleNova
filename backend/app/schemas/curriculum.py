from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema, DifficultyLevel


# ==============================================================================
# Subject Schemas
# ==============================================================================

class SubjectBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    grade_level_min: int = Field(default=1, ge=1, le=12)
    grade_level_max: int = Field(default=12, ge=1, le=12)
    is_active: bool = True
    language: str = Field(default="en", min_length=2, max_length=10)


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    grade_level_min: Optional[int] = Field(None, ge=1, le=12)
    grade_level_max: Optional[int] = Field(None, ge=1, le=12)
    is_active: Optional[bool] = None
    language: Optional[str] = Field(None, min_length=2, max_length=10)


class SubjectRead(SubjectBase):
    id: UUID
    created_at: datetime


class SubjectItemResponse(BaseSchema):
    """Subject list item adhering to API_CONTRACT.md Section 4 with curriculum metadata."""
    id: str
    name: str
    description: Optional[str] = None
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    grade_level_min: int = 1
    grade_level_max: int = 12
    is_active: bool = True
    language: str = "en"


class SubjectListResponse(BaseSchema):
    subjects: List[SubjectItemResponse]


# ==============================================================================
# Topic Schemas
# ==============================================================================

class TopicBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE
    order_index: int = 0
    grade_level: int = Field(default=5, ge=1, le=12)
    is_active: bool = True
    prerequisite_topic_id: Optional[UUID] = None


class TopicCreate(TopicBase):
    subject_id: UUID


class TopicUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    order_index: Optional[int] = None
    grade_level: Optional[int] = Field(None, ge=1, le=12)
    is_active: Optional[bool] = None
    prerequisite_topic_id: Optional[UUID] = None


class TopicRead(TopicBase):
    id: UUID
    subject_id: UUID
    created_at: datetime


class TopicItemResponse(BaseSchema):
    """Topic list item adhering to API_CONTRACT.md Section 5 with progression metadata."""
    id: str
    subject_id: str
    name: str
    description: Optional[str] = None
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    mastery: float = Field(default=0.0, ge=0.0, le=1.0)
    difficulty: str
    order_index: int = 0
    grade_level: int = 5
    is_active: bool = True
    prerequisite_topic_id: Optional[str] = None
    is_locked: bool = False
    is_completed: bool = False


class TopicListResponse(BaseSchema):
    topics: List[TopicItemResponse]


# ==============================================================================
# Learning Objective & Lesson Resource Schemas
# ==============================================================================

class LearningObjectiveBase(BaseSchema):
    description: str = Field(..., min_length=1)
    order_index: int = 0


class LearningObjectiveCreate(LearningObjectiveBase):
    pass


class LearningObjectiveRead(LearningObjectiveBase):
    id: UUID
    lesson_id: UUID
    created_at: datetime


class LessonResourceBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255)
    resource_type: str = Field(..., min_length=1, max_length=50)  # e.g., document, audio, video, image, worksheet, link
    url: str = Field(..., min_length=1, max_length=1024)
    file_size_bytes: Optional[int] = None
    format: Optional[str] = Field(None, max_length=50)  # e.g., pdf, mp3, mp4, png
    accessibility_description: Optional[str] = None


class LessonResourceCreate(LessonResourceBase):
    pass


class LessonResourceRead(LessonResourceBase):
    id: UUID
    lesson_id: UUID
    created_at: datetime


class LessonAccessibilityMetadata(BaseSchema):
    """Metadata describing accessibility capabilities of an educational lesson."""
    has_audio: bool = False
    has_captions: bool = False
    has_simplified: bool = True
    text_alternatives: bool = True
    keyboard_accessible: bool = True
    high_contrast_ready: bool = True
    screen_reader_optimized: bool = True
    reduced_motion_compatible: bool = True
    supported_languages: List[str] = ["en"]


# ==============================================================================
# Lesson Schemas
# ==============================================================================

class LessonContent(BaseSchema):
    """Structured lesson content presentation for adaptive client-side rendering."""
    standard: str
    simplified: str
    audio_url: Optional[str] = None
    caption_text: Optional[str] = None


class LessonBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    language: str = Field(default="en", min_length=2, max_length=10)
    estimated_minutes: int = Field(default=10, ge=1)
    grade_level: int = Field(default=5, ge=1, le=12)
    standard_content: str
    simplified_content: str
    audio_url: Optional[str] = None
    caption_text: Optional[str] = None
    is_published: bool = True
    accessibility_metadata: Optional[LessonAccessibilityMetadata] = None


class LessonCreate(LessonBase):
    topic_id: UUID
    source_document_id: Optional[UUID] = None


class LessonUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    estimated_minutes: Optional[int] = Field(None, ge=1)
    grade_level: Optional[int] = Field(None, ge=1, le=12)
    standard_content: Optional[str] = None
    simplified_content: Optional[str] = None
    audio_url: Optional[str] = None
    caption_text: Optional[str] = None
    is_published: Optional[bool] = None
    accessibility_metadata: Optional[LessonAccessibilityMetadata] = None


class LessonRead(LessonBase):
    id: UUID
    topic_id: UUID
    source_document_id: Optional[UUID] = None
    created_by_teacher_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class LessonItemResponse(BaseSchema):
    """Lesson list and search result item."""
    id: str
    topic_id: str
    title: str
    description: Optional[str] = None
    difficulty: str
    language: str
    estimated_minutes: int
    grade_level: int = 5
    is_published: bool = True
    has_audio: bool = False
    has_simplified: bool = True


class LessonDetailResponse(BaseSchema):
    """Lesson response format adhering to API_CONTRACT.md Section 6 with curriculum extensions."""
    id: str
    topic_id: str
    title: str
    description: Optional[str] = None
    difficulty: str
    language: str
    estimated_minutes: int
    grade_level: int = 5
    is_published: bool = True
    content: LessonContent
    accessibility: Optional[LessonAccessibilityMetadata] = None
    objectives: List[LearningObjectiveRead] = []
    resources: List[LessonResourceRead] = []
    created_by_teacher_id: Optional[str] = None


class LessonSearchResponse(BaseSchema):
    """Paginated search response for curriculum lessons."""
    total: int
    page: int
    size: int
    lessons: List[LessonItemResponse]


# ==============================================================================
# Subject & Topic Detail Responses
# ==============================================================================

class SubjectDetailResponse(BaseSchema):
    """Subject detail view including associated topics."""
    id: str
    name: str
    description: Optional[str] = None
    grade_level_min: int = 1
    grade_level_max: int = 12
    is_active: bool = True
    language: str = "en"
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    created_at: datetime
    topics: List[TopicItemResponse] = []


class TopicDetailResponse(BaseSchema):
    """Topic detail view including associated lessons and prerequisite info."""
    id: str
    subject_id: str
    name: str
    description: Optional[str] = None
    difficulty: str
    order_index: int = 0
    grade_level: int = 5
    is_active: bool = True
    prerequisite_topic_id: Optional[str] = None
    is_locked: bool = False
    is_completed: bool = False
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    mastery: float = Field(default=0.0, ge=0.0, le=1.0)
    created_at: datetime
    lessons: List[LessonItemResponse] = []


# ==============================================================================
# Student-Specific Curriculum Responses
# ==============================================================================

class StudentTopicStatus(BaseSchema):
    """Topic progression node personalized for a student."""
    id: str
    subject_id: str
    name: str
    description: Optional[str] = None
    order_index: int
    difficulty: str
    grade_level: int
    mastery: float
    progress: float
    is_completed: bool
    is_locked: bool
    prerequisite_topic_id: Optional[str] = None
    lesson_count: int = 0


class StudentSubjectStatus(BaseSchema):
    """Subject progression container personalized for a student."""
    id: str
    name: str
    description: Optional[str] = None
    progress: float
    topics: List[StudentTopicStatus] = []


class StudentCurriculumResponse(BaseSchema):
    """Personalized curriculum overview for a student."""
    student_id: str
    grade: int
    preferred_language: str
    accessibility_summary: Dict[str, Any]
    overall_progress: float
    completed_topics_count: int
    total_topics_count: int
    subjects: List[StudentSubjectStatus] = []


class NextLessonRecommendation(BaseSchema):
    """Accessible next lesson recommendation."""
    id: str
    topic_id: str
    title: str
    difficulty: str
    language: str
    estimated_minutes: int
    grade_level: int
    is_published: bool
    has_audio: bool
    has_simplified: bool
    accessibility_tags: List[str] = []


class StudentCurriculumNextResponse(BaseSchema):
    """Deterministic next topic and lesson recommendation in student progression sequence."""
    student_id: str
    subject: Optional[Dict[str, str]] = None
    topic: Optional[StudentTopicStatus] = None
    next_lesson: Optional[NextLessonRecommendation] = None
    recommendation_reason: str

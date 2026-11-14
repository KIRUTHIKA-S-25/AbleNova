from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema, DifficultyLevel


# ==============================================================================
# Question Schemas
# ==============================================================================

class QuestionBase(BaseSchema):
    question_text: str = Field(..., min_length=1)
    question_type: str = Field(default="multiple_choice", description="multiple_choice, multiple_select, true_false")
    options: List[Any] = Field(..., min_length=2, description="List of choices/options")
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    order_index: int = 0
    marks: int = Field(default=1, ge=1)


class QuestionCreate(QuestionBase):
    quiz_id: Optional[UUID] = None
    topic_id: UUID
    correct_answer: str = Field(..., min_length=1, description="Official correct answer, backend only")
    explanation: Optional[str] = None


class QuestionUpdate(BaseSchema):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[List[Any]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    order_index: Optional[int] = None
    marks: Optional[int] = Field(None, ge=1)
    topic_id: Optional[UUID] = None


class QuestionRead(BaseSchema):
    """Client-facing question representation.
    CRITICAL SECURITY RULE: The response MUST NOT contain correct_answer or explanation!
    Adheres strictly to API_CONTRACT.md Section 7.
    """
    id: str
    type: str = Field(default="multiple_choice", serialization_alias="type")
    question: str = Field(..., serialization_alias="question")
    options: List[Any]
    difficulty: str
    marks: int = 1


class QuestionAdminRead(QuestionBase):
    """Internal/Admin representation containing answer key and explanation."""
    id: UUID
    quiz_id: UUID
    topic_id: UUID
    correct_answer: str
    explanation: Optional[str] = None
    created_at: datetime


# ==============================================================================
# Quiz Schemas
# ==============================================================================

class QuizBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    passing_threshold: float = Field(default=0.70, ge=0.0, le=1.0)
    max_attempts: Optional[int] = Field(default=None, ge=1)


class QuizCreate(QuizBase):
    lesson_id: UUID
    topic_id: Optional[UUID] = None
    is_published: bool = False
    questions: Optional[List[QuestionCreate]] = None


class QuizUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_published: Optional[bool] = None
    passing_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    max_attempts: Optional[int] = Field(None, ge=1)
    topic_id: Optional[UUID] = None


class QuizRead(BaseSchema):
    """Client-facing quiz representation adhering to API_CONTRACT.md Section 7."""
    id: str
    lesson_id: str
    title: str
    description: Optional[str] = None
    passing_threshold: float = 0.70
    questions: List[QuestionRead]


class QuizAdminRead(QuizBase):
    """Teacher/Admin quiz representation including publication and question details."""
    id: UUID
    lesson_id: UUID
    topic_id: Optional[UUID] = None
    is_published: bool
    created_at: datetime
    questions: List[QuestionAdminRead] = Field(default_factory=list)


class QuizItemResponse(BaseSchema):
    """Summary item for quiz listings."""
    id: str
    lesson_id: str
    topic_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    is_published: bool
    passing_threshold: float
    max_attempts: Optional[int] = None
    questions_count: int
    created_at: datetime


# ==============================================================================
# Quiz Submission & Result Schemas
# ==============================================================================

class AnswerSubmission(BaseSchema):
    """Individual question answer submitted by student per API_CONTRACT.md Section 8."""
    question_id: str
    answer: str
    time_taken_seconds: int = Field(default=0, ge=0)


class QuizSubmission(BaseSchema):
    """Complete quiz submission payload evaluated on the backend."""
    client_submission_id: Optional[str] = Field(None, description="Idempotency token preventing duplicate submissions")
    answers: List[AnswerSubmission]


class TopicResultItem(BaseSchema):
    topic_id: str
    accuracy: float = Field(..., ge=0.0, le=1.0)


class QuestionResultItem(BaseSchema):
    """Detailed question-level outcome returned after submission or during review."""
    question_id: str
    question_text: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    marks_obtained: float
    marks_possible: int
    explanation: Optional[str] = None


class QuizResultResponse(BaseSchema):
    """Official evaluated quiz result returned per API_CONTRACT.md Section 9."""
    attempt_id: Optional[str] = None
    score: int
    total: int
    accuracy: float = Field(..., ge=0.0, le=1.0)
    is_passed: bool = False
    time_taken_seconds: int
    topic_results: List[TopicResultItem]
    feedback: str
    recommendation_id: Optional[str] = None
    question_results: Optional[List[QuestionResultItem]] = None


class QuizAttemptRead(BaseSchema):
    """Historic quiz attempt record."""
    id: str
    quiz_id: str
    student_id: str
    score: int
    total_questions: int
    accuracy: float
    is_passed: bool
    time_taken_seconds: int
    feedback: Optional[str] = None
    created_at: datetime

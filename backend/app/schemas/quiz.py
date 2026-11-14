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
    question_type: str = "multiple_choice"
    options: List[Any] = Field(..., min_length=2, description="List of choices/options")
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    order_index: int = 0


class QuestionCreate(QuestionBase):
    quiz_id: UUID
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


class QuestionRead(BaseSchema):
    """Client-facing question representation.
    CRITICAL SECURITY RULE: The response MUST NOT contain correct_answer!
    Adheres strictly to API_CONTRACT.md Section 7.
    """
    id: str
    type: str = Field(default="multiple_choice", serialization_alias="type")
    question: str = Field(..., serialization_alias="question")
    options: List[Any]
    difficulty: str


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


class QuizCreate(QuizBase):
    lesson_id: UUID


class QuizUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class QuizRead(BaseSchema):
    """Client-facing quiz representation adhering to API_CONTRACT.md Section 7."""
    id: str
    lesson_id: str
    title: str
    questions: List[QuestionRead]


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
    answers: List[AnswerSubmission]


class TopicResultItem(BaseSchema):
    topic_id: str
    accuracy: float = Field(..., ge=0.0, le=1.0)


class QuizResultResponse(BaseSchema):
    """Official evaluated quiz result returned per API_CONTRACT.md Section 9."""
    score: int
    total: int
    accuracy: float = Field(..., ge=0.0, le=1.0)
    time_taken_seconds: int
    topic_results: List[TopicResultItem]
    feedback: str
    recommendation_id: Optional[str] = None

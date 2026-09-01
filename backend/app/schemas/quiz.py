from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class QuestionResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    topic_id: UUID
    question_text: str
    question_type: str
    options: Any | None = None
    explanation: str | None = None
    difficulty: str

    model_config = ConfigDict(from_attributes=True)


class QuizResponse(BaseModel):
    id: UUID
    lesson_id: UUID
    title: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class QuizDetailResponse(QuizResponse):
    questions: list[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptResponse(BaseModel):
    id: UUID
    student_id: UUID
    quiz_id: UUID
    score: int
    total_questions: int
    accuracy: float
    time_taken_seconds: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionAnswerSubmit(BaseModel):
    question_id: UUID
    student_answer: str
    time_taken_seconds: int = 0


class QuestionAttemptResponse(BaseModel):
    id: UUID
    attempt_id: UUID
    question_id: UUID
    student_answer: str
    is_correct: bool
    time_taken_seconds: int

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptCompleteRequest(BaseModel):
    time_taken_seconds: int | None = None

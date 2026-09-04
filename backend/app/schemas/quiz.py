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
    answer: str | None = None
    student_answer: str | None = None
    selected_answer: str | None = None
    time_taken_seconds: int = 0

    def get_answer(self) -> str:
        if self.answer is not None:
            return self.answer
        if self.student_answer is not None:
            return self.student_answer
        if self.selected_answer is not None:
            return self.selected_answer
        return ""


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


class QuizSubmitRequest(BaseModel):
    answers: list[QuestionAnswerSubmit]
    time_taken_seconds: int | None = None


class TopicResultItem(BaseModel):
    topic_id: UUID
    accuracy: float


class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    accuracy: float
    time_taken_seconds: int
    topic_results: list[TopicResultItem] = []
    feedback: str | None = None
    recommendation_id: UUID | None = None
    attempt_id: UUID | None = None

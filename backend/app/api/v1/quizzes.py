from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.db.models.quiz import Quiz
from app.db.models.question import Question
from app.db.models.quiz_attempt import QuizAttempt
from app.db.models.question_attempt import QuestionAttempt
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.quiz import (
    QuizResponse,
    QuestionResponse,
    QuizAttemptResponse,
    QuestionAnswerSubmit,
    QuestionAttemptResponse,
    QuizAttemptCompleteRequest,
    QuizSubmitRequest,
    # Mastery recalculation service
    # Import after schemas

)


router = APIRouter(
    prefix="",
    tags=["Quizzes"],
)


def get_authenticated_student(
    current_user: User,
    db: Session,
) -> Student:
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    return student


# ============================================================
# QUIZ ENDPOINTS
# ============================================================

@router.get(
    "/quizzes/lesson/{lesson_id}",
    response_model=list[QuizResponse],
)
def get_quizzes_by_lesson(
    lesson_id: UUID,
    db: Session = Depends(get_db),
):
    return (
        db.query(Quiz)
        .filter(Quiz.lesson_id == lesson_id)
        .all()
    )


@router.get(
    "/quizzes/{quiz_id}",
    response_model=QuizResponse,
)
def get_quiz_by_id(
    quiz_id: UUID,
    db: Session = Depends(get_db),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    return quiz


@router.get(
    "/quizzes/{quiz_id}/questions",
    response_model=list[QuestionResponse],
)
def get_quiz_questions(
    quiz_id: UUID,
    db: Session = Depends(get_db),
):
    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    return (
        db.query(Question)
        .filter(Question.quiz_id == quiz_id)
        .all()
    )


# ============================================================
# QUIZ ATTEMPT ENDPOINTS
# ============================================================

@router.post(
    "/quizzes/{quiz_id}/attempts",
    response_model=QuizAttemptResponse,
    status_code=status.HTTP_201_CREATED,
)
def start_quiz_attempt(
    quiz_id: UUID,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    total_questions = (
        db.query(Question)
        .filter(Question.quiz_id == quiz_id)
        .count()
    )

    attempt = QuizAttempt(
        student_id=student.id,
        quiz_id=quiz.id,
        score=0,
        total_questions=total_questions,
        accuracy=0.0,
        time_taken_seconds=0,
        created_at=datetime.now(timezone.utc),
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt


@router.post(
    "/quiz-attempts/{attempt_id}/answers",
    response_model=QuestionAttemptResponse,
    status_code=status.HTTP_200_OK,
)
def submit_question_answer(
    attempt_id: UUID,
    answer_data: QuestionAnswerSubmit,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    attempt = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.id == attempt_id)
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found",
        )

    if attempt.student_id != student.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this quiz attempt",
        )

    question = (
        db.query(Question)
        .filter(
            Question.id == answer_data.question_id,
            Question.quiz_id == attempt.quiz_id,
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found for this quiz",
        )

    is_correct = (
        answer_data.student_answer.strip().lower()
        == question.correct_answer.strip().lower()
    )

    existing_qa = (
        db.query(QuestionAttempt)
        .filter(
            QuestionAttempt.attempt_id == attempt.id,
            QuestionAttempt.question_id == question.id,
        )
        .first()
    )

    if existing_qa:
        existing_qa.student_answer = answer_data.student_answer
        existing_qa.is_correct = is_correct
        existing_qa.time_taken_seconds = answer_data.time_taken_seconds
        qa = existing_qa
    else:
        qa = QuestionAttempt(
            attempt_id=attempt.id,
            question_id=question.id,
            student_answer=answer_data.student_answer,
            is_correct=is_correct,
            time_taken_seconds=answer_data.time_taken_seconds,
        )
        db.add(qa)

    db.commit()
    db.refresh(qa)

    return qa


@router.put(
    "/quiz-attempts/{attempt_id}/complete",
    response_model=QuizAttemptResponse,
)
def complete_quiz_attempt(
    attempt_id: UUID,
    request: QuizAttemptCompleteRequest | None = None,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    attempt = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.id == attempt_id)
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found",
        )

    if attempt.student_id != student.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this quiz attempt",
        )

    question_attempts = (
        db.query(QuestionAttempt)
        .filter(QuestionAttempt.attempt_id == attempt.id)
        .all()
    )

    score = sum(1 for qa in question_attempts if qa.is_correct)
    total_q = attempt.total_questions or len(question_attempts) or 1
    accuracy = round((score / total_q) * 100.0, 2)

    total_time = sum(qa.time_taken_seconds for qa in question_attempts)
    if request and request.time_taken_seconds is not None:
        total_time = request.time_taken_seconds

    attempt.score = score
    attempt.accuracy = accuracy
    attempt.time_taken_seconds = total_time

    db.commit()
    db.refresh(attempt)

    return attempt


@router.get(
    "/quiz-attempts/me",
    response_model=list[QuizAttemptResponse],
)
def get_my_quiz_attempts(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .order_by(QuizAttempt.created_at.desc())
        .all()
    )

    return attempts

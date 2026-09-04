from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.question import Question
from app.db.models.question_attempt import QuestionAttempt
from app.db.models.quiz import Quiz
from app.db.models.quiz_attempt import QuizAttempt
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.quiz import (
    QuestionAnswerSubmit,
    QuestionAttemptResponse,
    QuestionResponse,
    QuizAttemptCompleteRequest,
    QuizAttemptResponse,
    QuizResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    TopicResultItem,
)
from app.services.mastery_service import recalculate_mastery_for_quiz
from app.services.recommendation_service import generate_recommendations_for_student

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
        created_at=datetime.now(UTC),
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

    user_ans = answer_data.get_answer()
    is_correct = (
        user_ans.strip().lower()
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
        existing_qa.student_answer = user_ans
        existing_qa.is_correct = is_correct
        existing_qa.time_taken_seconds = answer_data.time_taken_seconds
        qa = existing_qa
    else:
        qa = QuestionAttempt(
            attempt_id=attempt.id,
            question_id=question.id,
            student_answer=user_ans,
            is_correct=is_correct,
            time_taken_seconds=answer_data.time_taken_seconds,
        )
        db.add(qa)

    db.commit()
    db.refresh(qa)

    return qa


# ============================================================
# BULK SUBMISSION ENDPOINT (POST /quizzes/{quiz_id}/submit)
# ============================================================
@router.post(
    "/quizzes/{quiz_id}/submit",
    response_model=QuizSubmitResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk submit answers for an entire quiz matching API Contract",
)
def bulk_submit_quiz(
    quiz_id: UUID,
    submit_req: QuizSubmitRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    """Submit answers for an entire quiz in one request.

    This endpoint validates the quiz, finds or creates an attempt for the
    authenticated student, records/updates each answer, calculates the
    score/accuracy, triggers mastery recalculation, generates new recommendations,
    and returns the contract-compliant evaluation summary.
    """
    student = get_authenticated_student(current_user, db)

    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    all_questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()
    total_q_count = len(all_questions) or 1

    # Find the most recent active attempt for this student and quiz, or create a new one
    attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.student_id == student.id,
            QuizAttempt.quiz_id == quiz.id,
            QuizAttempt.time_taken_seconds == 0,
            QuizAttempt.score == 0,
        )
        .order_by(QuizAttempt.created_at.desc())
        .first()
    )

    if not attempt:
        attempt = QuizAttempt(
            student_id=student.id,
            quiz_id=quiz.id,
            score=0,
            total_questions=total_q_count,
            accuracy=0.0,
            time_taken_seconds=0,
            created_at=datetime.now(UTC),
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    # Process each answer
    for answer_item in submit_req.answers:
        question = (
            db.query(Question)
            .filter(Question.id == answer_item.question_id, Question.quiz_id == quiz.id)
            .first()
        )
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found for this quiz",
            )

        user_ans = answer_item.get_answer()
        is_correct = (
            user_ans.strip().lower()
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
            existing_qa.student_answer = user_ans
            existing_qa.is_correct = is_correct
            existing_qa.time_taken_seconds = answer_item.time_taken_seconds
        else:
            qa = QuestionAttempt(
                attempt_id=attempt.id,
                question_id=question.id,
                student_answer=user_ans,
                is_correct=is_correct,
                time_taken_seconds=answer_item.time_taken_seconds,
            )
            db.add(qa)

    db.commit()

    # Calculate score, accuracy, and topic breakdown
    question_attempts = (
        db.query(QuestionAttempt)
        .filter(QuestionAttempt.attempt_id == attempt.id)
        .all()
    )
    score = sum(1 for qa in question_attempts if qa.is_correct)
    total_q = attempt.total_questions or len(question_attempts) or total_q_count
    accuracy_ratio = round(score / total_q, 2)
    accuracy_pct = round(accuracy_ratio * 100.0, 2)

    total_time = (
        submit_req.time_taken_seconds
        if submit_req.time_taken_seconds is not None
        else sum(qa.time_taken_seconds for qa in question_attempts)
    )

    attempt.score = score
    attempt.accuracy = accuracy_pct
    attempt.time_taken_seconds = total_time

    db.commit()
    db.refresh(attempt)

    # Calculate topic breakdown
    topic_correct_map: dict[UUID, int] = {}
    topic_total_map: dict[UUID, int] = {}
    for qa in question_attempts:
        q = db.query(Question).filter(Question.id == qa.question_id).first()
        if q:
            topic_total_map[q.topic_id] = topic_total_map.get(q.topic_id, 0) + 1
            if qa.is_correct:
                topic_correct_map[q.topic_id] = topic_correct_map.get(q.topic_id, 0) + 1

    topic_results = [
        TopicResultItem(
            topic_id=t_id,
            accuracy=round(topic_correct_map.get(t_id, 0) / topic_total_map[t_id], 2),
        )
        for t_id in topic_total_map
    ]

    # Recalculate mastery and generate recommendations
    recalculate_mastery_for_quiz(student.id, quiz.id, db)
    new_recs = generate_recommendations_for_student(student.id, db)
    db.commit()

    rec_id = new_recs[0].id if new_recs else None

    # Feedback message
    feedback = (
        "Excellent work! High mastery achieved."
        if accuracy_ratio >= 0.8
        else (
            "Good progress. Keep practicing key concepts."
            if accuracy_ratio >= 0.5
            else "Additional practice recommended for difficult topics."
        )
    )

    return QuizSubmitResponse(
        score=score,
        total=total_q,
        accuracy=accuracy_ratio,
        time_taken_seconds=total_time,
        topic_results=topic_results,
        feedback=feedback,
        recommendation_id=rec_id,
        attempt_id=attempt.id,
    )


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

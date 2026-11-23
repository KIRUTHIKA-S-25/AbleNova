"""Quiz Engine & Assessment API Endpoints.
Adheres strictly to docs/API_CONTRACT.md Sections 7, 8, 9, and 20.
"""
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_student, require_teacher, verify_student_access
from app.core.exceptions import AppException
from app.db.database import get_db
from app.db.models.quiz import QuizAttempt
from app.db.models.user import User
from app.schemas.common import UserRole
from app.schemas.quiz import (
    QuestionAdminRead,
    QuestionCreate,
    QuestionUpdate,
    QuizAdminRead,
    QuizAttemptRead,
    QuizCreate,
    QuizItemResponse,
    QuizRead,
    QuizResultResponse,
    QuizSubmission,
    QuizUpdate,
)
from app.services.quiz_service import quiz_service

logger = logging.getLogger("ablenova.api.quizzes")

router = APIRouter(tags=["Quizzes"])


# ==============================================================================
# 1. GET /quizzes/{quiz_id} (API_CONTRACT.md Section 7)
# ==============================================================================

@router.get(
    "/quizzes/{quiz_id}",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Retrieve quiz for taking or administration (API_CONTRACT.md Sec 7)",
)
async def get_quiz(
    quiz_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve quiz. Students receive client-sanitized questions without answer keys.
    Teachers and Admins receive complete management metadata.
    """
    quiz_data = quiz_service.get_quiz_by_id(db=db, quiz_id=quiz_id, current_user=current_user)
    return quiz_data


# ==============================================================================
# 2. POST /quizzes/{quiz_id}/submit (API_CONTRACT.md Section 8 & 9)
# ==============================================================================

@router.post(
    "/quizzes/{quiz_id}/submit",
    response_model=QuizResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit student quiz attempt for official grading (API_CONTRACT.md Sec 8 & 9)",
)
async def submit_quiz(
    quiz_id: UUID,
    payload: QuizSubmission,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Perform official backend quiz grading, score calculation, idempotent persistence,
    and student topic mastery synchronization.
    """
    if not current_user.student:
        raise AppException(
            code="FORBIDDEN",
            message="User does not have an active student profile",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    result = quiz_service.submit_quiz(
        db=db,
        quiz_id=quiz_id,
        student=current_user.student,
        payload=payload,
    )
    return result


# ==============================================================================
# 3. Quiz Management (Teacher / Admin)
# ==============================================================================

@router.post(
    "/quizzes",
    response_model=QuizAdminRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new quiz assessment (Teacher/Admin)",
)
async def create_quiz(
    payload: QuizCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Create a new quiz with optional questions."""
    quiz = quiz_service.create_quiz(db=db, payload=payload, current_user=current_user)
    quiz_admin_data = quiz_service.get_quiz_by_id(db=db, quiz_id=quiz.id, current_user=current_user)
    return quiz_admin_data


@router.put(
    "/quizzes/{quiz_id}",
    response_model=QuizAdminRead,
    status_code=status.HTTP_200_OK,
    summary="Update quiz settings (Teacher/Admin)",
)
async def update_quiz(
    quiz_id: UUID,
    payload: QuizUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Update quiz title, description, passing threshold, or max attempts."""
    quiz_service.update_quiz(db=db, quiz_id=quiz_id, payload=payload, current_user=current_user)
    quiz_admin_data = quiz_service.get_quiz_by_id(db=db, quiz_id=quiz_id, current_user=current_user)
    return quiz_admin_data


@router.post(
    "/quizzes/{quiz_id}/publish",
    response_model=QuizAdminRead,
    status_code=status.HTTP_200_OK,
    summary="Publish quiz for student access (Teacher/Admin)",
)
async def publish_quiz(
    quiz_id: UUID,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Publish quiz, validating that it contains at least one question."""
    quiz_service.publish_quiz(db=db, quiz_id=quiz_id)
    quiz_admin_data = quiz_service.get_quiz_by_id(db=db, quiz_id=quiz_id, current_user=current_user)
    return quiz_admin_data


@router.post(
    "/quizzes/{quiz_id}/unpublish",
    response_model=QuizAdminRead,
    status_code=status.HTTP_200_OK,
    summary="Unpublish quiz (Teacher/Admin)",
)
async def unpublish_quiz(
    quiz_id: UUID,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Unpublish quiz, making it unavailable to students."""
    quiz_service.unpublish_quiz(db=db, quiz_id=quiz_id)
    quiz_admin_data = quiz_service.get_quiz_by_id(db=db, quiz_id=quiz_id, current_user=current_user)
    return quiz_admin_data


@router.delete(
    "/quizzes/{quiz_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete quiz assessment (Teacher/Admin)",
)
async def delete_quiz(
    quiz_id: UUID,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Delete quiz assessment and cascading items."""
    quiz_service.delete_quiz(db=db, quiz_id=quiz_id)
    return None


@router.get(
    "/quizzes",
    response_model=List[QuizItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List quizzes filtered by lesson or topic",
)
async def list_quizzes(
    lesson_id: Optional[UUID] = Query(None, description="Filter by lesson UUID"),
    topic_id: Optional[UUID] = Query(None, description="Filter by topic UUID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve quizzes matching filters. Students only see published quizzes."""
    is_student = (current_user.role == UserRole.STUDENT.value)
    return quiz_service.list_quizzes(
        db=db,
        lesson_id=lesson_id,
        topic_id=topic_id,
        is_student=is_student,
    )


# ==============================================================================
# 4. Question Management (Teacher / Admin)
# ==============================================================================

@router.post(
    "/quizzes/{quiz_id}/questions",
    response_model=QuestionAdminRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a question to a quiz (Teacher/Admin)",
)
async def create_question(
    quiz_id: UUID,
    payload: QuestionCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Add a question item to a quiz."""
    q = quiz_service.create_question(db=db, quiz_id=quiz_id, payload=payload)
    return q


@router.put(
    "/quizzes/{quiz_id}/questions/{question_id}",
    response_model=QuestionAdminRead,
    status_code=status.HTTP_200_OK,
    summary="Update question item (Teacher/Admin)",
)
async def update_question(
    quiz_id: UUID,
    question_id: UUID,
    payload: QuestionUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Update question text, options, answer key, or explanation."""
    q = quiz_service.update_question(db=db, question_id=question_id, payload=payload)
    return q


@router.delete(
    "/quizzes/{quiz_id}/questions/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete question item (Teacher/Admin)",
)
async def delete_question(
    quiz_id: UUID,
    question_id: UUID,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Delete individual question item."""
    quiz_service.delete_question(db=db, question_id=question_id)
    return None


# ==============================================================================
# 5. Assessment History & Feedback Reviews
# ==============================================================================

@router.get(
    "/quizzes/{quiz_id}/attempts",
    response_model=List[QuizAttemptRead],
    status_code=status.HTTP_200_OK,
    summary="List student attempt history for a quiz",
)
async def get_quiz_attempts(
    quiz_id: UUID,
    student_id: Optional[UUID] = Query(None, description="Target student UUID (for teachers/caregivers)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List historical attempts. Students access their own; teachers/caregivers access linked students."""
    target_student_id = None
    if student_id:
        student = verify_student_access(student_id=student_id, current_user=current_user, db=db)
        target_student_id = student.id
    elif current_user.role == UserRole.STUDENT.value and current_user.student:
        target_student_id = current_user.student.id
    else:
        raise AppException(
            code="VALIDATION_ERROR",
            message="student_id is required for non-student users",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    return quiz_service.get_student_attempts(db=db, quiz_id=quiz_id, student_id=target_student_id)


@router.get(
    "/quizzes/attempts/{attempt_id}",
    response_model=QuizResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve detailed quiz attempt review with unlocked feedback",
)
async def get_attempt_details(
    attempt_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full attempt breakdown including question explanations."""
    attempt_data = quiz_service.get_attempt_by_id(db=db, attempt_id=attempt_id)
    # Check authorization on the attempt's student
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if attempt:
        verify_student_access(student_id=attempt.student_id, current_user=current_user, db=db)

    return attempt_data

"""AI Learning Engine & RAG Retrieval API Endpoints.
Adheres strictly to docs/API_CONTRACT.md Sections 13 and 20.
"""
import logging
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_student_access
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.ai import (
    AIAskRequest,
    AIAskResponse,
    AIExplanationRequest,
    AIExplanationResponse,
    AIHintsRequest,
    AIHintsResponse,
    AISimplifyRequest,
    AISimplifyResponse,
    AISourcesResponse,
    AISummarizeRequest,
    AISummarizeResponse,
    AITranslateRequest,
    AITranslateResponse,
    AIVisualDescriptionRequest,
    AIVisualDescriptionResponse,
)
from app.schemas.common import UserRole
from app.services.ai_service import ai_service

logger = logging.getLogger("ablenova.api.ai")

router = APIRouter(prefix="/ai", tags=["AI Services"])


def _resolve_effective_student_id(
    requested_student_id: Optional[UUID],
    current_user: User,
    db: Session,
) -> Optional[UUID]:
    """Resolve and verify student access, preventing IDOR and respecting user roles."""
    if requested_student_id:
        student = verify_student_access(
            student_id=requested_student_id,
            current_user=current_user,
            db=db,
        )
        return student.id
    elif current_user.role == UserRole.STUDENT.value and current_user.student:
        return current_user.student.id
    return None


# ==============================================================================
# 1. POST /api/v1/ai/explanation (API_CONTRACT.md Section 13)
# ==============================================================================

@router.post(
    "/explanation",
    response_model=AIExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate curriculum-grounded, accessible AI explanation",
)
async def generate_explanation(
    payload: AIExplanationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate safe, curriculum-aligned, personalized educational explanation."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.generate_explanation(
        question=payload.question,
        lesson_id=payload.lesson_id,
        mode=payload.mode,
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 2. POST /api/v1/ai/ask
# ==============================================================================

@router.post(
    "/ask",
    response_model=AIAskResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask an educational question across subjects or topics",
)
async def ask_question(
    payload: AIAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Broad curriculum Q&A with semantic vector retrieval."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.ask_question(
        question=payload.question,
        subject_id=payload.subject_id,
        topic_id=payload.topic_id,
        lesson_id=payload.lesson_id,
        mode=payload.mode,
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 3. POST /api/v1/ai/simplify
# ==============================================================================

@router.post(
    "/simplify",
    response_model=AISimplifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Simplify curriculum text for cognitive accessibility",
)
async def simplify_content(
    payload: AISimplifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rewrite text using short sentences, plain vocabulary, and bullet summaries."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.simplify_content(
        text=payload.text,
        target_grade=payload.target_grade,
        style=payload.style or "plain_language",
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 4. POST /api/v1/ai/translate
# ==============================================================================

@router.post(
    "/translate",
    response_model=AITranslateResponse,
    status_code=status.HTTP_200_OK,
    summary="Translate educational content to a student's preferred language",
)
async def translate_content(
    payload: AITranslateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Translate learning material while preserving encouraging educational phrasing."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.translate_content(
        text=payload.text,
        target_language=payload.target_language,
        source_language=payload.source_language or "auto",
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 5. POST /api/v1/ai/summarize
# ==============================================================================

@router.post(
    "/summarize",
    response_model=AISummarizeResponse,
    status_code=status.HTTP_200_OK,
    summary="Summarize learning material into key bullet takeaways",
)
async def summarize_content(
    payload: AISummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate concise, bite-sized summaries for easier review."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.summarize_content(
        text=payload.text,
        bullet_count=payload.bullet_count or 3,
        max_words=payload.max_words or 150,
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 6. POST /api/v1/ai/hints
# ==============================================================================

@router.post(
    "/hints",
    response_model=AIHintsResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate progressive scaffolding hints without giving away answers",
)
async def generate_hints(
    payload: AIHintsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Provide stage-appropriate clues that empower student self-discovery."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.generate_hints(
        question=payload.question,
        lesson_id=payload.lesson_id,
        hint_level=payload.hint_level,
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 7. POST /api/v1/ai/visual-description
# ==============================================================================

@router.post(
    "/visual-description",
    response_model=AIVisualDescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate screen-reader and tactile accessible visual descriptions",
)
async def generate_visual_description(
    payload: AIVisualDescriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Convert diagrams and visual materials into structured verbal descriptions."""
    student_id = _resolve_effective_student_id(payload.student_id, current_user, db)

    result = await ai_service.generate_visual_description(
        diagram_type=payload.diagram_type or "diagram",
        context_text=payload.context_text,
        image_url=payload.image_url,
        student_id=student_id,
        db=db,
    )
    return result


# ==============================================================================
# 8. GET /api/v1/ai/sources/{request_id}
# ==============================================================================

@router.get(
    "/sources/{request_id}",
    response_model=AISourcesResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve chunk-level citations and source attribution for an AI response",
)
async def get_ai_sources(
    request_id: str,
    current_user: User = Depends(get_current_user),
):
    """Retrieve full source chunk details and similarity scores for an AI answer."""
    attribution = ai_service.get_source_attribution(request_id)
    return attribution

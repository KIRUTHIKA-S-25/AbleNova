import logging
from typing import List, Optional, Union
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_optional_current_user, require_teacher
from app.core.exceptions import AppException
from app.db.models import User
from app.schemas.curriculum import (
    LearningObjectiveCreate,
    LearningObjectiveRead,
    LessonBase,
    LessonCreate,
    LessonDetailResponse,
    LessonItemResponse,
    LessonResourceCreate,
    LessonResourceRead,
    LessonSearchResponse,
    LessonUpdate,
)
from app.services.curriculum_service import CurriculumService

logger = logging.getLogger("ablenova.api.lessons")

router = APIRouter(tags=["Lessons"])


def _parse_uuid(val: Union[str, UUID], entity: str = "Resource") -> UUID:
    if isinstance(val, UUID):
        return val
    try:
        return UUID(str(val))
    except (ValueError, TypeError):
        raise AppException(
            code="NOT_FOUND",
            message=f"{entity} not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )


# ==============================================================================
# Lesson Search & Listing
# ==============================================================================

@router.get(
    "/lessons",
    response_model=LessonSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search lessons with multi-attribute filtering and pagination",
)
async def search_lessons(
    subject_id: Optional[str] = Query(None, description="Filter by subject UUID"),
    topic_id: Optional[str] = Query(None, description="Filter by topic UUID"),
    grade: Optional[int] = Query(None, ge=1, le=12, description="Filter by grade level"),
    language: Optional[str] = Query(None, description="Filter by language code (e.g. en)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (beginner, intermediate, advanced)"),
    has_audio: Optional[bool] = Query(None, description="Filter by presence of audio narration"),
    has_simplified: Optional[bool] = Query(None, description="Filter by presence of simplified content"),
    q: Optional[str] = Query(None, description="Search term for title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> LessonSearchResponse:
    """Searches lessons matching filters. Students and unauthenticated users only receive published lessons."""
    s_uuid = _parse_uuid(subject_id, "Subject") if subject_id else None
    t_uuid = _parse_uuid(topic_id, "Topic") if topic_id else None

    return CurriculumService.search_lessons(
        db=db,
        subject_id=s_uuid,
        topic_id=t_uuid,
        grade=grade,
        language=language,
        difficulty=difficulty,
        has_audio=has_audio,
        has_simplified=has_simplified,
        q=q,
        page=page,
        size=size,
        current_user=current_user,
    )


@router.get(
    "/topics/{topic_id}/lessons",
    response_model=List[LessonItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List lessons belonging to a topic",
)
async def list_topic_lessons(
    topic_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> List[LessonItemResponse]:
    """Retrieves all lessons belonging to a topic. Students only see published lessons."""
    t_uuid = _parse_uuid(topic_id, "Topic")
    return CurriculumService.list_lessons_by_topic(db, t_uuid, current_user)


# ==============================================================================
# Lesson Detail & Management
# ==============================================================================

@router.get(
    "/lessons/{lesson_id}",
    response_model=LessonDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get lesson details and content tiers",
)
async def get_lesson(
    lesson_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> LessonDetailResponse:
    """Retrieves lesson details adhering to API_CONTRACT.md Section 6.

    Authorization Guard:
    Students and unauthenticated users receive 403 Forbidden for unpublished lessons.
    """
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    lesson = CurriculumService.get_lesson_by_id(db, l_uuid, current_user)
    return CurriculumService.build_lesson_detail_response(lesson)


@router.post(
    "/lessons",
    response_model=LessonDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lesson (Teacher / Admin)",
)
async def create_lesson(
    payload: LessonCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LessonDetailResponse:
    """Creates a new educational lesson. The creating teacher owns the lesson."""
    lesson = CurriculumService.create_lesson(db, payload, current_user)
    return CurriculumService.build_lesson_detail_response(lesson)


@router.post(
    "/topics/{topic_id}/lessons",
    response_model=LessonDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lesson scoped to a topic (Teacher / Admin)",
)
async def create_topic_lesson(
    topic_id: str,
    payload: LessonBase,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LessonDetailResponse:
    """Creates a new lesson directly under a topic path parameter."""
    t_uuid = _parse_uuid(topic_id, "Topic")
    create_payload = LessonCreate(
        topic_id=t_uuid,
        title=payload.title,
        description=payload.description,
        difficulty=payload.difficulty,
        language=payload.language,
        estimated_minutes=payload.estimated_minutes,
        grade_level=payload.grade_level,
        standard_content=payload.standard_content,
        simplified_content=payload.simplified_content,
        audio_url=payload.audio_url,
        caption_text=payload.caption_text,
        is_published=payload.is_published,
        accessibility_metadata=payload.accessibility_metadata,
    )
    lesson = CurriculumService.create_lesson(db, create_payload, current_user)
    return CurriculumService.build_lesson_detail_response(lesson)


@router.put(
    "/lessons/{lesson_id}",
    response_model=LessonDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an educational lesson (Teacher Owner / Admin)",
)
async def update_lesson(
    lesson_id: str,
    payload: LessonUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LessonDetailResponse:
    """Updates lesson details and content. Enforces teacher ownership."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    lesson = CurriculumService.update_lesson(db, l_uuid, payload, current_user)
    return CurriculumService.build_lesson_detail_response(lesson)


@router.post(
    "/lessons/{lesson_id}/publish",
    response_model=LessonDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Publish a lesson to make it visible to students (Teacher Owner / Admin)",
)
async def publish_lesson(
    lesson_id: str,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LessonDetailResponse:
    """Publishes a lesson. Restricted to creating teacher and administrators."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    lesson = CurriculumService.set_publish_status(db, l_uuid, True, current_user)
    return CurriculumService.build_lesson_detail_response(lesson)


@router.post(
    "/lessons/{lesson_id}/unpublish",
    response_model=LessonDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Unpublish a lesson to hide it from students (Teacher Owner / Admin)",
)
async def unpublish_lesson(
    lesson_id: str,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LessonDetailResponse:
    """Unpublishes a lesson. Restricted to creating teacher and administrators."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    lesson = CurriculumService.set_publish_status(db, l_uuid, False, current_user)
    return CurriculumService.build_lesson_detail_response(lesson)


# ==============================================================================
# Learning Objectives Endpoints
# ==============================================================================

@router.get(
    "/lessons/{lesson_id}/objectives",
    response_model=List[LearningObjectiveRead],
    status_code=status.HTTP_200_OK,
    summary="List learning objectives for a lesson",
)
async def list_lesson_objectives(
    lesson_id: str,
    db: Session = Depends(get_db),
) -> List[LearningObjectiveRead]:
    """Retrieves all learning objectives for a lesson."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    # Verify lesson exists
    CurriculumService.get_lesson_by_id(db, l_uuid)
    objs = CurriculumService.list_objectives(db, l_uuid)
    return [
        LearningObjectiveRead(
            id=o.id,
            lesson_id=o.lesson_id,
            description=o.description,
            order_index=o.order_index,
            created_at=o.created_at,
        )
        for o in objs
    ]


@router.post(
    "/lessons/{lesson_id}/objectives",
    response_model=LearningObjectiveRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a learning objective to a lesson (Teacher Owner / Admin)",
)
async def add_lesson_objective(
    lesson_id: str,
    payload: LearningObjectiveCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LearningObjectiveRead:
    """Adds a measurable learning objective to a lesson. Enforces teacher ownership."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    obj = CurriculumService.add_objective(db, l_uuid, payload, current_user)
    return LearningObjectiveRead(
        id=obj.id,
        lesson_id=obj.lesson_id,
        description=obj.description,
        order_index=obj.order_index,
        created_at=obj.created_at,
    )


@router.delete(
    "/lessons/{lesson_id}/objectives/{objective_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a learning objective (Teacher Owner / Admin)",
)
async def delete_lesson_objective(
    lesson_id: str,
    objective_id: str,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Deletes a learning objective from a lesson. Enforces teacher ownership."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    o_uuid = _parse_uuid(objective_id, "Learning objective")
    CurriculumService.delete_objective(db, l_uuid, o_uuid, current_user)
    return {"status": "success", "message": "Objective deleted"}


# ==============================================================================
# Lesson Resources Endpoints (Metadata Only)
# ==============================================================================

@router.get(
    "/lessons/{lesson_id}/resources",
    response_model=List[LessonResourceRead],
    status_code=status.HTTP_200_OK,
    summary="List resource metadata for a lesson",
)
async def list_lesson_resources(
    lesson_id: str,
    db: Session = Depends(get_db),
) -> List[LessonResourceRead]:
    """Retrieves all attached resource metadata for a lesson."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    # Verify lesson exists
    CurriculumService.get_lesson_by_id(db, l_uuid)
    resources = CurriculumService.list_resources(db, l_uuid)
    return [
        LessonResourceRead(
            id=r.id,
            lesson_id=r.lesson_id,
            title=r.title,
            resource_type=r.resource_type,
            url=r.url,
            file_size_bytes=r.file_size_bytes,
            format=r.format,
            accessibility_description=r.accessibility_description,
            created_at=r.created_at,
        )
        for r in resources
    ]


@router.post(
    "/lessons/{lesson_id}/resources",
    response_model=LessonResourceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add educational resource metadata to a lesson (Teacher Owner / Admin)",
)
async def add_lesson_resource(
    lesson_id: str,
    payload: LessonResourceCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> LessonResourceRead:
    """Attaches external educational resource metadata to a lesson.

    Architectural Boundary:
    No binary files are stored in PostgreSQL; only URL and accessibility metadata.
    """
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    resource = CurriculumService.add_resource(db, l_uuid, payload, current_user)
    return LessonResourceRead(
        id=resource.id,
        lesson_id=resource.lesson_id,
        title=resource.title,
        resource_type=resource.resource_type,
        url=resource.url,
        file_size_bytes=resource.file_size_bytes,
        format=resource.format,
        accessibility_description=resource.accessibility_description,
        created_at=resource.created_at,
    )


@router.delete(
    "/lessons/{lesson_id}/resources/{resource_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a lesson resource (Teacher Owner / Admin)",
)
async def delete_lesson_resource(
    lesson_id: str,
    resource_id: str,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Deletes attached educational resource metadata from a lesson. Enforces teacher ownership."""
    l_uuid = _parse_uuid(lesson_id, "Lesson")
    r_uuid = _parse_uuid(resource_id, "Lesson resource")
    CurriculumService.delete_resource(db, l_uuid, r_uuid, current_user)
    return {"status": "success", "message": "Resource deleted"}

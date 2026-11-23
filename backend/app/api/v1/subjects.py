import logging
from typing import Optional, Union
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_optional_current_user, require_teacher
from app.core.exceptions import AppException
from app.db.models import Subject, Topic, User
from app.schemas.curriculum import (
    SubjectBase,
    SubjectCreate,
    SubjectDetailResponse,
    SubjectListResponse,
    SubjectRead,
    SubjectUpdate,
    TopicBase,
    TopicCreate,
    TopicDetailResponse,
    TopicListResponse,
    TopicRead,
    TopicUpdate,
)
from app.services.curriculum_service import CurriculumService

logger = logging.getLogger("ablenova.api.curriculum")

router = APIRouter(tags=["Subjects & Topics"])


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
# Subject Endpoints
# ==============================================================================

@router.get(
    "/subjects",
    response_model=SubjectListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all subjects with filtering",
)
async def list_subjects(
    q: Optional[str] = None,
    grade: Optional[int] = None,
    language: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> SubjectListResponse:
    """Lists educational subjects adhering to API_CONTRACT.md Section 4 with search and filters."""
    items = CurriculumService.list_subjects(
        db=db,
        q=q,
        grade=grade,
        language=language,
        is_active=is_active,
        current_user=current_user,
    )
    return SubjectListResponse(subjects=items)


@router.post(
    "/subjects",
    response_model=SubjectRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new educational subject (Teacher / Admin)",
)
async def create_subject(
    payload: SubjectCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> SubjectRead:
    """Creates a new subject. Restricted to teachers and administrators."""
    subject = CurriculumService.create_subject(db, payload, current_user)
    return SubjectRead(
        id=subject.id,
        name=subject.name,
        description=subject.description,
        created_at=subject.created_at,
    )


@router.get(
    "/subjects/{subject_id}",
    response_model=SubjectDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get subject detail with child topics",
)
async def get_subject_detail(
    subject_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> SubjectDetailResponse:
    """Retrieves detailed information for a subject including all child topics."""
    s_uuid = _parse_uuid(subject_id, "Subject")
    subject = CurriculumService.get_subject_by_id(db, s_uuid)
    return CurriculumService.build_subject_detail_response(db, subject, current_user)


@router.put(
    "/subjects/{subject_id}",
    response_model=SubjectRead,
    status_code=status.HTTP_200_OK,
    summary="Update an educational subject (Teacher / Admin)",
)
async def update_subject(
    subject_id: str,
    payload: SubjectUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> SubjectRead:
    """Updates subject name or description."""
    s_uuid = _parse_uuid(subject_id, "Subject")
    subject = CurriculumService.update_subject(db, s_uuid, payload, current_user)
    return SubjectRead(
        id=subject.id,
        name=subject.name,
        description=subject.description,
        created_at=subject.created_at,
    )


# ==============================================================================
# Topic Endpoints
# ==============================================================================

@router.get(
    "/subjects/{subject_id}/topics",
    response_model=TopicListResponse,
    status_code=status.HTTP_200_OK,
    summary="List topics by subject",
)
async def get_subject_topics(
    subject_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> TopicListResponse:
    """Retrieves all topics belonging to a subject adhering to API_CONTRACT.md Section 5."""
    s_uuid = _parse_uuid(subject_id, "Subject")
    topics = CurriculumService.list_topics_by_subject(db, s_uuid, current_user)
    return TopicListResponse(topics=topics)


@router.post(
    "/subjects/{subject_id}/topics",
    response_model=TopicRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new topic under a subject (Teacher / Admin)",
)
async def create_subject_topic(
    subject_id: str,
    payload: TopicBase,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> TopicRead:
    """Creates a topic scoped to a specific subject path parameter."""
    s_uuid = _parse_uuid(subject_id, "Subject")
    create_payload = TopicCreate(
        subject_id=s_uuid,
        name=payload.name,
        description=payload.description,
        difficulty=payload.difficulty,
        order_index=payload.order_index,
    )
    topic = CurriculumService.create_topic(db, create_payload, current_user)
    return TopicRead(
        id=topic.id,
        subject_id=topic.subject_id,
        name=topic.name,
        description=topic.description,
        difficulty=topic.difficulty,
        order_index=topic.order_index,
        created_at=topic.created_at,
    )


@router.post(
    "/topics",
    response_model=TopicRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new topic (Teacher / Admin)",
)
async def create_topic(
    payload: TopicCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> TopicRead:
    """Creates a topic with subject_id supplied in body payload."""
    topic = CurriculumService.create_topic(db, payload, current_user)
    return TopicRead(
        id=topic.id,
        subject_id=topic.subject_id,
        name=topic.name,
        description=topic.description,
        difficulty=topic.difficulty,
        order_index=topic.order_index,
        created_at=topic.created_at,
    )


@router.get(
    "/topics/{topic_id}",
    response_model=TopicDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get topic details with child lessons",
)
async def get_topic_detail(
    topic_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> TopicDetailResponse:
    """Retrieves topic detail including its lessons (non-teachers only see published lessons)."""
    t_uuid = _parse_uuid(topic_id, "Topic")
    topic = CurriculumService.get_topic_by_id(db, t_uuid)
    return CurriculumService.build_topic_detail_response(db, topic, current_user)


@router.put(
    "/topics/{topic_id}",
    response_model=TopicRead,
    status_code=status.HTTP_200_OK,
    summary="Update a topic (Teacher / Admin)",
)
async def update_topic(
    topic_id: str,
    payload: TopicUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> TopicRead:
    """Updates topic details."""
    t_uuid = _parse_uuid(topic_id, "Topic")
    topic = CurriculumService.update_topic(db, t_uuid, payload, current_user)
    return TopicRead(
        id=topic.id,
        subject_id=topic.subject_id,
        name=topic.name,
        description=topic.description,
        difficulty=topic.difficulty,
        order_index=topic.order_index,
        created_at=topic.created_at,
    )

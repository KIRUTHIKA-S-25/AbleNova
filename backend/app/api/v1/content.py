"""Content Ingestion and Document Processing Endpoints.
Adheres strictly to docs/API_CONTRACT.md Sections 14 and 20.
"""
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_teacher
from app.core.exceptions import AppException
from app.db.database import get_db
from app.db.models.curriculum import Subject, Topic
from app.db.models.user import User
from app.schemas.ai import ContentUploadResponse
from app.services.content_service import content_service

logger = logging.getLogger("ablenova.api.content")

router = APIRouter(prefix="/content", tags=["Content Ingestion"])

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post(
    "/upload",
    response_model=ContentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest educational content into RAG vector index (API_CONTRACT.md Sec 14)",
)
async def upload_content(
    file: UploadFile = File(..., description="Document file (.txt, .md, text)"),
    subject_id: UUID = Form(..., description="Subject UUID"),
    topic_id: UUID = Form(..., description="Topic UUID"),
    grade: int = Form(..., ge=1, le=12, description="Target grade level"),
    language: str = Form("en", description="Document language code"),
    difficulty: str = Form("beginner", description="beginner, intermediate, advanced"),
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Teacher/Admin endpoint to upload curriculum content, extract text,
    perform sliding-window chunking, and index vectors in ChromaDB.
    """
    # Verify Subject & Topic exist
    subject = db.execute(select(Subject).where(Subject.id == subject_id)).scalar_one_or_none()
    if not subject:
        raise AppException(
            code="NOT_FOUND",
            message=f"Subject with id '{subject_id}' does not exist",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    topic = db.execute(select(Topic).where(Topic.id == topic_id)).scalar_one_or_none()
    if not topic:
        raise AppException(
            code="NOT_FOUND",
            message=f"Topic with id '{topic_id}' does not exist",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # Read file content safely
    try:
        file_bytes = await file.read()
    except Exception as e:
        logger.error("Error reading uploaded file: %s", str(e))
        raise AppException(
            code="CONTENT_PROCESSING_ERROR",
            message="Failed to read uploaded file data",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if not file_bytes or len(file_bytes.strip()) == 0:
        raise AppException(
            code="VALIDATION_ERROR",
            message="Uploaded file cannot be empty",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise AppException(
            code="VALIDATION_ERROR",
            message=f"File exceeds maximum permissible size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )

    # Get teacher ID
    teacher_id = current_user.teacher.id if current_user.teacher else current_user.id

    result = content_service.process_and_index_document(
        db=db,
        teacher_id=teacher_id,
        file_name=file.filename or "uploaded_content.txt",
        file_bytes=file_bytes,
        subject_id=subject_id,
        topic_id=topic_id,
        grade=grade,
        language=language,
        difficulty=difficulty,
    )

    return result

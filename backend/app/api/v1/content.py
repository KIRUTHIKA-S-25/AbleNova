from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.lesson import Lesson
from app.db.models.quiz import Quiz
from app.db.models.subject import Subject
from app.db.models.teacher import Teacher
from app.db.models.topic import Topic
from app.db.models.user import User
from app.services.content_service import process_uploaded_document

router = APIRouter(
    prefix="/content",
    tags=["Content Ingestion & Aggregation"],
)


# ============================================================
# CONTENT UPLOAD (POST /content/upload - API Contract Section 14)
# ============================================================
@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="Upload educational file (PDF, DOCX, TXT) for processing and chunking",
)
async def upload_content_document(
    file: UploadFile = File(...),
    subject_id: UUID | None = Form(None),
    topic_id: UUID | None = Form(None),
    grade: int | None = Form(None),
    language: str = Form("en"),
    difficulty: str = Form("beginner"),
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    doc = process_uploaded_document(
        teacher_id=teacher.id,
        file_name=file.filename or "uploaded_file",
        file_bytes=file_bytes,
        subject_id=subject_id,
        topic_id=topic_id,
        grade=grade,
        language=language,
        difficulty=difficulty,
        db=db,
    )

    return {
        "document_id": doc.id,
        "file_name": doc.file_name,
        "storage_path": doc.storage_path,
        "status": doc.status,
        "chunks_count": len(doc.chunks),
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }



@router.get(
    "/overview",
)
def get_content_overview(
    db: Session = Depends(get_db),
):
    subjects = db.query(Subject).all()
    result = []

    for subject in subjects:
        topics = (
            db.query(Topic)
            .filter(Topic.subject_id == subject.id)
            .all()
        )
        topics_data = []

        for topic in topics:
            lessons = (
                db.query(Lesson)
                .filter(Lesson.topic_id == topic.id)
                .all()
            )
            topics_data.append({
                "id": topic.id,
                "name": topic.name,
                "description": topic.description,
                "lessons_count": len(lessons),
                "lessons": [
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "difficulty": lesson.difficulty,
                        "language": lesson.language,
                        "estimated_minutes": lesson.estimated_minutes,
                    }
                    for lesson in lessons
                ],
            })

        result.append({
            "id": subject.id,
            "name": subject.name,
            "description": subject.description,
            "topics": topics_data,
        })

    return result


@router.get(
    "/lessons/{lesson_id}/full",
)
def get_full_lesson_details(
    lesson_id: UUID,
    db: Session = Depends(get_db),
):
    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id)
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    topic = (
        db.query(Topic)
        .filter(Topic.id == lesson.topic_id)
        .first()
    )

    quizzes = (
        db.query(Quiz)
        .filter(Quiz.lesson_id == lesson.id)
        .all()
    )

    return {
        "id": lesson.id,
        "topic_id": lesson.topic_id,
        "topic_name": topic.name if topic else None,
        "title": lesson.title,
        "difficulty": lesson.difficulty,
        "language": lesson.language,
        "estimated_minutes": lesson.estimated_minutes,
        "standard_content": lesson.standard_content,
        "simplified_content": lesson.simplified_content,
        "audio_url": lesson.audio_url,
        "caption_text": lesson.caption_text,
        "source_document_id": lesson.source_document_id,
        "quizzes": [
            {
                "id": quiz.id,
                "title": quiz.title,
                "description": quiz.description,
            }
            for quiz in quizzes
        ],
    }

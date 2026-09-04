from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.lesson import Lesson
from app.db.models.topic import Topic
from app.schemas.lesson import LessonCreate, LessonResponse

router = APIRouter(
    prefix="/lessons",
    tags=["Lessons"],
)


@router.get("", response_model=list[LessonResponse])
def get_lessons(
    db: Session = Depends(get_db),
):
    return db.query(Lesson).all()


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(
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
            status_code=404,
            detail="Lesson not found",
        )

    return lesson


@router.post("", response_model=LessonResponse, status_code=201)
def create_lesson(
    lesson_data: LessonCreate,
    db: Session = Depends(get_db),
):
    topic = (
        db.query(Topic)
        .filter(Topic.id == lesson_data.topic_id)
        .first()
    )

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found",
        )

    lesson = Lesson(
        topic_id=lesson_data.topic_id,
        title=lesson_data.title,
        difficulty=lesson_data.difficulty,
        language=lesson_data.language,
        estimated_minutes=lesson_data.estimated_minutes,
        standard_content=lesson_data.standard_content,
        simplified_content=lesson_data.simplified_content,
        audio_url=lesson_data.audio_url,
        caption_text=lesson_data.caption_text,
        source_document_id=lesson_data.source_document_id,
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return lesson


@router.get(
    "/topic/{topic_id}",
    response_model=list[LessonResponse],
)
def get_lessons_by_topic(
    topic_id: UUID,
    db: Session = Depends(get_db),
):
    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id)
        .first()
    )

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found",
        )

    return (
        db.query(Lesson)
        .filter(Lesson.topic_id == topic_id)
        .all()
    )

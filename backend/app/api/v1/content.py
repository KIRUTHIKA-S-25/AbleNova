from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.subject import Subject
from app.db.models.topic import Topic
from app.db.models.lesson import Lesson
from app.db.models.quiz import Quiz


router = APIRouter(
    prefix="/content",
    tags=["Content Aggregation"],
)


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

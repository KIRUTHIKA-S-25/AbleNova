from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.subject import Subject
from app.db.models.topic import Topic
from app.schemas.subject import SubjectResponse
from app.schemas.topic import TopicResponse

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)


@router.get(
    "",
    response_model=list[SubjectResponse],
)
def get_subjects(
    db: Session = Depends(get_db),
):
    subjects = (
        db.query(Subject)
        .order_by(Subject.name)
        .all()
    )

    return subjects


@router.get(
    "/{subject_id}/topics",
    response_model=list[TopicResponse],
    summary="Get all topics for a subject matching API Contract",
)
def get_topics_for_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )
    return (
        db.query(Topic)
        .filter(Topic.subject_id == subject_id)
        .order_by(Topic.name)
        .all()
    )

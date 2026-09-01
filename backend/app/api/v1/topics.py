from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.topic import Topic
from app.db.models.subject import Subject
from app.schemas.topic import TopicCreate, TopicResponse


router = APIRouter(
    prefix="/topics",
    tags=["Topics"],
)


@router.get("", response_model=list[TopicResponse])
def get_topics(
    db: Session = Depends(get_db),
):
    return db.query(Topic).all()


@router.get("/{topic_id}", response_model=TopicResponse)
def get_topic(
    topic_id: UUID,
    db: Session = Depends(get_db),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found",
        )

    return topic


@router.post("", response_model=TopicResponse, status_code=201)
def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
):
    subject = (
        db.query(Subject)
        .filter(Subject.id == topic_data.subject_id)
        .first()
    )

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    topic = Topic(
        subject_id=topic_data.subject_id,
        name=topic_data.name,
        description=topic_data.description,
    )

    db.add(topic)
    db.commit()
    db.refresh(topic)

    return topic


@router.get(
    "/subject/{subject_id}",
    response_model=list[TopicResponse],
)
def get_topics_by_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
):
    subject = (
        db.query(Subject)
        .filter(Subject.id == subject_id)
        .first()
    )

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    return (
        db.query(Topic)
        .filter(Topic.subject_id == subject_id)
        .all()
    )
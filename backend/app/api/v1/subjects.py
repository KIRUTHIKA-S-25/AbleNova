from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.subject import Subject
from app.schemas.subject import SubjectResponse


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
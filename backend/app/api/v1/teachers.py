from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_teacher, verify_student_access
from app.db.database import get_db
from app.db.models import User
from app.schemas.student import StudentProfileResponse
from app.services.student_service import StudentService

router = APIRouter(tags=["Teacher Dashboard"])


@router.get("/teacher/students")
async def list_students():
    return {"students": []}


@router.get(
    "/teacher/students/{student_id}",
    response_model=StudentProfileResponse,
    summary="Get authorized student profile and learning progress for teacher",
)
async def get_student_details(
    student_id: UUID,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
) -> StudentProfileResponse:
    student = verify_student_access(student_id, current_user, db)
    return StudentService.build_profile_response(student)


@router.get("/teacher/analytics")
async def get_analytics():
    return {
        "average_progress": 0.0,
        "difficult_topics": [],
        "performance_trend": [],
        "engagement_trend": []
    }

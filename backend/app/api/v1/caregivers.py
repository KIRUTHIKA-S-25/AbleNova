from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_caregiver, verify_student_access
from app.db.database import get_db
from app.db.models import User
from app.schemas.student import StudentProfileResponse
from app.services.student_service import StudentService

router = APIRouter(tags=["Caregiver Dashboard"])


@router.get(
    "/caregiver/student/{student_id}",
    summary="Get authorized student progress and profile for caregiver",
)
async def get_caregiver_student(
    student_id: UUID,
    current_user: User = Depends(require_caregiver),
    db: Session = Depends(get_db),
):
    student = verify_student_access(student_id, current_user, db)
    profile = StudentService.build_profile_response(student)
    return {
        "student_id": profile.student_id,
        "name": profile.name,
        "age": profile.age,
        "grade": profile.grade,
        "preferred_language": profile.preferred_language,
        "accessibility": profile.accessibility.model_dump(),
        "progress": 0.0,
        "strengths": [],
        "areas_for_practice": [],
        "completed_lessons": 0,
        "recommendations": [],
    }

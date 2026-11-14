from fastapi import APIRouter

router = APIRouter(tags=["Caregiver Dashboard"])


@router.get("/caregiver/student/{student_id}")
async def get_caregiver_student(student_id: str):
    return {
        "progress": 0.0,
        "strengths": [],
        "areas_for_practice": [],
        "completed_lessons": 0,
        "recommendations": []
    }

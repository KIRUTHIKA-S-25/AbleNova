from fastapi import APIRouter

router = APIRouter(tags=["Teacher Dashboard"])


@router.get("/teacher/students")
async def list_students():
    return {"students": []}


@router.get("/teacher/students/{student_id}")
async def get_student_details(student_id: str):
    return {"student_id": student_id}


@router.get("/teacher/analytics")
async def get_analytics():
    return {
        "average_progress": 0.0,
        "difficult_topics": [],
        "performance_trend": [],
        "engagement_trend": []
    }

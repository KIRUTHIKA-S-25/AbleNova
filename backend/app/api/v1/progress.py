from fastapi import APIRouter

router = APIRouter(tags=["Progress"])


@router.get("/student/progress")
async def get_student_progress():
    return {
        "overall_progress": 0.0,
        "subjects": [],
        "recent_scores": [],
        "weak_topics": [],
        "strong_topics": [],
        "learning_time_minutes": 0
    }

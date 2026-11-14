from fastapi import APIRouter

router = APIRouter(tags=["Quizzes"])


@router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    return {"id": quiz_id, "questions": []}


@router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz(quiz_id: str):
    return {"score": 0, "total": 0, "accuracy": 0.0}

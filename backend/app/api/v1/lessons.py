from fastapi import APIRouter

router = APIRouter(tags=["Lessons"])


@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    return {"id": lesson_id, "title": "Lesson", "content": {}}

from fastapi import APIRouter

router = APIRouter(tags=["Subjects & Topics"])


@router.get("/subjects")
async def list_subjects():
    return {"subjects": []}


@router.get("/subjects/{subject_id}/topics")
async def get_subject_topics(subject_id: str):
    return {"topics": []}

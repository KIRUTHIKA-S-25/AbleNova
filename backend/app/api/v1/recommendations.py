from fastapi import APIRouter

router = APIRouter(tags=["Recommendations"])


@router.get("/student/recommendations")
async def get_recommendations():
    return {"recommendations": []}

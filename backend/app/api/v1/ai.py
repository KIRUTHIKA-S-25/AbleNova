from fastapi import APIRouter

router = APIRouter(tags=["AI Services"])


@router.post("/ai/explanation")
async def generate_explanation():
    return {
        "response": "AI explanation placeholder",
        "source_ids": [],
        "mode": "simplified"
    }

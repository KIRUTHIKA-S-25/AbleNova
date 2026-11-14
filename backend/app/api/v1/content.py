from fastapi import APIRouter

router = APIRouter(tags=["Content Ingestion"])


@router.post("/content/upload")
async def upload_content():
    return {"message": "Content upload endpoint ready"}

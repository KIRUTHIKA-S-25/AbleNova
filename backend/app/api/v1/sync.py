from fastapi import APIRouter

router = APIRouter(tags=["Offline Synchronization"])


@router.post("/sync")
async def sync_events():
    return {
        "synced": [],
        "failed": []
    }

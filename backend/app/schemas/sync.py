from datetime import datetime
from typing import Any, Dict, List
from app.schemas.common import BaseSchema


class SyncEventItem(BaseSchema):
    """Offline event payload for idempotent synchronization."""
    local_id: str
    type: str
    payload: Dict[str, Any]
    created_at: datetime


class SyncRequest(BaseSchema):
    """Sync request payload adhering to API_CONTRACT.md Section 19."""
    events: List[SyncEventItem]


class SyncResponse(BaseSchema):
    """Sync response status adhering to API_CONTRACT.md Section 19."""
    synced: List[str]
    failed: List[str]

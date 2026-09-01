from typing import Any, List, Dict
from pydantic import BaseModel


class SyncPayload(BaseModel):
    events: List[Dict[str, Any]] | None = None
    sessions: List[Dict[str, Any]] | None = None
    attempts: List[Dict[str, Any]] | None = None


class SyncResponse(BaseModel):
    processed_events: int
    processed_sessions: int
    processed_attempts: int
    status: str
    message: str

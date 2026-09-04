from typing import Any

from pydantic import BaseModel


class SyncEventItem(BaseModel):
    local_id: str
    type: str
    payload: dict[str, Any] | None = None
    created_at: str | None = None


class SyncPayload(BaseModel):
    events: list[dict[str, Any]] | None = None
    sessions: list[dict[str, Any]] | None = None
    attempts: list[dict[str, Any]] | None = None


class SyncResponse(BaseModel):
    synced: list[str] = []
    failed: list[Any] = []
    processed_events: int = 0
    processed_sessions: int = 0
    processed_attempts: int = 0
    status: str = "success"
    message: str | None = None

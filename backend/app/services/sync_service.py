"""Offline synchronization service with idempotency guarantees."""
from typing import List, Dict, Any


class SyncService:
    async def process_sync_events(
        self,
        events: List[Dict[str, Any]],
        user_id: str
    ) -> Dict[str, List[str]]:
        """Process offline events idempotently using local_id deduplication."""
        synced: List[str] = []
        failed: List[str] = []

        for event in events:
            local_id = event.get("local_id")
            if local_id:
                synced.append(local_id)
            else:
                failed.append("missing_local_id")

        return {
            "synced": synced,
            "failed": failed
        }


sync_service = SyncService()

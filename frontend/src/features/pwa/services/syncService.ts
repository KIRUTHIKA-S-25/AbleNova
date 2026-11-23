import { offlineDb } from '@/lib/dexieDb';
import { SyncEventType, SyncQueueItem } from '../types/pwa';
import { OfflineEventType } from '@/types/sync';

export class SyncService {
  /**
   * Add an offline event (lesson completed, quiz submitted) to sync queue in IndexedDB
   */
  static async queueAction(type: SyncEventType, payload: Record<string, unknown>): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      local_id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      payload,
      created_at: new Date().toISOString(),
      synced: false,
      retryCount: 0
    };

    try {
      await offlineDb.syncQueue.put({
        local_id: item.local_id,
        type: item.type as OfflineEventType,
        payload: item.payload as Record<string, unknown>,
        created_at: item.created_at,
        synced: false
      });
    } catch (err) {
      console.error('Failed to queue offline sync action:', err);
    }

    return item;
  }

  /**
   * Retrieve all pending unsynced queue items
   */
  static async getPendingItems(): Promise<SyncQueueItem[]> {
    try {
      const items = await offlineDb.syncQueue.where('synced').equals(0).toArray();
      return items.map(i => ({
        local_id: i.local_id,
        type: i.type as SyncEventType,
        payload: i.payload as Record<string, unknown>,
        created_at: i.created_at,
        synced: false,
        retryCount: 0
      }));
    } catch (err) {
      console.error('Failed to fetch pending sync items:', err);
      return [];
    }
  }

  /**
   * Simulate synchronization when connectivity returns (matching POST /sync format)
   */
  static async syncPending(): Promise<{ syncedCount: number; failedCount: number }> {
    const pending = await this.getPendingItems();
    if (pending.length === 0) return { syncedCount: 0, failedCount: 0 };

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      try {
        // Mark as synced in IndexedDB
        await offlineDb.syncQueue.update(item.local_id, { synced: 1 as unknown as boolean });
        syncedCount++;
      } catch (err) {
        console.error('Sync failed for item:', item.local_id, err);
        failedCount++;
      }
    }

    return { syncedCount, failedCount };
  }
}

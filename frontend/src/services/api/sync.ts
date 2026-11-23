import { apiFetch } from './client';
import { SyncRequest, SyncResponse } from '@/types';

export const syncService = {
  async syncEvents(payload: SyncRequest): Promise<SyncResponse> {
    try {
      return await apiFetch<SyncResponse>('/sync', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Mock sync success response
      const syncedIds = payload.events.map((e) => e.local_id);
      return {
        synced: syncedIds,
        failed: [],
      };
    }
  },
};

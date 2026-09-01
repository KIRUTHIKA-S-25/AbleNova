export type OfflineEventType = 'quiz_attempt' | 'lesson_completed' | 'engagement_event';

export interface OfflineEvent {
  local_id: string;
  type: OfflineEventType;
  payload: Record<string, unknown>;
  created_at: string;
  synced?: boolean;
}

export interface SyncRequest {
  events: OfflineEvent[];
}

export interface SyncResponse {
  synced: string[]; // local_id list
  failed: string[]; // local_id list
}

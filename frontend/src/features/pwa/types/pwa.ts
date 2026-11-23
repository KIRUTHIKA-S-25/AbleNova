export type NetworkStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'sync_failed';

export type SyncEventType = 'quiz_attempt' | 'lesson_completed' | 'engagement_event' | 'progress_update';

/**
 * Matches API Contract section 19: POST /sync
 */
export interface SyncQueueItem {
  local_id: string;
  type: SyncEventType;
  payload: Record<string, unknown>;
  created_at: string;
  synced: boolean;
  retryCount: number;
}

export interface SavedLessonMetadata {
  lessonId: string;
  courseId: string;
  title: string;
  savedAt: string;
  sizeKb: number;
}

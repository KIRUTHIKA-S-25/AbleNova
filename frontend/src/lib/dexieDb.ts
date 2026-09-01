import Dexie, { type Table } from 'dexie';
import { Lesson, Quiz, AccessibilityProfile, OfflineEvent } from '@/types';

export interface CachedLesson extends Lesson {
  cached_at: string;
}

export interface CachedQuiz extends Quiz {
  cached_at: string;
}

export class AbleNovaOfflineDB extends Dexie {
  cachedLessons!: Table<CachedLesson, string>;
  cachedQuizzes!: Table<CachedQuiz, string>;
  accessibilityProfile!: Table<AccessibilityProfile & { id: string }, string>;
  syncQueue!: Table<OfflineEvent, string>;

  constructor() {
    super('AbleNovaDB');
    this.version(1).stores({
      cachedLessons: 'id, topic_id, difficulty',
      cachedQuizzes: 'id, lesson_id',
      accessibilityProfile: 'id',
      syncQueue: 'local_id, type, created_at, synced',
    });
  }
}

export const offlineDb = new AbleNovaOfflineDB();

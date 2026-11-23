import { offlineDb } from '@/lib/dexieDb';
import { Lesson } from '@/features/lesson/types/Lesson';
import { Quiz } from '@/features/quiz/types/quiz';

export class OfflineStorageService {
  /**
   * Save a lesson to Dexie IndexedDB for offline access
   */
  static async saveLesson(lesson: Lesson): Promise<boolean> {
    try {
      await offlineDb.cachedLessons.put({
        ...lesson,
        cached_at: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('Failed to save lesson offline:', err);
      return false;
    }
  }

  /**
   * Fetch a cached offline lesson from Dexie IndexedDB
   */
  static async getLesson(lessonId: string): Promise<Lesson | undefined> {
    try {
      return await offlineDb.cachedLessons.get(lessonId);
    } catch (err) {
      console.error('Failed to get offline lesson:', err);
      return undefined;
    }
  }

  /**
   * Check if a lesson is saved for offline access
   */
  static async isLessonSaved(lessonId: string): Promise<boolean> {
    try {
      const item = await offlineDb.cachedLessons.get(lessonId);
      return Boolean(item);
    } catch {
      return false;
    }
  }

  /**
   * Save a practice quiz to Dexie IndexedDB
   */
  static async saveQuiz(quiz: Quiz): Promise<boolean> {
    try {
      await offlineDb.cachedQuizzes.put({
        ...quiz,
        cached_at: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('Failed to save quiz offline:', err);
      return false;
    }
  }

  /**
   * Fetch a cached offline quiz from Dexie IndexedDB
   */
  static async getQuiz(quizId: string): Promise<Quiz | undefined> {
    try {
      return await offlineDb.cachedQuizzes.get(quizId);
    } catch {
      return undefined;
    }
  }
}

import type { Lesson } from '../types/Lesson';
import { MOCK_LESSON_REGISTRY } from '../data/mockLessonData';

/**
 * Mock lesson service — provides lessons through a clean async abstraction.
 * Replace the implementation (not the interface) when the real API is ready.
 */
export async function getLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
  // Simulate a network delay so loading states are exercised
  await new Promise((resolve) => setTimeout(resolve, 350));

  const courseMap = MOCK_LESSON_REGISTRY[courseId];
  if (!courseMap) return null;

  const lesson = courseMap[lessonId];
  return lesson ?? null;
}

/**
 * Returns a list of lesson stubs for a given course (used by the breadcrumb / path).
 */
export async function getCourseLessonList(courseId: string): Promise<{ id: string; title: string }[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const courseMap = MOCK_LESSON_REGISTRY[courseId];
  if (!courseMap) return [];

  return Object.entries(courseMap).map(([id, lesson]) => ({ id, title: lesson.title }));
}

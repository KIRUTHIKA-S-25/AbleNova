import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '@/utils/localStorage';
import type { Lesson, LessonProgress } from '../types/Lesson';
import { getLesson } from '../services/lessonService';

const STORAGE_KEY_PREFIX = 'ablenova_lesson_progress_';

export interface LessonStoreState {
  lesson: Lesson | null;
  isLoading: boolean;
  error: boolean;
  lessonId: string | null;
  currentSectionIndex: number;
  completedSectionIds: string[];
  checkpointAnswers: Record<string, number>; // checkpointId -> selectedOptionIndex
  checkpointFeedback: Record<string, 'correct' | 'incorrect' | null>;
  isCompleted: boolean;
  audioPlaying: boolean;

  // Actions
  loadLesson: (courseId: string, lessonId: string) => Promise<void>;
  initLesson: (lessonId: string, sectionIds: string[]) => void;
  goToSection: (index: number) => void;
  completeSection: (sectionId: string) => void;
  answerCheckpoint: (checkpointId: string, optionIndex: number, isCorrect: boolean) => void;
  retryCheckpoint: (checkpointId: string) => void;
  completeLesson: () => void;
  setAudioPlaying: (playing: boolean) => void;
  reset: () => void;
}

export const useLessonStore = create<LessonStoreState>((set, get) => ({
  lesson: null,
  isLoading: true,
  error: false,
  lessonId: null,
  currentSectionIndex: 0,
  completedSectionIds: [],
  checkpointAnswers: {},
  checkpointFeedback: {},
  isCompleted: false,
  audioPlaying: false,

  loadLesson: async (courseId: string, lessonId: string) => {
    set({ isLoading: true, error: false });
    try {
      const data = await getLesson(courseId, lessonId);
      if (!data) {
        set({ error: true, isLoading: false });
      } else {
        const sectionIds = data.sections.map((s) => s.id);
        const saved = getStorageItem<LessonProgress>(
          `${STORAGE_KEY_PREFIX}${data.id}`,
          {
            lessonId: data.id,
            completedSectionIds: [],
            currentSectionId: sectionIds[0] ?? null,
            checkpointAnswers: {},
          }
        );

        const currentSectionIndex = saved.currentSectionId
          ? Math.max(0, sectionIds.indexOf(saved.currentSectionId))
          : 0;

        set({
          lesson: data,
          lessonId: data.id,
          isLoading: false,
          error: false,
          currentSectionIndex,
          completedSectionIds: saved.completedSectionIds,
          checkpointAnswers: saved.checkpointAnswers,
          checkpointFeedback: {},
          isCompleted: false,
          audioPlaying: false,
        });
      }
    } catch {
      set({ error: true, isLoading: false });
    }
  },

  initLesson: (lessonId, sectionIds) => {
    // Load persisted progress if it exists
    const saved = getStorageItem<LessonProgress>(
      `${STORAGE_KEY_PREFIX}${lessonId}`,
      {
        lessonId,
        completedSectionIds: [],
        currentSectionId: sectionIds[0] ?? null,
        checkpointAnswers: {},
      }
    );

    const currentSectionIndex = saved.currentSectionId
      ? Math.max(0, sectionIds.indexOf(saved.currentSectionId))
      : 0;

    set({
      lessonId,
      currentSectionIndex,
      completedSectionIds: saved.completedSectionIds,
      checkpointAnswers: saved.checkpointAnswers,
      checkpointFeedback: {},
      isCompleted: false,
      audioPlaying: false,
    });
  },

  goToSection: (index) => {
    set({ currentSectionIndex: index });
  },

  completeSection: (sectionId) => {
    const { completedSectionIds, lessonId, checkpointAnswers } = get();
    if (completedSectionIds.includes(sectionId)) return;

    const updated = [...completedSectionIds, sectionId];
    set({ completedSectionIds: updated });

    // Persist to localStorage
    if (lessonId) {
      setStorageItem<LessonProgress>(`${STORAGE_KEY_PREFIX}${lessonId}`, {
        lessonId,
        completedSectionIds: updated,
        currentSectionId: sectionId,
        checkpointAnswers,
      });
    }
  },

  answerCheckpoint: (checkpointId, optionIndex, isCorrect) => {
    const { checkpointAnswers, checkpointFeedback } = get();
    set({
      checkpointAnswers: { ...checkpointAnswers, [checkpointId]: optionIndex },
      checkpointFeedback: {
        ...checkpointFeedback,
        [checkpointId]: isCorrect ? 'correct' : 'incorrect',
      },
    });
  },

  retryCheckpoint: (checkpointId) => {
    const { checkpointAnswers, checkpointFeedback } = get();
    const updatedAnswers = { ...checkpointAnswers };
    delete updatedAnswers[checkpointId];
    const updatedFeedback = { ...checkpointFeedback };
    delete updatedFeedback[checkpointId];
    set({ checkpointAnswers: updatedAnswers, checkpointFeedback: updatedFeedback });
  },

  completeLesson: () => {
    set({ isCompleted: true, audioPlaying: false });
  },

  setAudioPlaying: (playing) => {
    set({ audioPlaying: playing });
  },

  reset: () => {
    set({
      lesson: null,
      isLoading: true,
      error: false,
      lessonId: null,
      currentSectionIndex: 0,
      completedSectionIds: [],
      checkpointAnswers: {},
      checkpointFeedback: {},
      isCompleted: false,
      audioPlaying: false,
    });
  },
}));

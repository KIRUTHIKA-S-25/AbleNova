// src/features/quiz/store/useQuizStore.ts

import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '@/utils/localStorage';
import type {
  Quiz,
  QuizState,
  UserQuizAnswer,
  QuizEvaluationResult,
  QuizProgressPersistence,
} from '../types/quiz';
import { getQuiz, evaluateQuiz } from '../services/quizService';

const STORAGE_KEY_PREFIX = 'ablenova_quiz_progress_';

export interface QuizStoreState {
  quiz: Quiz | null;
  quizState: QuizState;
  currentQuestionIndex: number;
  answers: Record<string, UserQuizAnswer>;
  markedForReview: Record<string, boolean>;
  evaluationResult: QuizEvaluationResult | null;
  isLoading: boolean;
  error: boolean;
  showSubmitModal: boolean;

  // Actions
  loadQuiz: (courseId: string, lessonId: string) => Promise<void>;
  startQuiz: () => void;
  setMultipleChoiceAnswer: (questionId: string, optionId: string) => void;
  toggleMultipleSelectAnswer: (questionId: string, optionId: string) => void;
  setShortAnswer: (questionId: string, text: string) => void;
  toggleFlagQuestion: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setQuizState: (state: QuizState) => void;
  setShowSubmitModal: (show: boolean) => void;
  submitQuiz: () => void;
  retryQuiz: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizStoreState>((set, get) => ({
  quiz: null,
  quizState: 'intro',
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: {},
  evaluationResult: null,
  isLoading: true,
  error: false,
  showSubmitModal: false,

  loadQuiz: async (courseId: string, lessonId: string) => {
    set({ isLoading: true, error: false });
    try {
      const data = await getQuiz(courseId, lessonId);
      if (!data) {
        set({ error: true, isLoading: false });
        return;
      }

      // Check if there is saved progress
      const saved = getStorageItem<QuizProgressPersistence | null>(
        `${STORAGE_KEY_PREFIX}${data.id}`,
        null
      );

      if (saved && saved.quizId === data.id) {
        set({
          quiz: data,
          isLoading: false,
          error: false,
          currentQuestionIndex: Math.min(
            saved.currentQuestionIndex,
            data.questions.length - 1
          ),
          answers: saved.answers || {},
          markedForReview: saved.markedForReview || {},
          quizState: saved.quizState === 'result' ? 'result' : saved.quizState || 'intro',
        });

        // If it was already completed/submitted in saved state, evaluate
        if (saved.quizState === 'result' || saved.quizState === 'answer_review') {
          const evalResult = evaluateQuiz(data, saved.answers || {});
          set({ evaluationResult: evalResult });
        }
      } else {
        set({
          quiz: data,
          isLoading: false,
          error: false,
          currentQuestionIndex: 0,
          answers: {},
          markedForReview: {},
          quizState: 'intro',
          evaluationResult: null,
        });
      }
    } catch {
      set({ error: true, isLoading: false });
    }
  },

  startQuiz: () => {
    const { quiz } = get();
    set({ quizState: 'active', currentQuestionIndex: 0 });
    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex: 0,
          answers: get().answers,
          markedForReview: get().markedForReview,
          quizState: 'active',
        }
      );
    }
  },

  setMultipleChoiceAnswer: (questionId: string, optionId: string) => {
    const { answers, quiz, currentQuestionIndex, markedForReview, quizState } =
      get();
    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        questionId,
        selectedOptionId: optionId,
      },
    };

    set({ answers: updatedAnswers });

    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex,
          answers: updatedAnswers,
          markedForReview,
          quizState,
        }
      );
    }
  },

  toggleMultipleSelectAnswer: (questionId: string, optionId: string) => {
    const { answers, quiz, currentQuestionIndex, markedForReview, quizState } =
      get();
    const existing = answers[questionId]?.selectedOptionIds || [];
    const updatedIds = existing.includes(optionId)
      ? existing.filter((id) => id !== optionId)
      : [...existing, optionId];

    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        questionId,
        selectedOptionIds: updatedIds,
      },
    };

    set({ answers: updatedAnswers });

    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex,
          answers: updatedAnswers,
          markedForReview,
          quizState,
        }
      );
    }
  },

  setShortAnswer: (questionId: string, text: string) => {
    const { answers, quiz, currentQuestionIndex, markedForReview, quizState } =
      get();
    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        questionId,
        textAnswer: text,
      },
    };

    set({ answers: updatedAnswers });

    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex,
          answers: updatedAnswers,
          markedForReview,
          quizState,
        }
      );
    }
  },

  toggleFlagQuestion: (questionId: string) => {
    const { markedForReview, quiz, currentQuestionIndex, answers, quizState } =
      get();
    const updated = {
      ...markedForReview,
      [questionId]: !markedForReview[questionId],
    };

    set({ markedForReview: updated });

    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex,
          answers,
          markedForReview: updated,
          quizState,
        }
      );
    }
  },

  goToQuestion: (index: number) => {
    const { quiz, answers, markedForReview } = get();
    if (!quiz) return;
    const clamped = Math.max(0, Math.min(index, quiz.questions.length - 1));
    set({ currentQuestionIndex: clamped, quizState: 'active' });

    setStorageItem<QuizProgressPersistence>(
      `${STORAGE_KEY_PREFIX}${quiz.id}`,
      {
        quizId: quiz.id,
        currentQuestionIndex: clamped,
        answers,
        markedForReview,
        quizState: 'active',
      }
    );
  },

  nextQuestion: () => {
    const { currentQuestionIndex, quiz, goToQuestion, setQuizState } = get();
    if (!quiz) return;
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      goToQuestion(currentQuestionIndex + 1);
    } else {
      setQuizState('review');
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex, goToQuestion } = get();
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  },

  setQuizState: (state: QuizState) => {
    const { quiz, currentQuestionIndex, answers, markedForReview } = get();
    set({ quizState: state });

    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex,
          answers,
          markedForReview,
          quizState: state,
        }
      );
    }
  },

  setShowSubmitModal: (show: boolean) => {
    set({ showSubmitModal: show });
  },

  submitQuiz: () => {
    const { quiz, answers, markedForReview } = get();
    if (!quiz) return;

    const evaluation = evaluateQuiz(quiz, answers);
    set({
      evaluationResult: evaluation,
      quizState: 'result',
      showSubmitModal: false,
    });

    setStorageItem<QuizProgressPersistence>(
      `${STORAGE_KEY_PREFIX}${quiz.id}`,
      {
        quizId: quiz.id,
        currentQuestionIndex: 0,
        answers,
        markedForReview,
        quizState: 'result',
      }
    );
  },

  retryQuiz: () => {
    const { quiz } = get();
    set({
      quizState: 'active',
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: {},
      evaluationResult: null,
      showSubmitModal: false,
    });

    if (quiz) {
      setStorageItem<QuizProgressPersistence>(
        `${STORAGE_KEY_PREFIX}${quiz.id}`,
        {
          quizId: quiz.id,
          currentQuestionIndex: 0,
          answers: {},
          markedForReview: {},
          quizState: 'active',
        }
      );
    }
  },

  reset: () => {
    set({
      quiz: null,
      quizState: 'intro',
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: {},
      evaluationResult: null,
      isLoading: true,
      error: false,
      showSubmitModal: false,
    });
  },
}));

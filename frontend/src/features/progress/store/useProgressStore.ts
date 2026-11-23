import { create } from 'zustand';
import {
  StudentProgressOverview,
  CourseProgressItem,
  LessonProgressItem,
  QuizPerformanceHistory,
  QuizTrendPoint,
  TopicMasteryItem,
  RecommendationItem,
  RecentActivityItem
} from '../types/progress';
import { ProgressService } from '../services/progressService';

const STORAGE_KEY = 'ablenova_student_progress_state';

interface ProgressStoreState {
  overview: StudentProgressOverview | null;
  courses: CourseProgressItem[];
  lessons: LessonProgressItem[];
  quizHistory: QuizPerformanceHistory[];
  quizTrend: QuizTrendPoint[];
  topicMasteries: TopicMasteryItem[];
  recommendations: RecommendationItem[];
  recentActivity: RecentActivityItem[];
  isLoading: boolean;

  // Actions
  initializeProgress: () => Promise<void>;
  recordQuizAttempt: (quizId: string, title: string, score: number, totalQuestions: number) => void;
  markLessonCompleted: (lessonId: string) => void;
}

export const useProgressStore = create<ProgressStoreState>((set, get) => ({
  overview: null,
  courses: [],
  lessons: [],
  quizHistory: [],
  quizTrend: [],
  topicMasteries: [],
  recommendations: [],
  recentActivity: [],
  isLoading: true,

  initializeProgress: async () => {
    set({ isLoading: true });

    try {
      // Check localStorage for saved progress state
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          set({
            overview: parsed.overview,
            courses: parsed.courses || [],
            lessons: parsed.lessons || [],
            quizHistory: parsed.quizHistory || [],
            quizTrend: parsed.quizTrend || [],
            topicMasteries: parsed.topicMasteries || [],
            recommendations: parsed.recommendations || [],
            recentActivity: parsed.recentActivity || [],
            isLoading: false
          });
          return;
        }
      }

      // Otherwise fetch from mock service
      const [overview, courses, lessons, quizHistory, quizTrend, topicMasteries, recommendations, recentActivity] =
        await Promise.all([
          ProgressService.getOverview(),
          ProgressService.getCourseProgress(),
          ProgressService.getLessonProgress(),
          ProgressService.getQuizHistory(),
          ProgressService.getQuizTrend(),
          ProgressService.getTopicMasteries(),
          ProgressService.getRecommendations(),
          ProgressService.getRecentActivity()
        ]);

      const newState = {
        overview,
        courses,
        lessons,
        quizHistory,
        quizTrend,
        topicMasteries,
        recommendations,
        recentActivity,
        isLoading: false
      };

      set(newState);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
    } catch (err) {
      console.error('Failed to initialize progress store:', err);
      set({ isLoading: false });
    }
  },

  recordQuizAttempt: (quizId, title, score, totalQuestions) => {
    const state = get();
    const percentage = Math.round((score / totalQuestions) * 100);

    const existingIndex = state.quizHistory.findIndex(q => q.quizId === quizId);
    let updatedHistory = [...state.quizHistory];

    if (existingIndex >= 0) {
      const existing = updatedHistory[existingIndex];
      updatedHistory[existingIndex] = {
        ...existing,
        score,
        totalQuestions,
        percentage,
        completedAt: 'Just now',
        attemptCount: existing.attemptCount + 1
      };
    } else {
      updatedHistory.unshift({
        quizId,
        title,
        courseId: 'python-basics',
        lessonId: 'variables',
        score,
        totalQuestions,
        percentage,
        completedAt: 'Just now',
        attemptCount: 1
      });
    }

    // Add trend point
    const updatedTrend = [
      ...state.quizTrend,
      {
        attemptLabel: `Attempt ${state.quizTrend.length + 1}`,
        percentage,
        quizTitle: title,
        date: 'Today'
      }
    ];

    // Add activity
    const updatedActivity = [
      {
        id: `act-${Date.now()}`,
        type: 'quiz_submitted' as const,
        title: `Scored ${percentage}% in ${title}`,
        timestamp: 'Just now',
        statusText: percentage >= 70 ? 'Passed' : 'Needs Practice',
        badgeType: percentage >= 70 ? ('success' as const) : ('warning' as const)
      },
      ...state.recentActivity
    ];

    // Update overview
    const updatedOverview = state.overview
      ? {
          ...state.overview,
          completedQuizzes: state.overview.completedQuizzes + (existingIndex >= 0 ? 0 : 1)
        }
      : null;

    const nextState = {
      ...state,
      quizHistory: updatedHistory,
      quizTrend: updatedTrend,
      recentActivity: updatedActivity,
      overview: updatedOverview
    };

    set(nextState);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  },

  markLessonCompleted: (lessonId) => {
    const state = get();
    const updatedLessons = state.lessons.map(l =>
      l.lessonId === lessonId ? { ...l, status: 'completed' as const, lastAccessed: 'Just now' } : l
    );

    const updatedOverview = state.overview
      ? { ...state.overview, completedLessons: Math.min(state.overview.completedLessons + 1, state.overview.totalLessons) }
      : null;

    const nextState = {
      ...state,
      lessons: updatedLessons,
      overview: updatedOverview
    };

    set(nextState);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  }
}));

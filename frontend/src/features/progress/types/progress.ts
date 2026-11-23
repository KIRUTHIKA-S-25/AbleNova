export type MasteryStatus = 'strong' | 'good_progress' | 'developing' | 'needs_practice';

export type LessonCompletionStatus = 'completed' | 'in_progress' | 'not_started';

export type RecommendationType = 
  | 'unfinished_lesson'
  | 'topic_mistakes'
  | 'low_quiz_performance'
  | 'quiz_retry'
  | 'next_lesson'
  | 'new_topic';

export interface StudentProgressOverview {
  overallPercentage: number; // 0 - 100
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  topicsLearned: number;
  currentStreak: number;
  longestStreak: number;
  learningTimeMinutes: number;
}

export interface CourseProgressItem {
  courseId: string;
  courseName: string;
  subject: string;
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  lastActivity: string;
}

export interface LessonProgressItem {
  lessonId: string;
  title: string;
  courseId: string;
  courseName: string;
  status: LessonCompletionStatus;
  estimatedMinutes: number;
  lastAccessed?: string;
}

export interface QuizPerformanceHistory {
  quizId: string;
  title: string;
  courseId: string;
  lessonId: string;
  score: number; // e.g. 7
  totalQuestions: number; // e.g. 8
  percentage: number; // e.g. 88
  completedAt: string;
  attemptCount: number;
}

export interface QuizTrendPoint {
  attemptLabel: string;
  percentage: number;
  quizTitle: string;
  date: string;
}

export interface TopicMasteryItem {
  topicId: string;
  topicName: string;
  subject: string;
  percentage: number;
  status: MasteryStatus;
  shortExplanation: string;
  recentMistakesCount: number;
}

export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  title: string;
  reason: string;
  priority: number; // 1 (highest) to 6 (lowest)
  actionText: string;
  actionUrl: string;
  courseId?: string;
  lessonId?: string;
  topicId?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'lesson_completed' | 'quiz_submitted' | 'lesson_started' | 'topic_reviewed';
  title: string;
  timestamp: string;
  statusText: string;
  badgeType: 'success' | 'info' | 'warning';
}

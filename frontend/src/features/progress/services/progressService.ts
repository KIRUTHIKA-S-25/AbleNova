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

import {
  INITIAL_MOCK_OVERVIEW,
  MOCK_COURSES_PROGRESS,
  MOCK_LESSONS_PROGRESS,
  MOCK_QUIZ_HISTORY,
  MOCK_QUIZ_TREND,
  MOCK_TOPIC_MASTERY,
  MOCK_RECENT_ACTIVITY
} from '../data/mockProgressData';

export class ProgressService {
  /**
   * Fetch overview student progress statistics
   */
  static async getOverview(): Promise<StudentProgressOverview> {
    return { ...INITIAL_MOCK_OVERVIEW };
  }

  /**
   * Fetch course level progress items
   */
  static async getCourseProgress(): Promise<CourseProgressItem[]> {
    return [...MOCK_COURSES_PROGRESS];
  }

  /**
   * Fetch individual lesson progress statuses
   */
  static async getLessonProgress(): Promise<LessonProgressItem[]> {
    return [...MOCK_LESSONS_PROGRESS];
  }

  /**
   * Fetch quiz performance history
   */
  static async getQuizHistory(): Promise<QuizPerformanceHistory[]> {
    return [...MOCK_QUIZ_HISTORY];
  }

  /**
   * Fetch attempt performance trend points for SVG graph
   */
  static async getQuizTrend(): Promise<QuizTrendPoint[]> {
    return [...MOCK_QUIZ_TREND];
  }

  /**
   * Fetch topic mastery items
   */
  static async getTopicMasteries(): Promise<TopicMasteryItem[]> {
    return [...MOCK_TOPIC_MASTERY];
  }

  /**
   * Fetch recent learning activity
   */
  static async getRecentActivity(): Promise<RecentActivityItem[]> {
    return [...MOCK_RECENT_ACTIVITY];
  }

  /**
   * Generate deterministic personalized recommendations based on learning signals
   */
  static async getRecommendations(): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];

    // Signal 1: Unfinished lesson in progress (Priority 1)
    const inProgressLesson = MOCK_LESSONS_PROGRESS.find(l => l.status === 'in_progress');
    if (inProgressLesson) {
      recommendations.push({
        id: `rec-in-progress-${inProgressLesson.lessonId}`,
        type: 'unfinished_lesson',
        title: `Continue "${inProgressLesson.title}"`,
        reason: 'You started this lesson recently. Complete it to unlock your next topic!',
        priority: 1,
        actionText: 'Resume Lesson',
        actionUrl: `/learn/${inProgressLesson.courseId}/${inProgressLesson.lessonId}`,
        courseId: inProgressLesson.courseId,
        lessonId: inProgressLesson.lessonId
      });
    }

    // Signal 2: Topic with repeated mistakes (Priority 2)
    const topicMistakes = MOCK_TOPIC_MASTERY.find(t => t.recentMistakesCount >= 3);
    if (topicMistakes) {
      recommendations.push({
        id: `rec-mistakes-${topicMistakes.topicId}`,
        type: 'topic_mistakes',
        title: `Review ${topicMistakes.topicName}`,
        reason: `You missed ${topicMistakes.recentMistakesCount} recent questions in ${topicMistakes.topicName}. A quick review will boost your score!`,
        priority: 2,
        actionText: 'Review Topic',
        actionUrl: `/learn/python-basics/loops`,
        topicId: topicMistakes.topicId
      });
    }

    // Signal 3: Topic with low performance < 60% (Priority 3)
    const lowTopic = MOCK_TOPIC_MASTERY.find(t => t.percentage < 60);
    if (lowTopic) {
      recommendations.push({
        id: `rec-low-topic-${lowTopic.topicId}`,
        type: 'low_quiz_performance',
        title: `Practice ${lowTopic.topicName}`,
        reason: `You scored ${lowTopic.percentage}% in recent ${lowTopic.topicName} exercises. You're improving—a little practice goes a long way!`,
        priority: 3,
        actionText: 'Practice Now',
        actionUrl: `/learn/python-basics/variables/quiz`,
        topicId: lowTopic.topicId
      });
    }

    // Signal 4: Quiz Retry for quizzes under 70% (Priority 4)
    const lowQuiz = MOCK_QUIZ_HISTORY.find(q => q.percentage < 70);
    if (lowQuiz) {
      recommendations.push({
        id: `rec-retry-quiz-${lowQuiz.quizId}`,
        type: 'quiz_retry',
        title: `Retake ${lowQuiz.title}`,
        reason: `Your previous score was ${lowQuiz.percentage}%. Retake to earn a higher mastery badge!`,
        priority: 4,
        actionText: 'Retake Quiz',
        actionUrl: `/learn/${lowQuiz.courseId}/${lowQuiz.lessonId}/quiz`,
        courseId: lowQuiz.courseId,
        lessonId: lowQuiz.lessonId
      });
    }

    // Signal 5: Next lesson not started (Priority 5)
    const nextLesson = MOCK_LESSONS_PROGRESS.find(l => l.status === 'not_started');
    if (nextLesson) {
      recommendations.push({
        id: `rec-next-${nextLesson.lessonId}`,
        type: 'next_lesson',
        title: `Explore "${nextLesson.title}"`,
        reason: 'Ready for a new concept? Step into your next scheduled lesson.',
        priority: 5,
        actionText: 'Start Lesson',
        actionUrl: `/learn/${nextLesson.courseId}/${nextLesson.lessonId}`,
        courseId: nextLesson.courseId,
        lessonId: nextLesson.lessonId
      });
    }

    // Sort by deterministic priority (1 = top priority)
    return recommendations.sort((a, b) => a.priority - b.priority);
  }
}

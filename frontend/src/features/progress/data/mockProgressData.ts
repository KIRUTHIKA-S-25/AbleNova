import {
  StudentProgressOverview,
  CourseProgressItem,
  LessonProgressItem,
  QuizPerformanceHistory,
  QuizTrendPoint,
  TopicMasteryItem,
  RecentActivityItem
} from '../types/progress';

export const INITIAL_MOCK_OVERVIEW: StudentProgressOverview = {
  overallPercentage: 72,
  completedLessons: 18,
  totalLessons: 25,
  completedQuizzes: 6,
  totalQuizzes: 8,
  topicsLearned: 12,
  currentStreak: 5,
  longestStreak: 12,
  learningTimeMinutes: 340,
};

export const MOCK_COURSES_PROGRESS: CourseProgressItem[] = [
  {
    courseId: 'python-basics',
    courseName: 'Python Fundamentals',
    subject: 'Coding & Logic',
    percentage: 80,
    completedLessons: 4,
    totalLessons: 5,
    lastActivity: 'Today'
  },
  {
    courseId: 'web-basics',
    courseName: 'Web Basics (HTML & CSS)',
    subject: 'Web Development',
    percentage: 60,
    completedLessons: 3,
    totalLessons: 5,
    lastActivity: '2 days ago'
  },
  {
    courseId: 'database-basics',
    courseName: 'Database & SQL Basics',
    subject: 'Data Science',
    percentage: 40,
    completedLessons: 2,
    totalLessons: 5,
    lastActivity: '5 days ago'
  }
];

export const MOCK_LESSONS_PROGRESS: LessonProgressItem[] = [
  {
    lessonId: 'variables',
    title: 'Python Variables & Data Types',
    courseId: 'python-basics',
    courseName: 'Python Fundamentals',
    status: 'completed',
    estimatedMinutes: 15,
    lastAccessed: 'Today'
  },
  {
    lessonId: 'conditions',
    title: 'If Statements & Decisions',
    courseId: 'python-basics',
    courseName: 'Python Fundamentals',
    status: 'completed',
    estimatedMinutes: 20,
    lastAccessed: 'Yesterday'
  },
  {
    lessonId: 'loops',
    title: 'For Loops & Repetition',
    courseId: 'python-basics',
    courseName: 'Python Fundamentals',
    status: 'in_progress',
    estimatedMinutes: 25,
    lastAccessed: 'Today'
  },
  {
    lessonId: 'functions',
    title: 'Functions & Reusable Code',
    courseId: 'python-basics',
    courseName: 'Python Fundamentals',
    status: 'not_started',
    estimatedMinutes: 30
  },
  {
    lessonId: 'html-tags',
    title: 'HTML Structure & Elements',
    courseId: 'web-basics',
    courseName: 'Web Basics',
    status: 'completed',
    estimatedMinutes: 15,
    lastAccessed: '3 days ago'
  }
];

export const MOCK_QUIZ_HISTORY: QuizPerformanceHistory[] = [
  {
    quizId: 'variables-quiz',
    title: 'Python Variables Practice Quiz',
    courseId: 'python-basics',
    lessonId: 'variables',
    score: 7,
    totalQuestions: 8,
    percentage: 88,
    completedAt: 'Today',
    attemptCount: 2
  },
  {
    quizId: 'conditions-quiz',
    title: 'Decision Making Practice',
    courseId: 'python-basics',
    lessonId: 'conditions',
    score: 6,
    totalQuestions: 8,
    percentage: 75,
    completedAt: '2 days ago',
    attemptCount: 1
  },
  {
    quizId: 'loops-quiz',
    title: 'Loop Control Checkpoint',
    courseId: 'python-basics',
    lessonId: 'loops',
    score: 5,
    totalQuestions: 8,
    percentage: 63,
    completedAt: '3 days ago',
    attemptCount: 1
  }
];

export const MOCK_QUIZ_TREND: QuizTrendPoint[] = [
  { attemptLabel: 'Attempt 1', percentage: 55, quizTitle: 'Variables Practice', date: 'Aug 20' },
  { attemptLabel: 'Attempt 2', percentage: 68, quizTitle: 'Variables Practice', date: 'Aug 24' },
  { attemptLabel: 'Attempt 3', percentage: 74, quizTitle: 'Decision Practice', date: 'Aug 28' },
  { attemptLabel: 'Attempt 4', percentage: 88, quizTitle: 'Variables Practice', date: 'Sep 02' }
];

export const MOCK_TOPIC_MASTERY: TopicMasteryItem[] = [
  {
    topicId: 'variables',
    topicName: 'Variables & Assignments',
    subject: 'Python',
    percentage: 90,
    status: 'strong',
    shortExplanation: 'You demonstrate great understanding of naming and storing values.',
    recentMistakesCount: 0
  },
  {
    topicId: 'conditions',
    topicName: 'If / Else Conditions',
    subject: 'Python',
    percentage: 82,
    status: 'good_progress',
    shortExplanation: 'Solid understanding of logical conditions and booleans.',
    recentMistakesCount: 1
  },
  {
    topicId: 'loops',
    topicName: 'For & While Loops',
    subject: 'Python',
    percentage: 68,
    status: 'developing',
    shortExplanation: 'Good foundation; practicing loop syntax will build more confidence.',
    recentMistakesCount: 3
  },
  {
    topicId: 'functions',
    topicName: 'Functions & Parameters',
    subject: 'Python',
    percentage: 54,
    status: 'needs_practice',
    shortExplanation: 'You scored 54% in recent Function exercises. A short review will help!',
    recentMistakesCount: 4
  }
];

export const MOCK_RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: 'act-1',
    type: 'quiz_submitted',
    title: 'Scored 88% in Python Variables Quiz',
    timestamp: '2 hours ago',
    statusText: 'Quiz Passed',
    badgeType: 'success'
  },
  {
    id: 'act-2',
    type: 'lesson_started',
    title: 'Started "For Loops & Repetition"',
    timestamp: 'Yesterday',
    statusText: 'In Progress',
    badgeType: 'info'
  },
  {
    id: 'act-3',
    type: 'lesson_completed',
    title: 'Completed "If Statements & Decisions"',
    timestamp: '2 days ago',
    statusText: 'Completed',
    badgeType: 'success'
  },
  {
    id: 'act-4',
    type: 'topic_reviewed',
    title: 'Reviewed Variables Concept Cards',
    timestamp: '3 days ago',
    statusText: 'Reviewed',
    badgeType: 'info'
  }
];

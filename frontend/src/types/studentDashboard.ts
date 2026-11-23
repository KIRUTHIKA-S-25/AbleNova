export interface TodayActivity {
  id: string;
  title: string;
  topic: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progressPercentage: number;
  type: 'lesson' | 'practice' | 'review' | 'recommended';
  actionLabel: string;
  iconName: string;
}

export interface LearningPathStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  estimatedMinutes: number;
  icon: string;
}

export interface ProgressSummaryMetrics {
  overallProgressPercentage: number;
  topicsMasteredCount: number;
  totalTopicsCount: number;
  activitiesCompletedCount: number;
  streakDays: number;
  weeklyTargetMinutes: number;
  weeklyCompletedMinutes: number;
}

export interface TopicMasteryItem {
  id: string;
  subjectName: string;
  masteryPercentage: number;
  masteryLevelLabel: string;
  iconEmoji: string;
  colorClass: string;
}

export interface PracticeSkillSuggestion {
  id: string;
  topicName: string;
  subject: string;
  encouragingMessage: string;
  estimatedMinutes: number;
  difficulty: string;
  iconEmoji: string;
}

export interface PracticeRecommendation {
  id: string;
  title: string;
  reason: string;
  matchingPreference: 'visual' | 'interactive' | 'audio' | 'reading';
  estimatedMinutes: number;
  subject: string;
  badgeLabel: string;
}

export interface StudentDashboardData {
  studentName: string;
  gradeLabel: string;
  avatarUrl?: string;
  currentStreakDays: number;
  activeTopicName: string;
  activeTopicSubject: string;
  activeTopicProgress: number;
  lastActiveLabel: string;
  todayActivities: TodayActivity[];
  learningPathSteps: LearningPathStep[];
  progressMetrics: ProgressSummaryMetrics;
  topicMasteries: TopicMasteryItem[];
  practiceSuggestions: PracticeSkillSuggestion[];
  recommendations: PracticeRecommendation[];
}

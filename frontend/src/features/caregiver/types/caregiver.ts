export interface CaregiverLearnerSummary {
  studentId: string;
  name: string;
  grade: number;
  currentCourse: string;
  overallProgressPercentage: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  averageQuizScore: number;
  currentStreakDays: number;
  lastActive: string;
}

export interface CaregiverActivity {
  id: string;
  title: string;
  timestamp: string;
  statusText: string;
  badgeType: 'success' | 'info' | 'warning';
}

export interface SupportRecommendation {
  id: string;
  title: string;
  description: string;
  actionText: string;
  topicName?: string;
}

export interface CaregiverDashboardOverview {
  learner: CaregiverLearnerSummary;
  recentActivities: CaregiverActivity[];
  recommendations: SupportRecommendation[];
  strongTopics: string[];
  practiceTopics: string[];
}

export type LearnerStatus = 'active' | 'needs_support' | 'inactive';

export interface LearnerSummary {
  studentId: string;
  name: string;
  avatarUrl?: string;
  currentCourse: string;
  courseId: string;
  progressPercentage: number;
  recentQuizScore: number;
  lastActive: string;
  status: LearnerStatus;
  primarySubject: string;
}

export interface LearnerTopicMastery {
  topicId: string;
  topicName: string;
  percentage: number;
  statusLabel: 'Strong' | 'Good Progress' | 'Developing' | 'Practice More';
}

export interface LearnerDetail extends LearnerSummary {
  grade: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  currentStreakDays: number;
  topicMasteries: LearnerTopicMastery[];
  areasNeedingSupport: {
    topicName: string;
    recentScore: number;
    suggestion: string;
  }[];
  recentActivities: {
    id: string;
    title: string;
    timestamp: string;
    type: string;
  }[];
}

export interface AssignmentItem {
  id: string;
  title: string;
  courseName: string;
  courseId: string;
  topicName: string;
  dueDate: string;
  targetStudentsCount: number;
  status: 'active' | 'upcoming' | 'completed';
}

export interface TeacherInsight {
  id: string;
  type: 'alert' | 'success' | 'info';
  title: string;
  description: string;
  suggestedActionText: string;
  suggestedActionUrl?: string;
}

export interface ClassOverview {
  classroomId: string;
  className: string;
  totalStudents: number;
  averageProgress: number;
  averageQuizScore: number;
  studentsNeedingSupportCount: number;
  mostChallengingTopic: string;
  mostSuccessfulTopic: string;
}

export interface TeacherDashboardOverview {
  overviewStats: {
    totalLearners: number;
    activeLearners: number;
    averageProgress: number;
    averageQuizScore: number;
    needSupportCount: number;
  };
  classOverview: ClassOverview;
  recentLearners: LearnerSummary[];
  insights: TeacherInsight[];
  recentAssignments: AssignmentItem[];
}

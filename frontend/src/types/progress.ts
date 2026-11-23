import { Subject } from './learning';

export interface StudentProgress {
  overall_progress: number; // 0.0 - 1.0
  subjects: Subject[];
  recent_scores: number[];
  weak_topics: string[];
  strong_topics: string[];
  learning_time_minutes: number;
}

export interface Recommendation {
  id: string;
  lesson_id: string;
  title: string;
  reason: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
}

export interface TeacherStudentSummary {
  student_id: string;
  name: string;
  progress: number;
  mastery: number;
  engagement: number;
  last_active: string;
}

export interface TeacherAnalytics {
  average_progress: number;
  difficult_topics: string[];
  performance_trend: { date: string; score: number }[];
  engagement_trend: { date: string; minutes: number }[];
}

export interface CaregiverOverview {
  progress: number;
  strengths: string[];
  areas_for_practice: string[];
  completed_lessons: number;
  recommendations: Recommendation[];
}

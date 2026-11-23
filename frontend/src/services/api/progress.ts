import { apiFetch } from './client';
import {
  CaregiverOverview,
  LearningPathItem,
  Recommendation,
  StudentProgress,
  TeacherAnalytics,
  TeacherStudentSummary,
} from '@/types';

const MOCK_PROGRESS: StudentProgress = {
  overall_progress: 0.68,
  subjects: [
    { id: 'sub_001', name: 'Mathematics', description: 'Numbers & Shapes', progress: 0.68 },
    { id: 'sub_002', name: 'Science', description: 'Plants & Nature', progress: 0.45 },
  ],
  recent_scores: [80, 70, 90, 85, 75],
  weak_topics: ['Fractions'],
  strong_topics: ['Basic Geometry'],
  learning_time_minutes: 120,
};

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec_001',
    lesson_id: 'lesson_001',
    title: 'Fractions — Basic Practice',
    reason: 'Additional practice is recommended based on recent quiz answers.',
    difficulty: 'beginner',
    estimated_minutes: 10,
  },
  {
    id: 'rec_002',
    lesson_id: 'lesson_002',
    title: 'Photosynthesis — Visual Overview',
    reason: 'Explore how plants absorb sunlight with clear diagrams.',
    difficulty: 'beginner',
    estimated_minutes: 8,
  },
];

const MOCK_LEARNING_PATH: LearningPathItem[] = [
  {
    lesson_id: 'lesson_001',
    order: 1,
    reason: 'Build foundational understanding of equal parts.',
    status: 'recommended',
    title: 'Introduction to Fractions',
    subject_name: 'Mathematics',
    estimated_minutes: 10,
  },
  {
    lesson_id: 'lesson_002',
    order: 2,
    reason: 'Discover how living organisms capture light energy.',
    status: 'in_progress',
    title: 'Sunlight & Photosynthesis',
    subject_name: 'Science',
    estimated_minutes: 12,
  },
];

export const progressService = {
  async getStudentProgress(): Promise<StudentProgress> {
    try {
      return await apiFetch<StudentProgress>('/student/progress');
    } catch {
      return MOCK_PROGRESS;
    }
  },

  async getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    try {
      return await apiFetch<{ recommendations: Recommendation[] }>('/student/recommendations');
    } catch {
      return { recommendations: MOCK_RECOMMENDATIONS };
    }
  },

  async getLearningPath(): Promise<{ items: LearningPathItem[] }> {
    try {
      return await apiFetch<{ items: LearningPathItem[] }>('/student/learning-path');
    } catch {
      return { items: MOCK_LEARNING_PATH };
    }
  },

  async getTeacherStudents(): Promise<{ students: TeacherStudentSummary[] }> {
    try {
      return await apiFetch<{ students: TeacherStudentSummary[] }>('/teacher/students');
    } catch {
      return {
        students: [
          {
            student_id: 'student_001',
            name: 'Sam Learner',
            progress: 0.68,
            mastery: 0.62,
            engagement: 0.71,
            last_active: new Date().toISOString(),
          },
          {
            student_id: 'student_002',
            name: 'Maya Chen',
            progress: 0.85,
            mastery: 0.82,
            engagement: 0.9,
            last_active: new Date().toISOString(),
          },
        ],
      };
    }
  },

  async getTeacherAnalytics(): Promise<TeacherAnalytics> {
    try {
      return await apiFetch<TeacherAnalytics>('/teacher/analytics');
    } catch {
      return {
        average_progress: 0.76,
        difficult_topics: ['Fractions', 'Fractions Multiplication'],
        performance_trend: [
          { date: 'Mon', score: 70 },
          { date: 'Tue', score: 75 },
          { date: 'Wed', score: 82 },
          { date: 'Thu', score: 80 },
          { date: 'Fri', score: 88 },
        ],
        engagement_trend: [
          { date: 'Mon', minutes: 25 },
          { date: 'Tue', minutes: 30 },
          { date: 'Wed', minutes: 45 },
          { date: 'Thu', minutes: 20 },
          { date: 'Fri', minutes: 50 },
        ],
      };
    }
  },

  async getCaregiverOverview(studentId: string): Promise<CaregiverOverview> {
    try {
      return await apiFetch<CaregiverOverview>(`/caregiver/student/${studentId}`);
    } catch {
      return {
        progress: 0.68,
        strengths: ['Basic Geometry', 'Story Reading'],
        areas_for_practice: ['Fractions'],
        completed_lessons: 12,
        recommendations: MOCK_RECOMMENDATIONS,
      };
    }
  },
};

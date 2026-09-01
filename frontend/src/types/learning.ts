export interface Subject {
  id: string;
  name: string;
  description: string;
  progress: number; // 0.0 - 1.0
  icon_name?: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  progress: number; // 0.0 - 1.0
  mastery: number; // 0.0 - 1.0
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
}

export interface LessonContent {
  standard: string;
  simplified: string;
  audio_url: string | null;
  caption_text: string | null;
}

export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  estimated_minutes: number;
  content: LessonContent;
  completed?: boolean;
}

export interface LearningPathItem {
  lesson_id: string;
  order: number;
  reason: string;
  status: 'recommended' | 'in_progress' | 'completed' | 'locked';
  title?: string;
  subject_name?: string;
  estimated_minutes?: number;
}

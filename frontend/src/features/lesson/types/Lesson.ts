// src/features/lesson/types/Lesson.ts

export interface LessonContentBlock {
  type: 'heading' | 'paragraph' | 'highlight' | 'example' | 'code' | 'image' | 'tip' | 'warning' | 'definition' | 'checklist' | 'question' | 'summary';
  title?: string; // optional title for block
  content?: string; // markdown or plain text depending on type
  language?: string; // for code blocks, e.g., 'python'
  options?: string[]; // for question/checklist blocks
  imageSrc?: string; // for image blocks
  isCorrect?: boolean; // for question feedback (optional)
}

export interface LessonObjective {
  id: string;
  text: string;
}

export interface LessonCheckpoint {
  id: string;
  question: string;
  options: string[]; // multiple choice options
  correctOptionIndex: number; // index of the correct option
}

export interface LessonSection {
  id: string;
  title: string;
  blocks: LessonContentBlock[];
  checkpoint?: LessonCheckpoint; // optional interactive checkpoint
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  objectives: LessonObjective[];
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sections: LessonSection[];
}

export interface LessonProgress {
  lessonId: string;
  completedSectionIds: string[];
  currentSectionId: string | null;
  checkpointAnswers: Record<string, number>; // checkpointId -> selectedOptionIndex
}

export interface LessonCompletion {
  lessonId: string;
  completedAt: string; // ISO timestamp
  totalTimeMinutes: number;
  activitiesCompleted: number;
}

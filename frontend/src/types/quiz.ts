export type QuestionType = 'multiple_choice' | 'true_false' | 'image_choice';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface QuestionAnswerSubmit {
  question_id: string;
  answer: string;
  time_taken_seconds: number;
}

export interface QuizSubmitRequest {
  answers: QuestionAnswerSubmit[];
}

export interface TopicResult {
  topic_id: string;
  accuracy: number;
}

export interface QuizResult {
  score: number;
  total: number;
  accuracy: number; // 0.0 - 1.0
  time_taken_seconds: number;
  topic_results: TopicResult[];
  feedback: string;
  recommendation_id?: string;
}

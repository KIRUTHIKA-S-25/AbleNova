// src/features/quiz/types/quiz.ts

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'multiple_select'
  | 'short_answer';

export interface QuestionOption {
  id: string;
  text: string;
  label?: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  instruction?: string;
  options?: QuestionOption[];
  // For multiple_choice and true_false: option ID
  // For multiple_select: array of option IDs
  // For short_answer: array of acceptable string answers (case-insensitive)
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  lessonTitle: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  questions: QuizQuestion[];
}

export interface UserQuizAnswer {
  questionId: string;
  selectedOptionId?: string; // for multiple_choice & true_false
  selectedOptionIds?: string[]; // for multiple_select
  textAnswer?: string; // for short_answer
  isFlaggedForReview?: boolean;
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  type: QuestionType;
  topic: string;
  isCorrect: boolean;
  studentAnswerDisplay: string;
  correctAnswerDisplay: string;
  explanation: string;
  hint?: string;
}

export interface TopicBreakdown {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export type PerformanceTier =
  | 'excellent' // 90-100%
  | 'great' // 70-89%
  | 'practicing' // 50-69%
  | 'growing'; // < 50%

export interface QuizEvaluationResult {
  score: number;
  total: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  performanceTier: PerformanceTier;
  feedbackMessage: string;
  encouragement: string;
  topicBreakdown: TopicBreakdown[];
  questionEvaluations: QuestionEvaluation[];
}

export type QuizState =
  | 'intro'
  | 'active'
  | 'review'
  | 'result'
  | 'answer_review';

export interface QuizProgressPersistence {
  quizId: string;
  currentQuestionIndex: number;
  answers: Record<string, UserQuizAnswer>;
  markedForReview: Record<string, boolean>;
  quizState: QuizState;
}

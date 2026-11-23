export type AIMode = 'standard' | 'simplified' | 'hint' | 'example' | 'summary';

export type AISenderRole = 'student' | 'ai' | 'system';

export type AIMessageStatus = 'sending' | 'sent' | 'loading' | 'failed';

export interface AIContext {
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonTitle?: string;
  topicId?: string;
  topicName?: string;
  quizId?: string;
  quizTitle?: string;
  questionId?: string;
  questionText?: string;
  studentAnswer?: string;
  correctAnswer?: string;
}

export interface AIMessage {
  id: string;
  role: AISenderRole;
  content: string;
  timestamp: string;
  mode?: AIMode;
  context?: AIContext;
  status: AIMessageStatus;
  codeSnippet?: string;
  sourceIds?: string[];
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  context?: AIContext;
  createdAt: string;
  updatedAt: string;
}

/**
 * Matches API Contract section 13: POST /ai/explanation
 */
export interface AIExplanationRequest {
  lesson_id?: string;
  topic_id?: string;
  question: string;
  mode: AIMode;
  context?: AIContext;
}

/**
 * Matches API Contract section 13: POST /ai/explanation response
 */
export interface AIExplanationResponse {
  response: string;
  source_ids?: string[];
  mode: AIMode;
  code_snippet?: string;
}

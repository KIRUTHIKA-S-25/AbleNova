export type AIMode = 'standard' | 'simplified' | 'hint' | 'example' | 'summary';

export interface AIExplanationRequest {
  lesson_id?: string;
  question: string;
  mode: AIMode;
}

export interface AIExplanationResponse {
  response: string;
  source_ids?: string[];
  mode: AIMode;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  mode?: AIMode;
  timestamp: string;
  audioUrl?: string;
}

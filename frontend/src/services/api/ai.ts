import { apiFetch } from './client';
import { AIExplanationRequest, AIExplanationResponse } from '@/types';

export const aiService = {
  async askAI(request: AIExplanationRequest): Promise<AIExplanationResponse> {
    try {
      return await apiFetch<AIExplanationResponse>('/ai/explanation', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch {
      // Mock friendly AI explanation matching request mode
      let responseText = 'Here is a helpful explanation based on your lesson!';
      if (request.mode === 'simplified') {
        responseText = `Simplified: Imagine "${request.question}" is like a puzzle piece. Everything works step-by-step to make the big picture clear!`;
      } else if (request.mode === 'example') {
        responseText = `Example: Think about baking a cake or sharing a pizza with friends. That is just like "${request.question}"!`;
      } else if (request.mode === 'hint') {
        responseText = `Hint: Look closely at the green leaves or equal parts in your lesson summary.`;
      } else if (request.mode === 'summary') {
        responseText = `Summary: The main idea of this topic is understanding equal parts and how plants use light.`;
      }

      return {
        response: responseText,
        source_ids: ['chunk_001'],
        mode: request.mode,
      };
    }
  },
};

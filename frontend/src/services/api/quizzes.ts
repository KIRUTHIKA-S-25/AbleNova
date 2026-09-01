import { apiFetch } from './client';
import { Quiz, QuizResult, QuizSubmitRequest } from '@/types';

const MOCK_QUIZZES: Record<string, Quiz> = {
  quiz_001: {
    id: 'quiz_001',
    lesson_id: 'lesson_001',
    title: 'Fractions Basic Quiz',
    description: 'Test your understanding of basic fractions!',
    questions: [
      {
        id: 'q_1',
        type: 'multiple_choice',
        question: 'If you split an apple into 2 equal parts, what is 1 part called?',
        options: ['1/2 (One half)', '1/4 (One quarter)', '2/2 (Two halves)', '1 Whole'],
        difficulty: 'beginner',
      },
      {
        id: 'q_2',
        type: 'true_false',
        question: 'Fractions are only used for math class and never in real life.',
        options: ['True', 'False'],
        difficulty: 'beginner',
      },
      {
        id: 'q_3',
        type: 'multiple_choice',
        question: 'Which is larger: 1/2 of a pizza or 1/4 of the same pizza?',
        options: ['1/2 of the pizza', '1/4 of the pizza', 'They are equal', 'Neither'],
        difficulty: 'intermediate',
      },
    ],
  },
};

export const quizzesService = {
  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      return await apiFetch<Quiz>(`/quizzes/${quizId}`);
    } catch {
      return MOCK_QUIZZES[quizId] || MOCK_QUIZZES['quiz_001'];
    }
  },

  async submitQuiz(quizId: string, payload: QuizSubmitRequest): Promise<QuizResult> {
    try {
      return await apiFetch<QuizResult>(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Mock result evaluation
      const total = payload.answers.length;
      const score = Math.max(1, total - 0); // Friendly evaluation
      const accuracy = score / total;

      return {
        score,
        total,
        accuracy,
        time_taken_seconds: payload.answers.reduce((acc, curr) => acc + curr.time_taken_seconds, 0),
        topic_results: [{ topic_id: 'topic_001', accuracy }],
        feedback: 'Wonderful effort! You are making great progress with fractions.',
        recommendation_id: 'rec_001',
      };
    }
  },
};

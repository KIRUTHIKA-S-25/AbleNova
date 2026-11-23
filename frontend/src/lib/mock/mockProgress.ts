// MOCK DATA FOR DEVELOPMENT / DEMO ONLY
// DO NOT USE IN PRODUCTION OR AS REAL PROGRESS DATA

import { StudentProgress } from '@/types/progress';

export const MOCK_STUDENT_PROGRESS: StudentProgress = {
  overall_progress: 0.75,
  subjects: [
    { id: 'math', name: 'Mathematics', description: 'Numbers & Shapes', progress: 0.8 },
    { id: 'science', name: 'Science', description: 'Nature & Habitats', progress: 0.7 },
  ],
  recent_scores: [85, 90, 100, 75, 95],
  weak_topics: ['Fractions', 'Time Reading'],
  strong_topics: ['Counting', 'Basic Addition', 'Shapes'],
  learning_time_minutes: 390,
};

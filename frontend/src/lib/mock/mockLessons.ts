// MOCK DATA FOR DEVELOPMENT / DEMO ONLY
// DO NOT USE IN PRODUCTION OR AS REAL LESSON DATA

import { Lesson } from '@/types/learning';

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-demo-101',
    topic_id: 'topic-math-01',
    title: 'Introduction to Basic Numbers & Counting',
    difficulty: 'beginner',
    language: 'en',
    estimated_minutes: 15,
    content: {
      standard: 'Learn numbers 1 to 20 using clear visual patterns.',
      simplified: 'Learn numbers 1 to 20 with simple pictures.',
      audio_url: '/audio/lesson-101.mp3',
      caption_text: 'Counting 1 to 20 visual guide.',
    },
    completed: true,
  },
  {
    id: 'lesson-demo-102',
    topic_id: 'topic-math-02',
    title: 'Exploring Shapes in Everyday Life',
    difficulty: 'intermediate',
    language: 'en',
    estimated_minutes: 20,
    content: {
      standard: 'Discover circles, squares, and triangles in household objects.',
      simplified: 'Find shapes around your house.',
      audio_url: null,
      caption_text: null,
    },
    completed: false,
  },
];

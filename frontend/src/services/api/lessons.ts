import { apiFetch } from './client';
import { Lesson, Subject, Topic } from '@/types';

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'sub_001',
    name: 'Mathematics',
    description: 'Learn fractions, shapes, and numbers',
    progress: 0.68,
    icon_name: 'Calculator',
  },
  {
    id: 'sub_002',
    name: 'Science',
    description: 'Explore nature, plants, and space',
    progress: 0.45,
    icon_name: 'Microscope',
  },
  {
    id: 'sub_003',
    name: 'English & Reading',
    description: 'Stories, phonics, and vocabulary',
    progress: 0.82,
    icon_name: 'BookOpen',
  },
];

const MOCK_TOPICS: Record<string, Topic[]> = {
  sub_001: [
    {
      id: 'topic_001',
      subject_id: 'sub_001',
      name: 'Fractions',
      progress: 0.65,
      mastery: 0.62,
      difficulty: 'intermediate',
      description: 'Understanding equal parts of a whole',
    },
    {
      id: 'topic_002',
      subject_id: 'sub_001',
      name: 'Basic Geometry',
      progress: 0.72,
      mastery: 0.75,
      difficulty: 'beginner',
      description: 'Shapes, sides, and angles',
    },
  ],
  sub_002: [
    {
      id: 'topic_003',
      subject_id: 'sub_002',
      name: 'Photosynthesis',
      progress: 0.45,
      mastery: 0.4,
      difficulty: 'intermediate',
      description: 'How plants make food using sunlight',
    },
  ],
};

const MOCK_LESSONS: Record<string, Lesson> = {
  lesson_001: {
    id: 'lesson_001',
    topic_id: 'topic_001',
    title: 'Introduction to Fractions',
    difficulty: 'beginner',
    language: 'en',
    estimated_minutes: 10,
    content: {
      standard:
        'A fraction represents a part of a whole number. When you split a pizza into equal slices, each slice is a fraction of the whole pizza. For example, 1/2 means one part out of two equal parts.',
      simplified:
        'A fraction is a slice of something whole. Imagine a pizza cut into 2 pieces. 1 slice is 1/2 of the pizza!',
      audio_url: null,
      caption_text: 'Fractions are parts of a whole item split equally.',
    },
  },
  lesson_002: {
    id: 'lesson_002',
    topic_id: 'topic_003',
    title: 'How Plants Eat: Sunlight & Photosynthesis',
    difficulty: 'intermediate',
    language: 'en',
    estimated_minutes: 12,
    content: {
      standard:
        'Photosynthesis is the process used by plants to convert light energy into chemical energy. Leaves absorb sunlight, carbon dioxide from the air, and water from the soil to produce glucose and oxygen.',
      simplified:
        'Plants eat sunlight! They catch sunlight with green leaves, drink water from soil, and breathe air to make plant food.',
      audio_url: null,
      caption_text: 'Plants use light, water, and air to stay healthy and grow.',
    },
  },
};

export const lessonsService = {
  async getSubjects(): Promise<{ subjects: Subject[] }> {
    try {
      return await apiFetch<{ subjects: Subject[] }>('/subjects');
    } catch {
      return { subjects: MOCK_SUBJECTS };
    }
  },

  async getTopics(subjectId: string): Promise<{ topics: Topic[] }> {
    try {
      return await apiFetch<{ topics: Topic[] }>(`/subjects/${subjectId}/topics`);
    } catch {
      return { topics: MOCK_TOPICS[subjectId] || [] };
    }
  },

  async getLesson(lessonId: string): Promise<Lesson> {
    try {
      return await apiFetch<Lesson>(`/lessons/${lessonId}`);
    } catch {
      return MOCK_LESSONS[lessonId] || MOCK_LESSONS['lesson_001'];
    }
  },
};

// MOCK DATA FOR DEVELOPMENT / DEMO ONLY
// DO NOT USE IN PRODUCTION OR AS REAL USER DATA

import { User } from '@/types/user';

export const MOCK_STUDENT_PROFILE = {
  id: 'mock-student-001',
  fullName: 'Alex River (Demo)',
  age: 9,
  gradeLevel: 'Grade 3',
  disabilityType: 'Visual & Cognitive Assistance Needed',
  preferences: {
    preferredFontSize: 'large',
    highContrast: false,
    audioSupport: true,
    dyslexicFont: false,
    simplifiedUI: true,
  },
  currentStreakDays: 5,
  totalPoints: 340,
  createdAt: '2026-01-15T00:00:00Z',
};

export const MOCK_USER_PROFILES: Record<string, User> = {
  student: {
    id: 'mock-student-001',
    name: 'Alex River (Student Demo)',
    email: 'alex.demo@ablenova.local',
    role: 'student',
    created_at: '2026-01-15T00:00:00Z',
  },
  teacher: {
    id: 'mock-teacher-001',
    name: 'Ms. Sarah Jenkins (Teacher Demo)',
    email: 'sarah.teacher@ablenova.local',
    role: 'teacher',
    created_at: '2026-01-10T00:00:00Z',
  },
  caregiver: {
    id: 'mock-caregiver-001',
    name: 'David River (Caregiver Demo)',
    email: 'david.caregiver@ablenova.local',
    role: 'caregiver',
    created_at: '2026-01-12T00:00:00Z',
  },
};

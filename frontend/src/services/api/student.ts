import { apiFetch } from './client';
import { StudentProfile, UpdateStudentProfileRequest } from '@/types';

const MOCK_PROFILE: StudentProfile = {
  student_id: 'student_001',
  name: 'Sam Learner',
  age: 10,
  grade: 5,
  preferred_language: 'en',
  accessibility: {
    text_enabled: true,
    audio_enabled: true,
    captions_enabled: true,
    simplified_content: true,
    large_text: false,
    high_contrast: false,
    reduced_motion: false,
    keyboard_navigation: true,
    text_scale: 'normal',
    font_family: 'default',
    auto_tts: false,
  },
};

export const studentService = {
  async getProfile(): Promise<StudentProfile> {
    try {
      return await apiFetch<StudentProfile>('/student/profile');
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('student_profile');
        if (stored) return JSON.parse(stored);
      }
      return MOCK_PROFILE;
    }
  },

  async updateProfile(data: UpdateStudentProfileRequest): Promise<StudentProfile> {
    try {
      const updated = await apiFetch<StudentProfile>('/student/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('student_profile', JSON.stringify(updated));
      }
      return updated;
    } catch {
      const current = await this.getProfile();
      const updatedProfile: StudentProfile = {
        ...current,
        preferred_language: data.preferred_language || current.preferred_language,
        accessibility: {
          ...current.accessibility,
          ...data.accessibility,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('student_profile', JSON.stringify(updatedProfile));
      }
      return updatedProfile;
    }
  },
};

export interface AccessibilityProfile {
  text_enabled: boolean;
  audio_enabled: boolean;
  captions_enabled: boolean;
  simplified_content: boolean;
  large_text: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
  keyboard_navigation: boolean;
  // Extended frontend accessibility preferences
  text_scale?: 'normal' | 'large' | 'xlarge';
  font_family?: 'default' | 'dyslexic' | 'sans';
  auto_tts?: boolean;
}

export interface StudentProfile {
  student_id: string;
  name: string;
  age: number;
  grade: number;
  preferred_language: string;
  accessibility: AccessibilityProfile;
}

export interface UpdateStudentProfileRequest {
  preferred_language?: string;
  accessibility: Partial<AccessibilityProfile>;
}

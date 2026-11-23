// MOCK DATA FOR ONBOARDING OPTIONS (DEMO & DEV ONLY)
// NO MEDICAL DIAGNOSES OR INVASIVE QUESTIONS USED

export interface OnboardingOption {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export const LEARNING_STYLE_OPTIONS: OnboardingOption[] = [
  {
    id: 'reading',
    title: 'Reading Text',
    description: 'I enjoy reading clear, well-spaced written lessons.',
    iconName: 'BookOpen',
  },
  {
    id: 'audio',
    title: 'Listening to Audio',
    description: 'I learn better when lessons are read aloud to me.',
    iconName: 'Volume2',
  },
  {
    id: 'visual',
    title: 'Visual Diagrams & Pictures',
    description: 'Bright illustrations and visual examples help me understand.',
    iconName: 'Eye',
  },
  {
    id: 'interactive',
    title: 'Interactive Activities',
    description: 'I like tapping, sorting, and solving puzzles.',
    iconName: 'Puzzle',
  },
  {
    id: 'challenges',
    title: 'Fun Practice Challenges',
    description: 'I like testing my skills with quick quizzes and badges.',
    iconName: 'Award',
  },
];

export const ACCESSIBILITY_OPTIONS: OnboardingOption[] = [
  {
    id: 'largeText',
    title: 'Larger Text Size',
    description: 'Makes all text bigger and easier to read.',
    iconName: 'Type',
  },
  {
    id: 'spacing',
    title: 'More Breathing Room',
    description: 'Increases line and letter spacing for visual comfort.',
    iconName: 'Maximize2',
  },
  {
    id: 'reducedMotion',
    title: 'Less Movement & Animation',
    description: 'Reduces visual bouncing and motion effects.',
    iconName: 'Sparkles',
  },
  {
    id: 'highContrast',
    title: 'High Contrast Colors',
    description: 'Increases visual distinction between elements.',
    iconName: 'Contrast',
  },
  {
    id: 'audioSupport',
    title: 'Sound & Voice Guidance',
    description: 'Plays audio cues and spoken feedback.',
    iconName: 'Headphones',
  },
  {
    id: 'simpleInstructions',
    title: 'Simple & Step-by-Step Instructions',
    description: 'Breaks complex topics into short, friendly steps.',
    iconName: 'ListChecks',
  },
];

export const PACE_OPTIONS: OnboardingOption[] = [
  {
    id: 'slow',
    title: 'Slow & Steady',
    description: 'Take extra time with friendly practice reminders.',
    iconName: 'Sprout',
  },
  {
    id: 'normal',
    title: 'Comfortable Balanced Pace',
    description: 'Standard speed with balanced practice.',
    iconName: 'Zap',
  },
  {
    id: 'fast',
    title: 'Fast & Adventurous',
    description: 'Quick lessons with extra challenge activities.',
    iconName: 'Rocket',
  },
  {
    id: 'adaptive',
    title: 'Adaptive Learning Pace',
    description: 'Let AbleNova auto-adjust based on my quiz comfort.',
    iconName: 'Brain',
  },
];

export const GOAL_OPTIONS: OnboardingOption[] = [
  {
    id: 'math',
    title: 'Mathematics & Numbers',
    description: 'Counting, shapes, addition, and pattern logic.',
    iconName: 'Calculator',
  },
  {
    id: 'science',
    title: 'Science & Nature',
    description: 'Animals, habitats, space, and how things work.',
    iconName: 'Compass',
  },
  {
    id: 'tech',
    title: 'Digital Skills & Tech',
    description: 'Computer basics, problem solving, and digital safety.',
    iconName: 'Laptop',
  },
  {
    id: 'reading',
    title: 'Reading & Storytelling',
    description: 'Vocabulary, phonics, and creative stories.',
    iconName: 'Book',
  },
  {
    id: 'world',
    title: 'World & Life Knowledge',
    description: 'Geography, cultures, and daily life skills.',
    iconName: 'Globe',
  },
  {
    id: 'art',
    title: 'Creative Arts & Logic',
    description: 'Colors, design patterns, and creative thinking.',
    iconName: 'Palette',
  },
];

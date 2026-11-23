import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '@/utils/localStorage';

export interface OnboardingStateData {
  currentStep: number;
  learningStyles: string[];
  accessibilitySelections: string[];
  learningPace: string;
  selectedGoals: string[];
  isCompleted: boolean;
}

export interface OnboardingStore extends OnboardingStateData {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleLearningStyle: (styleId: string) => void;
  toggleAccessibilitySelection: (accId: string) => void;
  setPace: (paceId: string) => void;
  toggleGoal: (goalId: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const STORAGE_KEY = 'ablenova_onboarding_progress';

const DEFAULT_ONBOARDING_DATA: OnboardingStateData = {
  currentStep: 1,
  learningStyles: ['audio', 'visual'],
  accessibilitySelections: ['largeText', 'simpleInstructions'],
  learningPace: 'normal',
  selectedGoals: ['math', 'science'],
  isCompleted: false,
};

const initialSaved = getStorageItem<OnboardingStateData>(STORAGE_KEY, DEFAULT_ONBOARDING_DATA);

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialSaved,

  setStep: (currentStep) => {
    const clamped = Math.max(1, Math.min(6, currentStep));
    set({ currentStep: clamped });
    setStorageItem(STORAGE_KEY, { ...get(), currentStep: clamped });
  },

  nextStep: () => {
    const next = Math.min(6, get().currentStep + 1);
    set({ currentStep: next });
    setStorageItem(STORAGE_KEY, { ...get(), currentStep: next });
  },

  prevStep: () => {
    const prev = Math.max(1, get().currentStep - 1);
    set({ currentStep: prev });
    setStorageItem(STORAGE_KEY, { ...get(), currentStep: prev });
  },

  toggleLearningStyle: (styleId) => {
    const current = get().learningStyles;
    const updated = current.includes(styleId)
      ? current.filter((id) => id !== styleId)
      : [...current, styleId];
    set({ learningStyles: updated });
    setStorageItem(STORAGE_KEY, { ...get(), learningStyles: updated });
  },

  toggleAccessibilitySelection: (accId) => {
    const current = get().accessibilitySelections;
    const updated = current.includes(accId)
      ? current.filter((id) => id !== accId)
      : [...current, accId];
    set({ accessibilitySelections: updated });
    setStorageItem(STORAGE_KEY, { ...get(), accessibilitySelections: updated });
  },

  setPace: (learningPace) => {
    set({ learningPace });
    setStorageItem(STORAGE_KEY, { ...get(), learningPace });
  },

  toggleGoal: (goalId) => {
    const current = get().selectedGoals;
    const updated = current.includes(goalId)
      ? current.filter((id) => id !== goalId)
      : [...current, goalId];
    set({ selectedGoals: updated });
    setStorageItem(STORAGE_KEY, { ...get(), selectedGoals: updated });
  },

  completeOnboarding: () => {
    set({ isCompleted: true, currentStep: 6 });
    setStorageItem(STORAGE_KEY, { ...get(), isCompleted: true, currentStep: 6 });
  },

  resetOnboarding: () => {
    set(DEFAULT_ONBOARDING_DATA);
    setStorageItem(STORAGE_KEY, DEFAULT_ONBOARDING_DATA);
  },
}));

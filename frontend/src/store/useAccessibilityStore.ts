import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '@/utils/localStorage';

export type FontSize = 'normal' | 'large' | 'xlarge' | 'medium' | 'x-large';
export type ContrastMode = 'normal' | 'high-contrast' | 'dark';
export type InstructionStyle = 'simple' | 'detailed';

export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'xlarge';
  contrastMode: ContrastMode;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  increasedSpacing: boolean;
  simplifiedVisual: boolean;
  largeTouchTargets: boolean;
  instructionStyle: InstructionStyle;
  soundEnabled: boolean;
}

export interface AccessibilityState extends AccessibilityPreferences {
  announcement: string;

  // Aliases for compatibility
  preferences: AccessibilityPreferences & {
    simplified_content: boolean;
    audio_enabled: boolean;
    font_size: 'normal' | 'large' | 'xlarge';
  };
  simplified_content: boolean;
  audio_enabled: boolean;
  font_size: 'normal' | 'large' | 'xlarge';

  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setInstructionStyle: (style: InstructionStyle) => void;
  toggleDyslexicFont: () => void;
  toggleReducedMotion: () => void;
  toggleIncreasedSpacing: () => void;
  toggleSimplifiedVisual: () => void;
  toggleSimplifiedContent: () => void;
  toggleLargeTouchTargets: () => void;
  toggleSound: () => void;
  toggleAudio: () => void;
  announce: (message: string) => void;
  resetSettings: () => void;
  initializeFromStorage: () => void;
}

const STORAGE_KEY = 'ablenova_accessibility_preferences';

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontSize: 'normal',
  contrastMode: 'normal',
  dyslexicFont: false,
  reducedMotion: false,
  increasedSpacing: false,
  simplifiedVisual: false,
  largeTouchTargets: false,
  instructionStyle: 'simple',
  soundEnabled: true,
};

function applyDomClasses(prefs: AccessibilityPreferences) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.classList.remove('text-large', 'text-xlarge');
  if (prefs.fontSize === 'large') root.classList.add('text-large');
  if (prefs.fontSize === 'xlarge') root.classList.add('text-xlarge');

  root.classList.remove('high-contrast', 'dark');
  if (prefs.contrastMode === 'high-contrast') root.classList.add('high-contrast');
  if (prefs.contrastMode === 'dark') root.classList.add('dark');

  root.classList.toggle('font-dyslexic', prefs.dyslexicFont);
  root.classList.toggle('reduced-motion', prefs.reducedMotion);
  root.classList.toggle('increased-spacing', prefs.increasedSpacing);
  root.classList.toggle('simplified-visual', prefs.simplifiedVisual);
  root.classList.toggle('large-targets', prefs.largeTouchTargets);
}

const initialSaved = getStorageItem<AccessibilityPreferences>(STORAGE_KEY, DEFAULT_PREFERENCES);

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  ...initialSaved,
  announcement: '',

  get preferences() {
    const s = get();
    return {
      fontSize: s.fontSize,
      contrastMode: s.contrastMode,
      dyslexicFont: s.dyslexicFont,
      reducedMotion: s.reducedMotion,
      increasedSpacing: s.increasedSpacing,
      simplifiedVisual: s.simplifiedVisual,
      largeTouchTargets: s.largeTouchTargets,
      instructionStyle: s.instructionStyle,
      soundEnabled: s.soundEnabled,
      simplified_content: s.simplifiedVisual,
      audio_enabled: s.soundEnabled,
      font_size: s.fontSize,
    };
  },

  get simplified_content() {
    return get().simplifiedVisual;
  },
  get audio_enabled() {
    return get().soundEnabled;
  },
  get font_size() {
    return get().fontSize;
  },

  setFontSize: (fontSizeInput) => {
    let fontSize: 'normal' | 'large' | 'xlarge' = 'normal';
    if (fontSizeInput === 'large') fontSize = 'large';
    if (fontSizeInput === 'xlarge' || fontSizeInput === 'x-large') fontSize = 'xlarge';

    set({ fontSize });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  setContrastMode: (contrastMode) => {
    set({ contrastMode });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  setInstructionStyle: (instructionStyle) => {
    set({ instructionStyle });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
  },

  toggleDyslexicFont: () => {
    const dyslexicFont = !get().dyslexicFont;
    set({ dyslexicFont });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  toggleReducedMotion: () => {
    const reducedMotion = !get().reducedMotion;
    set({ reducedMotion });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  toggleIncreasedSpacing: () => {
    const increasedSpacing = !get().increasedSpacing;
    set({ increasedSpacing });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  toggleSimplifiedVisual: () => {
    const simplifiedVisual = !get().simplifiedVisual;
    set({ simplifiedVisual });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  toggleSimplifiedContent: () => {
    get().toggleSimplifiedVisual();
  },

  toggleLargeTouchTargets: () => {
    const largeTouchTargets = !get().largeTouchTargets;
    set({ largeTouchTargets });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
    applyDomClasses(updated);
  },

  toggleSound: () => {
    const soundEnabled = !get().soundEnabled;
    set({ soundEnabled });
    const state = get();
    const updated: AccessibilityPreferences = {
      fontSize: state.fontSize,
      contrastMode: state.contrastMode,
      dyslexicFont: state.dyslexicFont,
      reducedMotion: state.reducedMotion,
      increasedSpacing: state.increasedSpacing,
      simplifiedVisual: state.simplifiedVisual,
      largeTouchTargets: state.largeTouchTargets,
      instructionStyle: state.instructionStyle,
      soundEnabled: state.soundEnabled,
    };
    setStorageItem(STORAGE_KEY, updated);
  },

  toggleAudio: () => {
    get().toggleSound();
  },

  announce: (announcement) => {
    set({ announcement });
  },

  resetSettings: () => {
    set({
      ...DEFAULT_PREFERENCES,
      announcement: 'Accessibility settings reset to default',
    });
    setStorageItem(STORAGE_KEY, DEFAULT_PREFERENCES);
    applyDomClasses(DEFAULT_PREFERENCES);
  },

  initializeFromStorage: () => {
    const saved = getStorageItem<AccessibilityPreferences>(STORAGE_KEY, DEFAULT_PREFERENCES);
    set(saved);
    applyDomClasses(saved);
  },
}));

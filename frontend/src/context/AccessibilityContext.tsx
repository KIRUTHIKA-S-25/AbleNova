'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityProfile } from '@/types';

interface AccessibilityContextType {
  profile: AccessibilityProfile;
  toggleHighContrast: () => void;
  setTextScale: (scale: 'normal' | 'large' | 'xlarge') => void;
  toggleFontFamily: () => void;
  toggleSimplifiedContent: () => void;
  toggleAudioEnabled: () => void;
  toggleCaptionsEnabled: () => void;
  toggleReducedMotion: () => void;
  toggleKeyboardNav: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  announcement: string;
  announce: (message: string) => void;
}

const defaultProfile: AccessibilityProfile = {
  text_enabled: true,
  audio_enabled: true,
  captions_enabled: true,
  simplified_content: false,
  large_text: false,
  high_contrast: false,
  reduced_motion: false,
  keyboard_navigation: true,
  text_scale: 'normal',
  font_family: 'default',
  auto_tts: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AccessibilityProfile>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ablenova_accessibility');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Ignore json parse error
        }
      }
    }
    return defaultProfile;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string) => {
    setAnnouncement(message);
  };

  // Sync class state to document element whenever profile changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // High Contrast
    if (profile.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Text Scale
    root.classList.remove('text-large', 'text-xlarge');
    if (profile.text_scale === 'large') {
      root.classList.add('text-large');
    } else if (profile.text_scale === 'xlarge') {
      root.classList.add('text-xlarge');
    }

    // Dyslexic font
    if (profile.font_family === 'dyslexic') {
      root.classList.add('font-dyslexic');
    } else {
      root.classList.remove('font-dyslexic');
    }

    // Reduced Motion
    if (profile.reduced_motion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    localStorage.setItem('ablenova_accessibility', JSON.stringify(profile));
  }, [profile]);

  const toggleHighContrast = () => {
    setProfile((prev) => {
      const next = !prev.high_contrast;
      announce(next ? 'High contrast mode enabled' : 'High contrast mode disabled');
      return { ...prev, high_contrast: next };
    });
  };

  const setTextScale = (scale: 'normal' | 'large' | 'xlarge') => {
    setProfile((prev) => {
      announce(`Text size set to ${scale}`);
      return {
        ...prev,
        text_scale: scale,
        large_text: scale !== 'normal',
      };
    });
  };

  const toggleFontFamily = () => {
    setProfile((prev) => {
      const nextFont = prev.font_family === 'dyslexic' ? 'default' : 'dyslexic';
      announce(nextFont === 'dyslexic' ? 'Dyslexia-friendly font enabled' : 'Standard font enabled');
      return { ...prev, font_family: nextFont };
    });
  };

  const toggleSimplifiedContent = () => {
    setProfile((prev) => {
      const next = !prev.simplified_content;
      announce(next ? 'Simplified content mode enabled' : 'Standard content mode enabled');
      return { ...prev, simplified_content: next };
    });
  };

  const toggleAudioEnabled = () => {
    setProfile((prev) => {
      const next = !prev.audio_enabled;
      announce(next ? 'Audio assistance enabled' : 'Audio assistance disabled');
      return { ...prev, audio_enabled: next };
    });
  };

  const toggleCaptionsEnabled = () => {
    setProfile((prev) => {
      const next = !prev.captions_enabled;
      announce(next ? 'Captions enabled' : 'Captions disabled');
      return { ...prev, captions_enabled: next };
    });
  };

  const toggleReducedMotion = () => {
    setProfile((prev) => {
      const next = !prev.reduced_motion;
      announce(next ? 'Reduced motion enabled' : 'Standard motion enabled');
      return { ...prev, reduced_motion: next };
    });
  };

  const toggleKeyboardNav = () => {
    setProfile((prev) => ({ ...prev, keyboard_navigation: !prev.keyboard_navigation }));
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      announce('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower pace for clarity
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    announce(`Reading aloud: ${text.slice(0, 40)}...`);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      announce('Audio stopped');
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        profile,
        toggleHighContrast,
        setTextScale,
        toggleFontFamily,
        toggleSimplifiedContent,
        toggleAudioEnabled,
        toggleCaptionsEnabled,
        toggleReducedMotion,
        toggleKeyboardNav,
        speakText,
        stopSpeaking,
        isSpeaking,
        announcement,
        announce,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

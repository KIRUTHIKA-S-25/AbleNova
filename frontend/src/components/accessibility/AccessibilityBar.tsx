'use client';

import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Button } from '@/components/ui/Button';
import {
  Sun,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const {
    profile,
    toggleHighContrast,
    setTextScale,
    toggleFontFamily,
    toggleSimplifiedContent,
    toggleAudioEnabled,
    speakText,
    stopSpeaking,
    isSpeaking,
  } = useAccessibility();

  return (
    <aside
      aria-label="Quick Accessibility Controls"
      className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border-2 border-slate-700 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <div className="flex items-center gap-2 font-bold text-yellow-400">
        <Sparkles className="w-5 h-5" />
        <span>Accessibility Quick Controls</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* High Contrast Toggle */}
        <Button
          variant={profile.high_contrast ? 'accent' : 'secondary'}
          size="normal"
          onClick={toggleHighContrast}
          ariaLabel="Toggle High Contrast Mode"
          className="flex items-center gap-2 text-xs py-2 px-3 min-h-[40px]"
        >
          <Sun className="w-4 h-4" />
          <span>{profile.high_contrast ? 'Contrast: High' : 'Contrast: Normal'}</span>
        </Button>

        {/* Text Sizing Controls */}
        <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
          <Button
            variant={profile.text_scale === 'normal' ? 'primary' : 'ghost'}
            size="normal"
            onClick={() => setTextScale('normal')}
            ariaLabel="Normal Text Size"
            className="py-1 px-3 min-h-[36px] text-xs text-white"
          >
            A
          </Button>
          <Button
            variant={profile.text_scale === 'large' ? 'primary' : 'ghost'}
            size="normal"
            onClick={() => setTextScale('large')}
            ariaLabel="Large Text Size"
            className="py-1 px-3 min-h-[36px] text-sm text-white font-bold"
          >
            A+
          </Button>
          <Button
            variant={profile.text_scale === 'xlarge' ? 'primary' : 'ghost'}
            size="normal"
            onClick={() => setTextScale('xlarge')}
            ariaLabel="Extra Large Text Size"
            className="py-1 px-3 min-h-[36px] text-base text-white font-extrabold"
          >
            A++
          </Button>
        </div>

        {/* Dyslexia Font Toggle */}
        <Button
          variant={profile.font_family === 'dyslexic' ? 'accent' : 'secondary'}
          size="normal"
          onClick={toggleFontFamily}
          ariaLabel="Toggle Dyslexia-Friendly Font"
          className="flex items-center gap-2 text-xs py-2 px-3 min-h-[40px]"
        >
          <Type className="w-4 h-4" />
          <span>{profile.font_family === 'dyslexic' ? 'Font: OpenDyslexic' : 'Font: Standard'}</span>
        </Button>

        {/* Simplified Language Mode Toggle */}
        <Button
          variant={profile.simplified_content ? 'accent' : 'secondary'}
          size="normal"
          onClick={toggleSimplifiedContent}
          ariaLabel="Toggle Simplified Reading Mode"
          className="flex items-center gap-2 text-xs py-2 px-3 min-h-[40px]"
        >
          <Eye className="w-4 h-4" />
          <span>{profile.simplified_content ? 'Simple View: ON' : 'Simple View: OFF'}</span>
        </Button>

        {/* Audio Assistance Toggle / Reader */}
        <Button
          variant={profile.audio_enabled ? 'primary' : 'secondary'}
          size="normal"
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
            } else {
              speakText('Welcome to AbleNova. AI-powered accessible learning for all children.');
            }
            toggleAudioEnabled();
          }}
          ariaLabel="Read screen summary aloud"
          className="flex items-center gap-2 text-xs py-2 px-3 min-h-[40px]"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isSpeaking ? 'Stop Audio' : 'Listen Aloud'}</span>
        </Button>
      </div>
    </aside>
  );
};

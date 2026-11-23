// src/features/quiz/components/QuizAudioReader.tsx

'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Volume2, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuizAudioReaderProps {
  textToRead: string;
  label?: string;
  soundEnabled?: boolean;
  className?: string;
}

const emptySubscribe = () => () => {};
const getClientSpeechSnapshot = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;
const getServerSpeechSnapshot = () => false;

export const QuizAudioReader: React.FC<QuizAudioReaderProps> = ({
  textToRead,
  label = 'Listen',
  soundEnabled = true,
  className,
}) => {
  const supported = useSyncExternalStore(
    emptySubscribe,
    getClientSpeechSnapshot,
    getServerSpeechSnapshot
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!supported || !soundEnabled) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRestart = () => {
    if (!supported || !soundEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (!supported || !soundEnabled) {
    return null;
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? 'Pause audio narration' : `Read question aloud: ${label}`}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1',
          isPlaying
            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 shadow-sm'
            : 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs'
        )}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span>{label}</span>
          </>
        )}
      </button>

      {isPlaying && (
        <button
          type="button"
          onClick={handleRestart}
          aria-label="Replay from start"
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white hover:bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

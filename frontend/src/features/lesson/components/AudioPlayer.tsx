'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AudioPlayerProps {
  text: string;
  label?: string;
  soundEnabled?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

const emptySubscribe = () => () => {};
const getClientSpeechSnapshot = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
const getServerSpeechSnapshot = () => false;

function useSpeechSynthesis() {
  const supported = useSyncExternalStore(
    emptySubscribe,
    getClientSpeechSnapshot,
    getServerSpeechSnapshot
  );
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setSpeaking(false);
  };

  const resume = () => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setSpeaking(true);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { supported, speaking, speak, pause, resume, stop };
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  label = 'Listen to this section',
  soundEnabled = true,
  reducedMotion = false,
  className,
}) => {
  const { supported, speaking, speak, pause, stop } = useSpeechSynthesis();
  const [showTranscript, setShowTranscript] = useState(false);
  const [muted, setMuted] = useState(!soundEnabled);

  const handlePlay = () => {
    if (!muted) speak(text);
  };

  const handlePause = () => pause();
  const handleReplay = () => { stop(); if (!muted) speak(text); };

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3',
        className
      )}
      role="region"
      aria-label={label}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-cyan-600 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={speaking ? handlePause : handlePlay}
          disabled={!supported || muted}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            'bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
            !reducedMotion && 'active:scale-95'
          )}
          aria-label={speaking ? 'Pause audio' : 'Play audio'}
          aria-pressed={speaking}
        >
          {speaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {speaking ? 'Pause' : 'Play'}
        </button>

        {/* Replay */}
        <button
          onClick={handleReplay}
          disabled={!supported || muted}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold',
            'text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
          )}
          aria-label="Replay audio"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </button>

        {/* Mute */}
        <button
          onClick={() => { setMuted(!muted); if (!muted) stop(); }}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold',
            'text-slate-600 hover:bg-slate-200 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
          )}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          aria-pressed={muted}
        >
          {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Fallback message */}
      {!supported && (
        <p className="text-xs text-slate-500 italic">
          Audio is not available in this browser. Please read the text below.
        </p>
      )}

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="inline-flex items-center gap-1 text-xs text-cyan-600 font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
        aria-expanded={showTranscript}
        aria-controls="audio-transcript"
      >
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform', showTranscript && 'rotate-180')}
        />
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>

      {showTranscript && (
        <div
          id="audio-transcript"
          className="text-sm text-slate-700 bg-white rounded-lg border border-slate-200 p-3 leading-relaxed"
          aria-live="polite"
        >
          {text}
        </div>
      )}
    </div>
  );
};

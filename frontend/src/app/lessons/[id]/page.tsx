'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Type,
  BookOpen,
  FileText,
} from 'lucide-react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import { MOCK_LESSONS } from '@/lib/mock';

export default function LessonPlayerPage() {
  const params = useParams();
  const lessonId = (params?.id as string) || 'lesson_001';
  const lesson = MOCK_LESSONS.find((l) => l.id === lessonId) || MOCK_LESSONS[0];

  const { preferences, toggleSimplifiedContent, toggleAudio, setFontSize } = useAccessibilityStore();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [completed, setCompleted] = useState(false);

  const activeContent = preferences.simplified_content ? lesson.content.simplified : lesson.content.standard;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(activeContent);
      utterance.rate = preferences.simplified_content ? 0.85 : 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppShell>
      <div className={`space-y-6 py-4 transition-all ${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/lessons">
            <Button size="medium" variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Lessons
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsFocusMode(!isFocusMode)}
              size="medium"
              variant={isFocusMode ? 'accent' : 'outline'}
              className="gap-2"
              aria-label="Toggle Focus Mode"
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
            </Button>
          </div>
        </div>

        {/* Accessibility Toolbar for Lesson */}
        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Standard vs Simplified Toggle */}
            <button
              onClick={() => toggleSimplifiedContent()}
              className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                preferences.simplified_content
                  ? 'bg-teal-600 text-white dark:bg-yellow-400 dark:text-black shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>{preferences.simplified_content ? 'Simplified Text (Active)' : 'Standard Text Mode'}</span>
            </button>

            {/* Read Aloud TTS */}
            <button
              onClick={handleSpeak}
              className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
              <span>{isPlayingAudio ? 'Pause Narration' : 'Read Aloud'}</span>
            </button>
          </div>

          {/* Font Size Adjusters */}
          <div className="flex items-center gap-2 text-sm font-bold">
            <Type className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="text-slate-600 dark:text-slate-400">Text Size:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-3 py-1 rounded-lg border ${
                preferences.font_size === 'normal'
                  ? 'bg-teal-600 text-white font-black'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-3 py-1 rounded-lg border text-base ${
                preferences.font_size === 'large'
                  ? 'bg-teal-600 text-white font-black'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              Large
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-3 py-1 rounded-lg border text-lg ${
                preferences.font_size === 'xlarge'
                  ? 'bg-teal-600 text-white font-black'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              XL
            </button>
          </div>
        </div>

        {/* Main Lesson Content Card */}
        <Card className="p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-8 bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{lesson.difficulty.toUpperCase()}</Badge>
              <Badge variant="secondary">Mathematics Domain</Badge>
              {completed && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {lesson.title}
            </h1>
          </div>

          {/* Visual Concept Helper Graphic */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-teal-400/30 flex items-center justify-center text-center">
            <div className="space-y-3">
              <div className="text-6xl font-black tracking-widest text-teal-600 dark:text-yellow-400">
                1 / 2 = 🍕
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Visual Concept: 1 whole pizza divided into 2 equal slice halves.
              </p>
            </div>
          </div>

          {/* Lesson Main Text */}
          <div
            className={`prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 leading-relaxed space-y-4 ${
              preferences.font_size === 'large'
                ? 'text-xl'
                : preferences.font_size === 'xlarge'
                ? 'text-2xl'
                : 'text-lg'
            }`}
          >
            <p className="font-medium">{activeContent}</p>
            <p>
              When we share things equally, we use fractions. If you have 1 apple and share it with 1 friend, each person gets 1 out of 2 equal parts. We write this as <strong>1/2</strong>!
            </p>
            <p>
              The top number is called the <strong>numerator</strong> (how many parts you have), and the bottom number is called the <strong>denominator</strong> (how many equal parts total).
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              onClick={() => setCompleted(true)}
              size="large"
              variant={completed ? 'success' : 'primary'}
              className="gap-2 w-full sm:w-auto"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>{completed ? 'Lesson Marked Complete!' : 'Mark as Complete'}</span>
            </Button>

            <Link href="/quizzes/quiz_001" className="w-full sm:w-auto">
              <Button size="large" variant="accent" className="gap-2 w-full sm:w-auto glow-mint">
                <HelpCircle className="w-5 h-5" aria-hidden="true" />
                <span>Take Practice Quiz Now &rarr;</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <AiCompanionModal />
    </AppShell>
  );
}

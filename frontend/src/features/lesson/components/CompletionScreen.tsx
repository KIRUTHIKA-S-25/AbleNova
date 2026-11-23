'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, BookOpen, RotateCcw, Map, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface CompletionScreenProps {
  lessonTitle: string;
  activitiesCompleted: number;
  durationMinutes: number;
  courseId?: string;
  lessonId?: string;
  onReview: () => void;
  className?: string;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  lessonTitle,
  activitiesCompleted,
  durationMinutes,
  courseId,
  lessonId,
  onReview,
  className,
}) => {
  return (
    <main
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-8 py-16 px-4',
        className
      )}
      aria-label="Lesson completed"
    >
      {/* Illustration */}
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-xs bg-[#D9FAF2] border-2 border-[#A3EAD2]"
        aria-hidden="true"
      >
        ✨
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Lesson Complete!
        </h1>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          You&apos;ve finished <span className="font-bold text-[#044E3A]">{lessonTitle}</span>.
          Excellent work! 🎉
        </p>
      </div>

      {/* Stats card */}
      <div
        className="w-full max-w-sm rounded-3xl border border-[#ECE9E4] bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xs p-6 space-y-4 text-left"
      >
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Your Results
        </h2>
        <ul className="space-y-3">
          {[
            {
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
              label: 'Lesson completed',
              value: '✓',
            },
            {
              icon: <BookOpen className="w-5 h-5 text-cyan-500" />,
              label: 'Time spent',
              value: `${durationMinutes} min`,
            },
            {
              icon: <CheckCircle className="w-5 h-5 text-violet-500" />,
              label: 'Activities completed',
              value: `${activitiesCompleted}`,
            },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-slate-700 font-medium">{item.label}</span>
              <span className="font-bold text-slate-900">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Encouragement */}
      <p className="text-slate-500 text-sm max-w-xs">
        You&apos;re making great progress! Keep going — each lesson brings you closer to your goals.
      </p>

      {/* Actions */}
      <div className="space-y-3 w-full max-w-sm">
        {courseId && lessonId && (
          <Link href={`/learn/${courseId}/${lessonId}/quiz`} className="w-full block">
            <Button
              variant="accent"
              size="large"
              className="w-full glow-mint gap-2"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>Take Practice Quiz</span>
            </Button>
          </Link>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/student" className="flex-1">
            <Button
              variant="primary"
              size="large"
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #818cf8)',
                border: 'none',
              }}
            >
              <Map className="w-5 h-5" aria-hidden="true" />
              Continue Learning
            </Button>
          </Link>
          <Button
            variant="outline"
            size="large"
            onClick={onReview}
            className="flex-1"
            aria-label="Review this lesson from the beginning"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Review Lesson
          </Button>
        </div>
      </div>

      <Link
        href="/student"
        className="text-sm text-slate-500 hover:text-cyan-600 font-medium transition-colors underline-offset-2 hover:underline"
      >
        ← Back to Learning Path
      </Link>
    </main>
  );
};

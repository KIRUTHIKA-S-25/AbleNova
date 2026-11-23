// src/features/quiz/components/QuizStates.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const QuizLoadingSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading quiz practice..."
      className="max-w-3xl mx-auto space-y-6 py-8 px-4 animate-pulse"
    >
      {/* Header bar skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />

      {/* Question card skeleton */}
      <div className="p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-md" />

        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const QuizErrorState: React.FC<{
  onRetry: () => void;
  courseId: string;
  lessonId: string;
}> = ({ onRetry, courseId, lessonId }) => {
  return (
    <main
      aria-labelledby="quiz-error-heading"
      className="max-w-md mx-auto py-16 px-4 text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1
          id="quiz-error-heading"
          className="text-2xl font-black text-slate-900 dark:text-white"
        >
          We couldn’t load this practice quiz
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please check your connection or try loading the practice again.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          type="button"
          onClick={onRetry}
          variant="primary"
          size="medium"
          className="rounded-2xl gap-2 glow-mint"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>

        <Link href={`/learn/${courseId}/${lessonId}`}>
          <Button
            type="button"
            variant="outline"
            size="medium"
            className="rounded-2xl gap-2 w-full sm:w-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Return to Lesson</span>
          </Button>
        </Link>
      </div>
    </main>
  );
};

export const QuizEmptyState: React.FC<{
  courseId: string;
  lessonId: string;
}> = ({ courseId, lessonId }) => {
  return (
    <main
      aria-labelledby="quiz-empty-heading"
      className="max-w-md mx-auto py-16 px-4 text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-3xl">
        📝
      </div>

      <div className="space-y-2">
        <h1
          id="quiz-empty-heading"
          className="text-2xl font-black text-slate-900 dark:text-white"
        >
          No questions available yet
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This lesson does not have practice questions right now. Check back soon!
        </p>
      </div>

      <Link href={`/learn/${courseId}/${lessonId}`}>
        <Button
          type="button"
          variant="primary"
          size="medium"
          className="rounded-2xl gap-2 glow-mint"
        >
          <BookOpen className="w-4 h-4" />
          <span>Return to Lesson</span>
        </Button>
      </Link>
    </main>
  );
};

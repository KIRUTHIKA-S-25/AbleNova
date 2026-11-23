// src/features/quiz/components/QuizHeader.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { QuizProgressBar } from './QuizProgressBar';

interface QuizHeaderProps {
  quizTitle: string;
  courseId: string;
  lessonId: string;
  currentQuestion: number;
  totalQuestions: number;
  onExit?: () => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  quizTitle,
  courseId,
  lessonId,
  currentQuestion,
  totalQuestions,
}) => {
  return (
    <header className="space-y-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
      {/* Top bar: Back link + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/learn/${courseId}/${lessonId}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg w-fit"
          aria-label="Back to lesson"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Exit Practice to Lesson</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <BookOpen className="w-4 h-4 text-cyan-500 flex-shrink-0" aria-hidden="true" />
          <span className="truncate max-w-xs">{quizTitle}</span>
        </div>
      </div>

      {/* Progress bar */}
      <QuizProgressBar current={currentQuestion} total={totalQuestions} />
    </header>
  );
};

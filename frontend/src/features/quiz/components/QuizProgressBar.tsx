// src/features/quiz/components/QuizProgressBar.tsx

'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface QuizProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
}

export const QuizProgressBar: React.FC<QuizProgressBarProps> = ({
  current,
  total,
  className,
  showText = true,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {showText && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <span>
            Question {current} of {total}
          </span>
          <span>{percentage}% Completed</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Quiz progress: ${percentage}%`}
        className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60"
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #6366f1 100%)',
          }}
        />
      </div>
    </div>
  );
};

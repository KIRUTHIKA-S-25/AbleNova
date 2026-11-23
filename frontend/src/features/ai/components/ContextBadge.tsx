'use client';

import React from 'react';
import { AIContext } from '../types/ai';

interface ContextBadgeProps {
  context?: AIContext;
}

export const ContextBadge: React.FC<ContextBadgeProps> = ({ context }) => {
  if (!context || (!context.courseName && !context.lessonTitle && !context.topicName)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
      <span>
        Learning focus:{' '}
        <strong className="text-emerald-900 dark:text-emerald-200">
          {context.courseName || context.topicName}
          {context.lessonTitle ? ` → ${context.lessonTitle}` : ''}
        </strong>
      </span>
    </div>
  );
};

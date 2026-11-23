// src/features/quiz/components/questions/ShortAnswerQuestion.tsx

'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QuizQuestion, UserQuizAnswer } from '../../types/quiz';

interface ShortAnswerQuestionProps {
  question: QuizQuestion;
  answer?: UserQuizAnswer;
  onChangeText: (text: string) => void;
  largeTouchTargets?: boolean;
  highContrast?: boolean;
}

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({
  question,
  answer,
  onChangeText,
  largeTouchTargets = false,
  highContrast = false,
}) => {
  const currentText = answer?.textAnswer || '';
  const inputId = `short-answer-${question.id}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300 px-1">
        <label
          htmlFor={inputId}
          className="font-bold flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300"
        >
          <Edit3 className="w-4 h-4" aria-hidden="true" />
          <span>Type your answer in the box below:</span>
        </label>
        <span className="text-xs text-slate-400">
          {currentText.length > 0 ? `${currentText.length} characters` : 'Not answered yet'}
        </span>
      </div>

      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={currentText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="e.g. print"
          autoComplete="off"
          spellCheck="false"
          aria-describedby={`${inputId}-hint`}
          className={cn(
            'w-full rounded-2xl border-2 font-mono transition-all',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:border-cyan-500',
            largeTouchTargets
              ? 'p-5 text-xl sm:text-2xl min-h-[64px]'
              : 'p-4 text-lg sm:text-xl min-h-[56px]',
            highContrast
              ? 'border-slate-400 bg-black text-white placeholder:text-slate-500'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs'
          )}
        />
      </div>

      <p
        id={`${inputId}-hint`}
        className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 px-1"
      >
        <span>💡</span>
        <span>Spelling counts, but capitalization (uppercase/lowercase) does not matter.</span>
      </p>
    </div>
  );
};

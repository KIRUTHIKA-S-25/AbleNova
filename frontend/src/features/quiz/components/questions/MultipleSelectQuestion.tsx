// src/features/quiz/components/questions/MultipleSelectQuestion.tsx

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QuizQuestion, UserQuizAnswer } from '../../types/quiz';

interface MultipleSelectQuestionProps {
  question: QuizQuestion;
  answer?: UserQuizAnswer;
  onToggleOption: (optionId: string) => void;
  largeTouchTargets?: boolean;
  highContrast?: boolean;
}

export const MultipleSelectQuestion: React.FC<MultipleSelectQuestionProps> = ({
  question,
  answer,
  onToggleOption,
  largeTouchTargets = false,
  highContrast = false,
}) => {
  const selectedOptionIds = answer?.selectedOptionIds || [];

  return (
    <div className="space-y-4">
      {/* Instructional helper callout */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 px-1">
        <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-bold">
          <span>ℹ️</span> Choose all answers that apply
        </span>
        <span>
          {selectedOptionIds.length} option{selectedOptionIds.length === 1 ? '' : 's'} selected
        </span>
      </div>

      <div
        role="group"
        aria-label={question.question}
        className="space-y-3"
      >
        {question.options?.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggleOption(option.id)}
              className={cn(
                'w-full text-left rounded-2xl border-2 transition-all flex items-center justify-between gap-4',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:border-cyan-500',
                largeTouchTargets ? 'p-5 min-h-[64px]' : 'p-4 min-h-[56px]',
                isSelected
                  ? highContrast
                    ? 'border-cyan-400 bg-cyan-950 text-white font-bold'
                    : 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : highContrast
                  ? 'border-slate-700 bg-black text-white hover:border-slate-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-slate-50/60'
              )}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Square Checkbox Indicator */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected
                      ? 'border-cyan-600 bg-cyan-600 dark:border-cyan-400 dark:bg-cyan-400 text-white dark:text-slate-950'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                {/* Option label badge */}
                {option.label && (
                  <span
                    className={cn(
                      'w-6 h-6 rounded-md flex items-center justify-center text-xs font-black uppercase flex-shrink-0 select-none',
                      isSelected
                        ? 'bg-cyan-200 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}
                    aria-hidden="true"
                  >
                    {option.label}
                  </span>
                )}

                <span className="text-base sm:text-lg leading-relaxed break-words">
                  {option.text}
                </span>
              </div>

              {/* Visual Selected Badge */}
              <span
                className={cn(
                  'text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 select-none',
                  isSelected
                    ? 'bg-cyan-600 text-white dark:bg-cyan-400 dark:text-slate-950'
                    : 'opacity-0'
                )}
                aria-hidden={!isSelected}
              >
                Checked
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

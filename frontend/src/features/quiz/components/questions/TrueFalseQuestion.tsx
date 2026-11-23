// src/features/quiz/components/questions/TrueFalseQuestion.tsx

'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QuizQuestion, UserQuizAnswer } from '../../types/quiz';

interface TrueFalseQuestionProps {
  question: QuizQuestion;
  answer?: UserQuizAnswer;
  onSelectOption: (optionId: string) => void;
  largeTouchTargets?: boolean;
  highContrast?: boolean;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  answer,
  onSelectOption,
  largeTouchTargets = false,
  highContrast = false,
}) => {
  const selectedOptionId = answer?.selectedOptionId;

  const options = question.options || [
    { id: 'tf_true', label: 'T', text: 'True' },
    { id: 'tf_false', label: 'F', text: 'False' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={question.question}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const isTrueOption = option.text.toLowerCase().includes('true');

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectOption(option.id)}
            className={cn(
              'w-full text-left rounded-2xl border-2 transition-all flex items-center justify-between gap-4',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:border-cyan-500',
              largeTouchTargets ? 'p-6 min-h-[80px]' : 'p-5 min-h-[68px]',
              isSelected
                ? highContrast
                  ? 'border-cyan-400 bg-cyan-950 text-white font-black'
                  : 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-xs font-bold'
                : highContrast
                ? 'border-slate-700 bg-black text-white hover:border-slate-400'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-slate-50/60'
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors',
                  isSelected
                    ? isTrueOption
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-indigo-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                )}
                aria-hidden="true"
              >
                {isTrueOption ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <X className="w-5 h-5 stroke-[3]" />
                )}
              </div>

              <div>
                <span className="text-xl sm:text-2xl font-black block">
                  {option.text}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isTrueOption ? 'Statement is accurate' : 'Statement is incorrect'}
                </span>
              </div>
            </div>

            {/* Visual Selected Badge */}
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'border-cyan-600 bg-cyan-600 dark:border-cyan-400 dark:bg-cyan-400'
                  : 'border-slate-300 dark:border-slate-600'
              )}
              aria-hidden="true"
            >
              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-950" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

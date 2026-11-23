// src/features/quiz/components/QuestionNavigator.tsx

'use client';

import React from 'react';
import { Bookmark, Check, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QuizQuestion, UserQuizAnswer } from '../types/quiz';

interface QuestionNavigatorProps {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, UserQuizAnswer>;
  markedForReview: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

function isAnswered(question: QuizQuestion, answer?: UserQuizAnswer): boolean {
  if (!answer) return false;
  if (question.type === 'multiple_choice' || question.type === 'true_false') {
    return Boolean(answer.selectedOptionId);
  }
  if (question.type === 'multiple_select') {
    return Boolean(answer.selectedOptionIds && answer.selectedOptionIds.length > 0);
  }
  if (question.type === 'short_answer') {
    return Boolean(answer.textAnswer && answer.textAnswer.trim().length > 0);
  }
  return false;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onSelectQuestion,
  className,
}) => {
  return (
    <aside
      aria-label="Question overview list"
      className={cn(
        'rounded-3xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Question List
        </h3>
        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
          {Object.values(answers).filter((a) => a && (a.selectedOptionId || (a.selectedOptionIds && a.selectedOptionIds.length > 0) || (a.textAnswer && a.textAnswer.trim()))).length} / {questions.length} Answered
        </span>
      </div>

      {/* Grid of question button pills */}
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const answered = isAnswered(q, answers[q.id]);
          const flagged = Boolean(markedForReview[q.id]);

          let statusLabel = 'Unanswered';
          if (flagged && answered) statusLabel = 'Answered, Marked for review';
          else if (flagged) statusLabel = 'Unanswered, Marked for review';
          else if (answered) statusLabel = 'Answered';

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Question ${idx + 1}: ${statusLabel}`}
              className={cn(
                'relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all font-mono',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                isCurrent
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 shadow-xs ring-2 ring-cyan-400/50'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
              )}
            >
              <span
                className={cn(
                  'text-sm font-black',
                  isCurrent
                    ? 'text-cyan-900 dark:text-cyan-200'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                {idx + 1}
              </span>

              {/* Status Indicator Icon */}
              <div className="mt-1 flex items-center gap-0.5 text-xs">
                {flagged ? (
                  <Bookmark
                    className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
                    aria-hidden="true"
                  />
                ) : answered ? (
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]"
                    aria-hidden="true"
                  />
                ) : (
                  <Minus className="w-3 h-3 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
            ✓
          </span>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
            ⚑
          </span>
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">
            —
          </span>
          <span>Not answered yet</span>
        </div>
      </div>
    </aside>
  );
};

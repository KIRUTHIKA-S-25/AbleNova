// src/features/quiz/components/ReviewPanel.tsx

'use client';

import React from 'react';
import { Bookmark, Check, Minus, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { QuizQuestion, UserQuizAnswer } from '../types/quiz';

interface ReviewPanelProps {
  questions: QuizQuestion[];
  answers: Record<string, UserQuizAnswer>;
  markedForReview: Record<string, boolean>;
  onJumpToQuestion: (index: number) => void;
  onBackToActive: () => void;
  onRequestSubmit: () => void;
  largeTouchTargets?: boolean;
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

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  questions,
  answers,
  markedForReview,
  onJumpToQuestion,
  onBackToActive,
  onRequestSubmit,
  largeTouchTargets = false,
}) => {
  const total = questions.length;
  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;
  const unansweredCount = total - answeredCount;
  const flaggedCount = Object.values(markedForReview).filter(Boolean).length;

  return (
    <main
      aria-labelledby="review-panel-title"
      className="max-w-3xl mx-auto space-y-6 py-4 px-4"
    >
      {/* Title & Back bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToActive}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 py-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Questions</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Pre-Submission Review
        </span>
      </div>

      <div className="space-y-3">
        <h1
          id="review-panel-title"
          className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white"
        >
          Review Your Answers
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Check your answers before completing. You can click any question below to jump back and change your choice.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {answeredCount}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Answered
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 text-center">
          <span
            className={cn(
              'text-2xl font-black block',
              unansweredCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
            )}
          >
            {unansweredCount}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Unanswered
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 text-center">
          <span
            className={cn(
              'text-2xl font-black block',
              flaggedCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
            )}
          >
            {flaggedCount}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Marked ⚑
          </span>
        </div>
      </div>

      {/* Unanswered gentle callout if any */}
      {unansweredCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <span className="text-lg">ℹ️</span>
          <div>
            <p className="font-bold">You still have {unansweredCount} unanswered question{unansweredCount === 1 ? '' : 's'}.</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              You can jump to them now, or you can submit anyway whenever you feel ready.
            </p>
          </div>
        </div>
      )}

      {/* List of all questions */}
      <div className="rounded-3xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {questions.map((q, idx) => {
          const answered = isAnswered(q, answers[q.id]);
          const flagged = Boolean(markedForReview[q.id]);

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-black text-sm text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {q.topic}
                    </span>
                    {flagged && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        <Bookmark className="w-3 h-3 fill-current" />
                        Marked for review
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {q.question}
                  </p>
                </div>
              </div>

              {/* Status and Jump Button */}
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full',
                    answered
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {answered ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Answered</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3 h-3" />
                      <span>Unanswered</span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => onJumpToQuestion(idx)}
                  className="text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline px-2 py-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  Edit choice &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          onClick={onBackToActive}
          variant="outline"
          size={largeTouchTargets ? 'large' : 'medium'}
          className="w-full sm:w-auto gap-2 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Keep Working on Questions</span>
        </Button>

        <Button
          type="button"
          onClick={onRequestSubmit}
          variant="accent"
          size={largeTouchTargets ? 'large' : 'medium'}
          className="w-full sm:w-auto gap-2 rounded-2xl glow-mint"
        >
          <Send className="w-4 h-4" />
          <span>Finish & Submit Practice</span>
        </Button>
      </div>
    </main>
  );
};

// src/features/quiz/components/AnswerReview.tsx

'use client';

import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { QuestionEvaluation } from '../types/quiz';

interface AnswerReviewProps {
  evaluations: QuestionEvaluation[];
  onBackToResult: () => void;
  largeTouchTargets?: boolean;
}

export const AnswerReview: React.FC<AnswerReviewProps> = ({
  evaluations,
  onBackToResult,
  largeTouchTargets = false,
}) => {
  return (
    <main
      aria-labelledby="answer-review-title"
      className="max-w-3xl mx-auto space-y-6 py-6 px-4"
    >
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={onBackToResult}
          variant="outline"
          size={largeTouchTargets ? 'large' : 'medium'}
          className="gap-2 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Result Summary</span>
        </Button>

        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Answer Review ({evaluations.length} Questions)
        </span>
      </div>

      <div className="space-y-2">
        <h1
          id="answer-review-title"
          className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white"
        >
          Detailed Answer Review
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Learn from each question with clear explanations to master these concepts.
        </p>
      </div>

      {/* List of question reviews */}
      <div className="space-y-4">
        {evaluations.map((ev, index) => {
          const isCorrect = ev.isCorrect;
          const wasAnswered = ev.studentAnswerDisplay !== 'Not answered';

          return (
            <article
              key={ev.questionId}
              aria-labelledby={`review-q-${ev.questionId}`}
              className={cn(
                'rounded-3xl border-2 p-5 sm:p-7 space-y-5 transition-all',
                isCorrect
                  ? 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900'
                  : wasAnswered
                  ? 'border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              )}
            >
              {/* Question heading and status badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {ev.topic}
                  </span>
                </div>

                {/* Status chip with textual & visual indicators */}
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide select-none',
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : wasAnswered
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  )}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                      <span>Correct</span>
                    </>
                  ) : wasAnswered ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Review Needed</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Skipped</span>
                    </>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h2
                id={`review-q-${ev.questionId}`}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug"
              >
                {ev.questionText}
              </h2>

              {/* Answers Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {/* Student's answer */}
                <div
                  className={cn(
                    'p-3.5 rounded-2xl border space-y-1',
                    isCorrect
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                    Your Answer
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {ev.studentAnswerDisplay}
                  </p>
                </div>

                {/* Correct answer */}
                <div className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                    Correct Answer
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {ev.correctAnswerDisplay}
                  </p>
                </div>
              </div>

              {/* Explanation Callout */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/70 space-y-2 text-sm">
                <span className="font-black text-indigo-900 dark:text-indigo-200 flex items-center justify-between text-xs uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-400" />
                    Why this is correct:
                  </span>

                  {!isCorrect && (
                    <a
                      href="/ai-assistant"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] lowercase tracking-normal flex items-center gap-1 transition-colors"
                    >
                      🤖 Ask AI to explain mistake
                    </a>
                  )}
                </span>
                <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                  {ev.explanation}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom return button */}
      <div className="pt-4 flex justify-center">
        <Button
          type="button"
          onClick={onBackToResult}
          variant="primary"
          size="large"
          className="rounded-2xl gap-2 px-8 glow-mint"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Result Summary</span>
        </Button>
      </div>
    </main>
  );
};

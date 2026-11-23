// src/features/quiz/components/QuizResult.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  BookOpen,
  Sparkles,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { QuizEvaluationResult } from '../types/quiz';

interface QuizResultProps {
  quizTitle: string;
  courseId: string;
  lessonId: string;
  result: QuizEvaluationResult;
  onReviewAnswers: () => void;
  onRetry: () => void;
  largeTouchTargets?: boolean;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  quizTitle,
  courseId,
  lessonId,
  result,
  onReviewAnswers,
  onRetry,
  largeTouchTargets = false,
}) => {
  const {
    score,
    total,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    feedbackMessage,
    encouragement,
    topicBreakdown,
  } = result;

  return (
    <main
      aria-labelledby="quiz-result-heading"
      className="max-w-2xl mx-auto space-y-8 py-8 px-4 text-center"
    >
      {/* Decorative Celebration Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg mx-auto"
        style={{
          background: 'linear-gradient(135deg, #06b6d4, #818cf8)',
        }}
        aria-hidden="true"
      >
        {percentage >= 70 ? '🎉' : '🌱'}
      </div>

      {/* Main Heading & Score */}
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          {quizTitle}
        </p>
        <h1
          id="quiz-result-heading"
          className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white"
        >
          {feedbackMessage}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {encouragement}
        </p>
      </div>

      {/* Score Hero Card */}
      <div className="rounded-3xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* Big percentage */}
          <div className="space-y-1">
            <span className="text-5xl sm:text-6xl font-black text-cyan-600 dark:text-cyan-400">
              {percentage}%
            </span>
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Understanding Score
            </span>
          </div>

          {/* Correct count breakdown */}
          <div className="space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-8">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
              {score} / {total}
            </span>
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Questions Correct
            </span>
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-semibold">
          <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
            <span className="text-lg font-black">{correctCount}</span>
            <span>Correct</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
            <span className="text-lg font-black">{incorrectCount}</span>
            <span>To Review</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-lg font-black">{unansweredCount}</span>
            <span>Skipped</span>
          </div>
        </div>

        {/* Topic Breakdown */}
        {topicBreakdown.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Topic Breakdown
            </h2>
            <div className="space-y-2">
              {topicBreakdown.map((t) => (
                <div
                  key={t.topic}
                  className="flex items-center justify-between text-xs sm:text-sm"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {t.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-500 w-10 text-right">
                      {t.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          onClick={onReviewAnswers}
          variant="primary"
          size={largeTouchTargets ? 'large' : 'medium'}
          className="w-full text-base font-black py-4 rounded-2xl glow-mint flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          <span>Review Answers & Explanations</span>
        </Button>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={onRetry}
            variant="outline"
            size={largeTouchTargets ? 'large' : 'medium'}
            className="flex-1 rounded-2xl gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Quiz Again</span>
          </Button>

          <Link href={`/learn/${courseId}/${lessonId}`} className="flex-1">
            <Button
              type="button"
              variant="secondary"
              size={largeTouchTargets ? 'large' : 'medium'}
              className="w-full rounded-2xl gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Back to Lesson</span>
            </Button>
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/student"
            className="text-sm font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
          >
            <Map className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

// src/features/quiz/components/QuizIntro.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, HelpCircle, Sparkles, CheckCircle2, Play, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Quiz } from '../types/quiz';

interface QuizIntroProps {
  quiz: Quiz;
  onStart: () => void;
  hasExistingProgress?: boolean;
}

export const QuizIntro: React.FC<QuizIntroProps> = ({
  quiz,
  onStart,
  hasExistingProgress = false,
}) => {
  return (
    <main
      aria-labelledby="quiz-intro-title"
      className="max-w-2xl mx-auto space-y-8 py-8 px-4"
    >
      {/* Top back navigation */}
      <div>
        <Link
          href={`/learn/${quiz.courseId}/${quiz.lessonId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Lesson: {quiz.lessonTitle}</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="rounded-3xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 space-y-8 shadow-md">
        {/* Decorative Badge & Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span>Interactive Practice</span>
          </div>

          <h1
            id="quiz-intro-title"
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight"
          >
            {quiz.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Practice Stats Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block uppercase">
                Questions
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {quiz.questions.length} Items
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block uppercase">
                Suggested Time
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ~{quiz.estimatedMinutes} Mins
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block uppercase">
                Difficulty
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {quiz.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Friendly Instructions for Learners */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
            How this practice works:
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Read each question carefully and choose the answer you think is best.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>You can move back and forth between questions at your own pace.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Need help? Use the <strong>Listen</strong> button or open a friendly <strong>Hint</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>This is not a high-stress exam — it’s a tool to help you learn!</span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onStart}
            size="large"
            variant="primary"
            className="w-full text-base sm:text-lg font-black py-4 rounded-2xl glow-mint flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            <span>{hasExistingProgress ? 'Resume Practice' : 'Start Practice'}</span>
          </Button>
        </div>
      </div>
    </main>
  );
};

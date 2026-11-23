'use client';

import React from 'react';
import Link from 'next/link';
import { QuizPerformanceHistory, QuizTrendPoint } from '../types/progress';
import { PerformanceTrendChart } from './PerformanceTrendChart';

interface QuizPerformanceCardProps {
  history: QuizPerformanceHistory[];
  trend: QuizTrendPoint[];
}

export const QuizPerformanceCard: React.FC<QuizPerformanceCardProps> = ({ history, trend }) => {
  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, q) => acc + q.percentage, 0) / history.length)
    : 0;

  const maxScore = history.length > 0
    ? Math.max(...history.map(q => q.percentage))
    : 0;

  return (
    <section aria-labelledby="quiz-performance-heading" className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 id="quiz-performance-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Quiz Performance & History
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Review your quiz scores, retake attempts, and track accuracy improvement over time.
          </p>
        </div>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-300 font-extrabold text-xl">
            {avgScore}%
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Quiz Score</span>
            <span className="block text-lg font-extrabold text-slate-900 dark:text-white">
              {avgScore >= 75 ? 'Great Performance' : 'Consistent Practice'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-extrabold text-xl">
            {maxScore}%
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Highest Score</span>
            <span className="block text-lg font-extrabold text-slate-900 dark:text-white">Personal Best</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/70 flex items-center justify-center text-teal-600 dark:text-teal-300 font-extrabold text-xl">
            {history.length}
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Quizzes Done</span>
            <span className="block text-lg font-extrabold text-slate-900 dark:text-white">Modules Evaluated</span>
          </div>
        </div>
      </div>

      {/* Performance Trend SVG Chart Component */}
      <PerformanceTrendChart trendPoints={trend} />

      {/* Quiz History List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recent Quiz Results
        </h3>

        <div className="space-y-3">
          {history.map((item) => (
            <div 
              key={item.quizId}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {item.score} / {item.totalQuestions} Correct
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Completed {item.completedAt} • Attempt #{item.attemptCount}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {item.percentage}%
                </span>
                <Link
                  href={`/learn/${item.courseId}/${item.lessonId}/quiz`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-xs font-semibold transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                >
                  Retake Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

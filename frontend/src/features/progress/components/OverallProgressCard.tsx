'use client';

import React from 'react';
import { StudentProgressOverview } from '../types/progress';

interface OverallProgressCardProps {
  overview: StudentProgressOverview;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({ overview }) => {
  return (
    <section 
      aria-labelledby="overall-progress-heading" 
      className="bg-white dark:bg-slate-900 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 p-6 md:p-8 shadow-xs mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#ECE9E4] dark:border-slate-800">
        <div>
          <h2 id="overall-progress-heading" className="text-xl font-black text-slate-900 dark:text-white">
            Overall Learning Progress
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Your total completion across all enrolled courses and practice modules.
          </p>
        </div>

        <div className="flex items-baseline gap-2 bg-[#D9FAF2] dark:bg-emerald-950/40 px-5 py-3 rounded-2xl border border-[#A3EAD2] dark:border-emerald-800/40">
          <span className="text-3xl md:text-4xl font-black text-[#044E3A] dark:text-emerald-400">
            {overview.overallPercentage}%
          </span>
          <span className="text-sm font-bold text-[#044E3A] dark:text-emerald-300">
            Completed
          </span>
        </div>
      </div>

      {/* Accessible Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm font-medium mb-2">
          <span className="text-slate-700 dark:text-slate-300">Course Mastery Completion</span>
          <span className="text-slate-900 dark:text-white font-bold">{overview.overallPercentage}%</span>
        </div>
        <div 
          className="w-full h-4 bg-[#ECE9E4] dark:bg-slate-700 rounded-full overflow-hidden p-0.5 border border-[#ECE9E4] dark:border-slate-600"
          role="progressbar"
          aria-valuenow={overview.overallPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall course completion is ${overview.overallPercentage} percent`}
        >
          <div 
            className="h-full bg-[#044E3A] rounded-full transition-all duration-500"
            style={{ width: `${overview.overallPercentage}%` }}
          />
        </div>
        <p className="sr-only">
          {overview.overallPercentage} percent completed overall. {overview.completedLessons} of {overview.totalLessons} lessons completed.
        </p>
      </div>

      {/* Metrics breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Lessons Done
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {overview.completedLessons} <span className="text-sm font-medium text-slate-400">/ {overview.totalLessons}</span>
          </span>
          <span className="text-xs text-[#044E3A] dark:text-emerald-400 mt-1 block font-bold">
            ✓ 72% finished
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Quizzes Passed
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {overview.completedQuizzes} <span className="text-sm font-medium text-slate-400">/ {overview.totalQuizzes}</span>
          </span>
          <span className="text-xs text-[#1E40AF] dark:text-blue-400 mt-1 block font-bold">
            ★ Practice active
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Topics Mastered
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {overview.topicsLearned}
          </span>
          <span className="text-xs text-[#0E7490] dark:text-cyan-400 mt-1 block font-bold">
            ✦ Concepts solid
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Learning Time
          </span>
          <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {Math.floor(overview.learningTimeMinutes / 60)}h {overview.learningTimeMinutes % 60}m
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400 mt-1 block font-bold">
            ⏱ Steady effort
          </span>
        </div>
      </div>
    </section>
  );
};

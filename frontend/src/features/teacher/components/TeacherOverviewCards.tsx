'use client';

import React from 'react';
import { TeacherDashboardOverview } from '../types/teacher';

interface TeacherOverviewCardsProps {
  stats: TeacherDashboardOverview['overviewStats'];
}

export const TeacherOverviewCards: React.FC<TeacherOverviewCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Learners
          </span>
          <span className="text-xl" aria-hidden="true">👥</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2 block">
          {stats.totalLearners}
        </span>
        <span className="text-xs text-[#044E3A] dark:text-emerald-400 font-bold mt-1 block">
          ● {stats.activeLearners} Active today
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg Progress
          </span>
          <span className="text-xl" aria-hidden="true">📈</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-[#044E3A] dark:text-emerald-400 mt-2 block">
          {stats.averageProgress}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
          Across all courses
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg Quiz Score
          </span>
          <span className="text-xl" aria-hidden="true">⭐</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-[#1E40AF] dark:text-blue-400 mt-2 block">
          {stats.averageQuizScore}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
          Recent checkpoints
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Need Support
          </span>
          <span className="text-xl" aria-hidden="true">💡</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 block">
          {stats.needSupportCount}
        </span>
        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1 block">
          Guided practice suggested
        </span>
      </div>
    </div>
  );
};

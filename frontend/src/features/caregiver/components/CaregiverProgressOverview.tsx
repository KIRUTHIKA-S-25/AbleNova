'use client';

import React from 'react';
import { CaregiverLearnerSummary } from '../types/caregiver';

interface CaregiverProgressOverviewProps {
  learner: CaregiverLearnerSummary;
}

export const CaregiverProgressOverview: React.FC<CaregiverProgressOverviewProps> = ({ learner }) => {
  return (
    <section aria-labelledby="caregiver-overview-heading" className="bg-white dark:bg-slate-900 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 p-6 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ECE9E4] dark:border-slate-800">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#D9FAF2] text-[#044E3A] text-xs font-extrabold uppercase tracking-wider">
            Grade {learner.grade} Learning Journey
          </span>
          <h1 id="caregiver-overview-heading" className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {learner.name}&apos;s Progress Summary
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Currently practicing <strong className="text-slate-900 dark:text-white">{learner.currentCourse}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#D9FAF2] dark:bg-emerald-950/40 p-4 rounded-2xl border border-[#A3EAD2] dark:border-emerald-800/40">
          <span className="text-3xl font-black text-[#044E3A] dark:text-emerald-400">
            {learner.overallProgressPercentage}%
          </span>
          <span className="text-xs font-bold text-[#044E3A] dark:text-emerald-300">
            Overall Completion
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Lessons Finished</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {learner.completedLessonsCount} / {learner.totalLessonsCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Quiz Accuracy</span>
          <span className="text-xl font-black text-[#044E3A] dark:text-emerald-400 mt-1 block">
            {learner.averageQuizScore}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Learning Streak</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            🔥 {learner.currentStreakDays} Days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Last Active</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {learner.lastActive}
          </span>
        </div>
      </div>
    </section>
  );
};

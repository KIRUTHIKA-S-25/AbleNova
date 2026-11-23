'use client';

import React from 'react';

interface LearningStreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export const LearningStreakCard: React.FC<LearningStreakCardProps> = ({ currentStreak, longestStreak }) => {
  return (
    <div className="bg-[#FFF0B8] dark:bg-amber-950/40 rounded-3xl p-6 border border-[#FDE68A] dark:border-amber-800 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-200/70 dark:bg-amber-900/50 flex items-center justify-center text-3xl shrink-0" aria-hidden="true">
          🔥
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            Streak Consistency
          </span>
          <h3 className="text-xl md:text-2xl font-black mt-0.5 text-amber-900 dark:text-amber-200">
            You&apos;re on a {currentStreak}-day learning streak!
          </h3>
          <p className="text-xs md:text-sm text-amber-800 dark:text-amber-400 mt-1 font-medium">
            Nice consistency! Keep learning at your own comfortable pace.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 bg-white/60 dark:bg-amber-900/30 px-5 py-3 rounded-2xl border border-amber-200 dark:border-amber-800 shrink-0">
        <div>
          <span className="block text-[10px] uppercase font-extrabold text-amber-700 dark:text-amber-500">Current</span>
          <span className="text-lg font-black text-amber-900 dark:text-amber-200">{currentStreak} Days</span>
        </div>
        <div className="w-px h-8 bg-amber-200 dark:bg-amber-700" />
        <div>
          <span className="block text-[10px] uppercase font-extrabold text-amber-700 dark:text-amber-500">Personal Best</span>
          <span className="text-lg font-black text-amber-900 dark:text-amber-200">{longestStreak} Days</span>
        </div>
      </div>
    </div>
  );
};

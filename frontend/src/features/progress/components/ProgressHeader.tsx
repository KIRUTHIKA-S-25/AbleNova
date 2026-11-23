'use client';

import React from 'react';

interface ProgressHeaderProps {
  studentName?: string;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ studentName = 'Alex' }) => {
  return (
    <header className="mb-8" role="banner">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-[#D9FAF2] text-[#044E3A] text-xs font-extrabold rounded-full uppercase tracking-wider">
              Learning Analytics &amp; Progress
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Your Learning Journey, {studentName}! 🌟
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-medium">
            See your progress, celebrate what you&apos;ve learned, and discover what to practice next.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center bg-[#FFF0B8] dark:bg-amber-950/40 p-3 rounded-2xl border border-[#FDE68A] dark:border-amber-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xl" aria-hidden="true">
            🔥
          </div>
          <div>
            <span className="block text-xs font-bold text-amber-800 dark:text-amber-400">Current Streak</span>
            <span className="text-lg font-black text-amber-900 dark:text-amber-300">5 Days</span>
          </div>
        </div>
      </div>
    </header>
  );
};

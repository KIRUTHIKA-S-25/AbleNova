'use client';

import React from 'react';

export const TeacherAnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Class Performance & Topic Analytics
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Aggregated class mastery levels across enrolled logic, coding, and web development topics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Most Successful Topics
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Variables & Data Types</span>
                <span>90% Mastery</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>If / Else Conditions</span>
                <span>82% Mastery</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Topics Needing Class Review
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Functions & Parameters</span>
                <span>54% Mastery</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '54%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>For Loops & Repetition</span>
                <span>68% Mastery</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

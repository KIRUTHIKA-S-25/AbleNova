'use client';

import React from 'react';
import Link from 'next/link';

interface OfflineFallbackCardProps {
  title?: string;
  message?: string;
}

export const OfflineFallbackCard: React.FC<OfflineFallbackCardProps> = ({
  title = "This content isn't available offline yet",
  message = "Connect to the internet and open this lesson once to save it for offline learning."
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg mx-auto border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-4 my-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center text-3xl mx-auto" aria-hidden="true">
        ⚡
      </div>

      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
        {title}
      </h2>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
        {message}
      </p>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/student"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
        >
          Return to Student Dashboard
        </Link>
        <Link
          href="/lessons"
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
        >
          View Saved Lessons
        </Link>
      </div>
    </div>
  );
};

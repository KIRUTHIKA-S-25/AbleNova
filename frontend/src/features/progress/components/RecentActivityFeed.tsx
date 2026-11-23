'use client';

import React from 'react';
import { RecentActivityItem } from '../types/progress';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  return (
    <section aria-labelledby="recent-activity-heading" className="bg-white dark:bg-slate-900 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 p-6 shadow-xs mb-8">
      <h2 id="recent-activity-heading" className="text-xl font-black text-slate-900 dark:text-white mb-4">
        Recent Activity
      </h2>

      <div className="space-y-3" role="list">
        {activities.map((act) => (
          <div
            key={act.id}
            role="listitem"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F3EE] dark:bg-slate-800 border border-[#ECE9E4] dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#044E3A] shrink-0" aria-hidden="true" />
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  {act.title}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {act.timestamp}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#D9FAF2] text-[#044E3A] dark:bg-emerald-950/70 dark:text-emerald-300">
              {act.statusText}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

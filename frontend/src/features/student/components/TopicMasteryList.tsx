'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { TopicMasteryItem } from '@/types/studentDashboard';
import { Award } from 'lucide-react';

interface TopicMasteryListProps {
  masteries: TopicMasteryItem[];
}

export const TopicMasteryList: React.FC<TopicMasteryListProps> = ({ masteries }) => {
  return (
    <Card className="p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 space-y-6 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Subject Mastery Overview</span>
            <Award className="w-6 h-6 text-teal-600 dark:text-yellow-400" aria-hidden="true" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            Your understanding across active subject domains
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" role="region" aria-label="Topic Mastery Breakdown">
        {masteries.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs" aria-hidden="true">
                  {item.iconEmoji}
                </span>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {item.subjectName}
                </span>
              </div>

              <span className="text-sm font-black text-teal-700 dark:text-yellow-400">
                {item.masteryPercentage}%
              </span>
            </div>

            <Progress
              value={item.masteryPercentage}
              label={`${item.subjectName} — ${item.masteryPercentage} percent mastery`}
              showText={false}
            />

            {/* Screen Reader Detailed Status text */}
            <span className="sr-only">
              {item.subjectName} topic mastery is currently at {item.masteryPercentage} percent.
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { TopicMasteryItem, MasteryStatus } from '../types/progress';

interface TopicMasterySectionProps {
  topics: TopicMasteryItem[];
}

export const TopicMasterySection: React.FC<TopicMasterySectionProps> = ({ topics }) => {
  const getMasteryBadge = (status: MasteryStatus) => {
    switch (status) {
      case 'strong':
        return {
          label: 'Strong',
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          barClass: 'bg-emerald-500'
        };
      case 'good_progress':
        return {
          label: 'Good Progress',
          badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          barClass: 'bg-teal-500'
        };
      case 'developing':
        return {
          label: 'Developing',
          badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          barClass: 'bg-cyan-500'
        };
      case 'needs_practice':
      default:
        return {
          label: 'Practice More',
          badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          barClass: 'bg-amber-500'
        };
    }
  };

  return (
    <section aria-labelledby="topic-mastery-heading" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 id="topic-mastery-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Topic Mastery & Skill Areas
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Encouraging performance insights for specific concepts and logic topics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const badge = getMasteryBadge(topic.status);

          return (
            <div
              key={topic.topicId}
              className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {topic.subject}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {topic.topicName}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {topic.shortExplanation}
                </p>

                {/* Accessible Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Concept Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">{topic.percentage}%</span>
                  </div>
                  <div 
                    className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={topic.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${topic.topicName} mastery score is ${topic.percentage} percent`}
                  >
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${badge.barClass}`}
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                <Link
                  href={`/learn/python-basics/${topic.topicId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-hidden rounded-md px-1"
                >
                  <span>Practice Topic</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { TopicMasteryItem } from '../types/progress';

interface AreasToPracticeSectionProps {
  topics: TopicMasteryItem[];
}

export const AreasToPracticeSection: React.FC<AreasToPracticeSectionProps> = ({ topics }) => {
  // Filter topics that need attention (percentage < 75 or mistakes > 0)
  const practiceAreas = topics.filter(t => t.percentage < 75 || t.recentMistakesCount > 0);

  if (practiceAreas.length === 0) return null;

  return (
    <section aria-labelledby="areas-to-practice-heading" className="mb-8">
      <div className="mb-4">
        <h2 id="areas-to-practice-heading" className="text-xl font-bold text-slate-900 dark:text-white">
          Areas to Practice
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Targeted micro-practice modules to strengthen specific skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practiceAreas.map((topic) => (
          <div 
            key={topic.topicId}
            className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  Practice Focus
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Practice {topic.topicName}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {topic.recentMistakesCount > 0
                  ? `You missed ${topic.recentMistakesCount} recent questions about ${topic.topicName.toLowerCase()}.`
                  : `You scored ${topic.percentage}% in recent ${topic.topicName} questions.`}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-900/40 flex justify-end">
              <Link
                href={`/learn/python-basics/${topic.topicId}`}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              >
                Practice {topic.topicName}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

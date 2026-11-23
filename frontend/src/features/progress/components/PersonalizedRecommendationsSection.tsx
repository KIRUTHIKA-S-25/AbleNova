'use client';

import React from 'react';
import Link from 'next/link';
import { RecommendationItem, RecommendationType } from '../types/progress';

interface PersonalizedRecommendationsProps {
  recommendations: RecommendationItem[];
}

export const PersonalizedRecommendationsSection: React.FC<PersonalizedRecommendationsProps> = ({ recommendations }) => {
  const getTypeBadge = (type: RecommendationType) => {
    switch (type) {
      case 'unfinished_lesson':
        return { label: 'Continue Learning', color: 'bg-[#D9FAF2] text-[#044E3A]' };
      case 'topic_mistakes':
        return { label: 'Mistake Review', color: 'bg-[#FFF0B8] text-[#92400E]' };
      case 'low_quiz_performance':
        return { label: 'Boost Score', color: 'bg-[#DCEFFF] text-[#1E40AF]' };
      case 'quiz_retry':
        return { label: 'Retake Quiz', color: 'bg-[#F1EAFB] text-[#6D28D9]' };
      case 'next_lesson':
        return { label: 'Next Lesson', color: 'bg-[#BFEAF5] text-[#0E7490]' };
      case 'new_topic':
      default:
        return { label: 'Explore New Topic', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
    }
  };

  return (
    <section aria-labelledby="recommendations-heading" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-[#ECE9E4] dark:border-slate-800 shadow-xs mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="px-3 py-1 bg-[#F1EAFB] text-[#6D28D9] rounded-full text-xs font-extrabold uppercase tracking-wider">
          Personalized Engine
        </span>
      </div>

      <h2 id="recommendations-heading" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
        Recommended for You ✨
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
        Tailored suggestions calculated based on your recent quiz scores, active lessons, and topic mastery.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {recommendations.map((rec) => {
          const badge = getTypeBadge(rec.type);

          return (
            <div
              key={rec.id}
              className="bg-[#F6F3EE] dark:bg-slate-800 rounded-2xl p-5 border border-[#ECE9E4] dark:border-slate-700 hover:border-[#9FF2DF] dark:hover:border-emerald-600 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Priority #{rec.priority}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  &quot;{rec.reason}&quot;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#ECE9E4] dark:border-slate-700 flex justify-end">
                <Link
                  href={rec.actionUrl}
                  className="px-4 py-2 rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white font-extrabold text-xs transition-colors focus:ring-2 focus:ring-emerald-300 focus:outline-hidden"
                >
                  {rec.actionText} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

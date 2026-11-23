'use client';

import React from 'react';
import Link from 'next/link';
import { SupportRecommendation } from '../types/caregiver';

interface CaregiverSupportRecommendationsProps {
  recommendations: SupportRecommendation[];
}

export const CaregiverSupportRecommendations: React.FC<CaregiverSupportRecommendationsProps> = ({ recommendations }) => {
  return (
    <section aria-labelledby="support-rec-heading" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-[#ECE9E4] dark:border-slate-800 shadow-xs mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full bg-[#F1EAFB] text-[#6D28D9] text-xs font-extrabold uppercase tracking-wider">
          Home Learning Support
        </span>
      </div>

      <h2 id="support-rec-heading" className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
        Supportive Actions for Home ✨
      </h2>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
        Simple, non-technical ways to support your learner&apos;s journey outside of class.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-[#F6F3EE] dark:bg-slate-800 rounded-2xl p-5 border border-[#ECE9E4] dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{rec.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">&quot;{rec.description}&quot;</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#ECE9E4] dark:border-slate-700 flex justify-end">
              <Link
                href="/ai-assistant"
                className="px-3.5 py-1.5 rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white font-bold text-xs transition-colors"
              >
                {rec.actionText} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

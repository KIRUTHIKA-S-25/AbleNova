'use client';

import React from 'react';
import Link from 'next/link';
import { StudentProgressOverview, RecommendationItem } from '../types/progress';

interface ProgressSummaryWidgetProps {
  overview: StudentProgressOverview;
  topRecommendation?: RecommendationItem;
}

export const ProgressSummaryWidget: React.FC<ProgressSummaryWidgetProps> = ({ overview, topRecommendation }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md mb-8 border border-emerald-800/40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Your Analytics Snapshot
            </span>
          </div>

          <h3 className="text-xl font-bold text-white">
            Your Progress: <span className="text-emerald-400 font-extrabold">{overview.overallPercentage}% Complete</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {overview.completedLessons} of {overview.totalLessons} lessons completed • 🔥 {overview.currentStreak}-day learning streak
          </p>

          {topRecommendation && (
            <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
              <span className="font-bold text-emerald-300 block mb-0.5">Top Recommendation:</span>
              <span className="text-white font-semibold">{topRecommendation.title}</span> — {topRecommendation.reason}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {topRecommendation && (
            <Link
              href={topRecommendation.actionUrl}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-colors shadow-xs"
            >
              {topRecommendation.actionText} →
            </Link>
          )}

          <Link
            href="/progress"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center transition-colors border border-white/20"
          >
            View Full Progress
          </Link>
        </div>
      </div>
    </div>
  );
};

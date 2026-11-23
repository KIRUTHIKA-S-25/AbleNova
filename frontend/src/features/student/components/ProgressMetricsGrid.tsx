'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { ProgressSummaryMetrics } from '@/types/studentDashboard';
import { Trophy, CheckSquare, Flame, TrendingUp } from 'lucide-react';

interface ProgressMetricsGridProps {
  metrics: ProgressSummaryMetrics;
}

export const ProgressMetricsGrid: React.FC<ProgressMetricsGridProps> = ({ metrics }) => {
  return (
    <section aria-labelledby="progress-metrics-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="progress-metrics-heading" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>Your Progress</span>
          <TrendingUp className="w-6 h-6 text-teal-600 dark:text-yellow-400" aria-hidden="true" />
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Overall Progress */}
        <Card className="p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 hover:border-teal-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Learning Progress</span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {metrics.overallProgressPercentage}%
          </div>
          <Progress value={metrics.overallProgressPercentage} showText={false} />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Overall completion across all enrolled subjects
          </p>
        </Card>

        {/* Card 2: Topics Mastered */}
        <Card className="p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Topics Mastered</span>
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {metrics.topicsMasteredCount} <span className="text-lg font-bold text-slate-500">/ {metrics.totalTopicsCount}</span>
          </div>
          <Progress value={Math.round((metrics.topicsMasteredCount / metrics.totalTopicsCount) * 100)} showText={false} />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Topics passed with 80%+ quiz score
          </p>
        </Card>

        {/* Card 3: Activities Completed */}
        <Card className="p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Activities Completed</span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {metrics.activitiesCompletedCount}
          </div>
          <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 dark:bg-indigo-400 w-4/5 rounded-full" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Lessons, quizzes, and reviews finished
          </p>
        </Card>

        {/* Card 4: Learning Streak */}
        <Card className="p-5 border-2 border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-900 dark:text-amber-200">Learning Streak</span>
            <div className="p-2 rounded-xl bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" aria-hidden="true" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">
            {metrics.streakDays} Days 🔥
          </div>
          <div className="w-full h-2 bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-5/7 rounded-full" />
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
            Goal: 7 consecutive learning days!
          </p>
        </Card>
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { TodayActivity } from '@/types/studentDashboard';
import { BookOpen, Puzzle, RefreshCw, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface TodaysLearningSectionProps {
  activities: TodayActivity[];
}

export const TodaysLearningSection: React.FC<TodaysLearningSectionProps> = ({ activities }) => {
  const getIcon = (type: TodayActivity['type']) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />;
      case 'practice':
        return <Puzzle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />;
      case 'review':
        return <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />;
      case 'recommended':
        return <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" aria-hidden="true" />;
    }
  };

  const getBadgeVariant = (type: TodayActivity['type']) => {
    switch (type) {
      case 'lesson':
        return 'primary';
      case 'practice':
        return 'secondary';
      case 'review':
        return 'info';
      case 'recommended':
        return 'warning';
    }
  };

  return (
    <section aria-labelledby="todays-learning-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 id="todays-learning-heading" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Today&apos;s Learning</span>
            <span className="text-xl">🎯</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            3–4 bite-sized activities tailored to your daily goals
          </p>
        </div>

        <Link href="/lessons" className="text-sm font-bold text-teal-700 dark:text-yellow-400 hover:underline flex items-center gap-1">
          <span>View All Lessons</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="p-5 border-2 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-yellow-400 transition-all flex flex-col justify-between gap-4 group bg-white dark:bg-slate-900"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {getIcon(activity.type)}
                </div>
                <Badge variant={getBadgeVariant(activity.type)} className="text-xs font-extrabold uppercase tracking-wide">
                  {activity.type}
                </Badge>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {activity.subject}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-yellow-400 transition-colors leading-snug">
                  {activity.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  {activity.estimatedMinutes} mins
                </span>
                <span className="capitalize font-bold text-teal-700 dark:text-teal-300">
                  {activity.difficulty}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Progress</span>
                  <span>{activity.progressPercentage}%</span>
                </div>
                <Progress value={activity.progressPercentage} showText={false} />
              </div>
            </div>

            <Link href={activity.type === 'practice' ? '/quizzes/quiz_001' : '/lessons/lesson_001'}>
              <Button size="medium" variant="secondary" className="w-full justify-center text-sm font-bold gap-1.5 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-yellow-400 dark:group-hover:text-black transition-colors">
                <span>{activity.actionLabel}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
};

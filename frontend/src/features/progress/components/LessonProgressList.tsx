'use client';

import React from 'react';
import Link from 'next/link';
import { LessonProgressItem } from '../types/progress';

interface LessonProgressListProps {
  lessons: LessonProgressItem[];
}

export const LessonProgressList: React.FC<LessonProgressListProps> = ({ lessons }) => {
  const getStatusBadge = (status: LessonProgressItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: '✓',
          label: 'Completed',
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
      case 'in_progress':
        return {
          icon: '◐',
          label: 'In Progress',
          className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
        };
      case 'not_started':
      default:
        return {
          icon: '○',
          label: 'Not Started',
          className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };
    }
  };

  return (
    <section aria-labelledby="lesson-progress-heading" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 id="lesson-progress-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Lesson Completion Status
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Review completed topics, active lessons, and upcoming units.
          </p>
        </div>
      </div>

      <div className="space-y-3" role="list" aria-label="Lessons list">
        {lessons.map((lesson) => {
          const badge = getStatusBadge(lesson.status);

          return (
            <div
              key={lesson.lessonId}
              role="listitem"
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors gap-4"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span 
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-extrabold shrink-0 ${badge.className}`}
                  aria-hidden="true"
                >
                  {badge.icon}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {lesson.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {lesson.courseName} • Est. {lesson.estimatedMinutes} mins
                    {lesson.lastAccessed && ` • Last accessed ${lesson.lastAccessed}`}
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <Link
                  href={`/learn/${lesson.courseId}/${lesson.lessonId}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                >
                  {lesson.status === 'completed' ? 'Review Lesson' : lesson.status === 'in_progress' ? 'Continue' : 'Start'}
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

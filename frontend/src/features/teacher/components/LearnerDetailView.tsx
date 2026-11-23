'use client';

import React from 'react';
import Link from 'next/link';
import { LearnerDetail } from '../types/teacher';

interface LearnerDetailViewProps {
  student: LearnerDetail;
}

export const LearnerDetailView: React.FC<LearnerDetailViewProps> = ({ student }) => {
  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/teacher/students"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          ← Back to Student Roster
        </Link>

        <Link
          href="/ai-assistant"
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
        >
          🤖 Ask AI for Teaching Ideas
        </Link>
      </div>

      {/* Student Hero Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-bold">
              Grade {student.grade} Learner
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active {student.lastActive}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {student.name}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Enrolled in <strong className="text-slate-900 dark:text-white">{student.currentCourse}</strong>
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase">Overall Progress</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{student.progressPercentage}%</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase">Quiz Score</span>
            <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">{student.recentQuizScore}%</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase">Streak</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">🔥 {student.currentStreakDays}d</span>
          </div>
        </div>
      </div>

      {/* Areas That May Need Support Section */}
      {student.areasNeedingSupport.length > 0 && (
        <section aria-labelledby="support-heading" className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6">
          <h2 id="support-heading" className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">
            Areas That May Need Support
          </h2>

          <div className="space-y-3">
            {student.areasNeedingSupport.map((area, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-800/40">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {area.topicName} (Recent Quiz Performance: {area.recentScore}%)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    Guided Practice Suggested
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {area.suggestion}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Topic Mastery Breakdown */}
      <section aria-labelledby="mastery-heading" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 id="mastery-heading" className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Topic Mastery Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.topicMasteries.map((topic) => (
            <div key={topic.topicId} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{topic.topicName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {topic.statusLabel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Accuracy Score</span>
                <span className="font-bold text-slate-900 dark:text-white">{topic.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${topic.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

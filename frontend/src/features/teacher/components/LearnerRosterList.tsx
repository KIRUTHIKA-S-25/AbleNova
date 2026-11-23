'use client';

import React from 'react';
import Link from 'next/link';
import { LearnerSummary } from '../types/teacher';
import { useTeacherStore } from '../store/useTeacherStore';

interface LearnerRosterListProps {
  learners: LearnerSummary[];
}

export const LearnerRosterList: React.FC<LearnerRosterListProps> = ({ learners }) => {
  const { filter, setFilter, searchQuery, setSearchQuery } = useTeacherStore();

  return (
    <section aria-labelledby="roster-heading" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="roster-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Assigned Student Roster
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor progress, scores, and support status across all enrolled learners.
          </p>
        </div>

        {/* Search input & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learner or course..."
            className="px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden text-slate-900 dark:text-white"
            aria-label="Search learner or course"
          />

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'active' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('needs_support')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'needs_support' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Needs Support
            </button>
          </div>
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learners.map((student) => (
          <div
            key={student.studentId}
            className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {student.primarySubject}
                </span>
                <span 
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    student.status === 'needs_support' 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {student.status === 'needs_support' ? 'Needs Support' : 'Active'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {student.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Course: {student.currentCourse} • Active {student.lastActive}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-500 block">Course Progress</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {student.progressPercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Recent Score</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {student.recentQuizScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
              <Link
                href={`/teacher/students/${student.studentId}`}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
              >
                View Learner Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

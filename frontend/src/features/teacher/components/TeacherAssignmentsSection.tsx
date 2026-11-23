'use client';

import React from 'react';
import { useTeacherStore } from '../store/useTeacherStore';
import { CreateAssignmentModal } from './CreateAssignmentModal';

export const TeacherAssignmentsSection: React.FC = () => {
  const { assignments, setCreateAssignmentOpen } = useTeacherStore();

  return (
    <section aria-labelledby="assignments-heading" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="assignments-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Assignments & Micro-Practice
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dispatch targeted exercises to specific learners or your whole class.
          </p>
        </div>

        <button
          onClick={() => setCreateAssignmentOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors self-start sm:self-center"
        >
          + Create Assignment
        </button>
      </div>

      <div className="space-y-3">
        {assignments.map((asg) => (
          <div key={asg.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{asg.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  {asg.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {asg.courseName} • Topic: {asg.topicName} • Due: {asg.dueDate} • Assigned to {asg.targetStudentsCount} students
              </p>
            </div>

            <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 self-end sm:self-center">
              View Status
            </button>
          </div>
        ))}
      </div>

      <CreateAssignmentModal />
    </section>
  );
};

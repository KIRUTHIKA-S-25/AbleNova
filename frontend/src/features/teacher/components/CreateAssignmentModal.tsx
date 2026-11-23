'use client';

import React, { useState } from 'react';
import { useTeacherStore } from '../store/useTeacherStore';

export const CreateAssignmentModal: React.FC = () => {
  const { isCreateAssignmentOpen, setCreateAssignmentOpen, createAssignment } = useTeacherStore();
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('Python Fundamentals');
  const [topicName, setTopicName] = useState('Functions');
  const [dueDate, setDueDate] = useState('Friday');

  if (!isCreateAssignmentOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createAssignment({
      title,
      courseName,
      topicName,
      dueDate,
      targetStudentsCount: 12
    });
    setTitle('');
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
            Create Learning Assignment
          </h2>
          <button
            onClick={() => setCreateAssignmentOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Python Functions Practice"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Course
              </label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Python Fundamentals">Python Fundamentals</option>
                <option value="Web Basics">Web Basics</option>
                <option value="Database Basics">Database Basics</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Topic
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Functions"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Friday, Oct 10"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCreateAssignmentOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

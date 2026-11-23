'use client';

import React from 'react';
import Link from 'next/link';
import { CourseProgressItem } from '../types/progress';

interface CourseProgressSectionProps {
  courses: CourseProgressItem[];
}

export const CourseProgressSection: React.FC<CourseProgressSectionProps> = ({ courses }) => {
  return (
    <section aria-labelledby="course-progress-heading" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="course-progress-heading" className="text-xl font-black text-slate-900 dark:text-white">
            Course Completion
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track your milestone progress course by course.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div 
            key={course.courseId}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-[#9FF2DF] dark:hover:border-emerald-600 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F6F3EE] dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  {course.subject}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {course.lastActivity}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                {course.courseName}
              </h3>

              <div className="mt-4 mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {course.completedLessons} of {course.totalLessons} lessons
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {course.percentage}%
                </span>
              </div>

              {/* Accessible Progress Bar */}
              <div 
                className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600"
                role="progressbar"
                aria-valuenow={course.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${course.courseName} progress is ${course.percentage} percent`}
              >
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${course.percentage}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {course.percentage === 100 ? 'Completed 🎉' : 'In Progress'}
              </span>

              <Link
                href={`/learn/${course.courseId}/variables`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
              >
                <span>Continue</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

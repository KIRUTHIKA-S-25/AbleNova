'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileCheck, Play, Award, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const MOCK_QUIZZES = [
  {
    id: 'quiz-101',
    courseId: 'math-101',
    lessonId: 'lesson-1',
    title: 'Python Basics & Variables Quiz',
    topic: 'Python Fundamentals',
    questionsCount: 5,
    estimatedMinutes: 8,
    status: 'Completed',
    lastScore: 85,
    passPercentage: 70,
    badgeUnlocked: 'Variable Explorer',
  },
  {
    id: 'quiz-102',
    courseId: 'python-basics',
    lessonId: 'for-loops',
    title: 'For Loops & Repetition Quiz',
    topic: 'Python Fundamentals',
    questionsCount: 6,
    estimatedMinutes: 10,
    status: 'Ready',
    lastScore: null,
    passPercentage: 75,
    badgeUnlocked: 'Loop Master',
  },
  {
    id: 'quiz-103',
    courseId: 'web-basics',
    lessonId: 'html-intro',
    title: 'HTML Tags & Colors Mastery Quiz',
    topic: 'Web Basics',
    questionsCount: 5,
    estimatedMinutes: 7,
    status: 'Ready',
    lastScore: null,
    passPercentage: 70,
    badgeUnlocked: 'Web Creator',
  },
];

export default function QuizzesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Quizzes & Assessments</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Test your knowledge, earn badges, and track topic mastery at your own pace.
              </p>
            </div>
          </div>
          <Badge className="bg-[#A3EAD2] text-[#044E3A] font-extrabold px-3 py-1.5 rounded-xl border-none">
            3 Active Quizzes Available
          </Badge>
        </div>

        {/* Quizzes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_QUIZZES.map((quiz) => {
            const isCompleted = quiz.status === 'Completed';
            return (
              <Card key={quiz.id} className="flex flex-col justify-between p-6 rounded-3xl hover:shadow-lg transition-all border-2 border-slate-100 dark:border-slate-800">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={isCompleted ? 'success' : 'info'} className="text-xs">
                      {quiz.topic}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{quiz.estimatedMinutes} mins</span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{quiz.title}</h2>

                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span>{quiz.questionsCount} Questions</span>
                    <span>•</span>
                    <span>Pass Score: {quiz.passPercentage}%</span>
                  </div>

                  {isCompleted && quiz.lastScore !== null && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Previous Score</span>
                      </div>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{quiz.lastScore}%</span>
                    </div>
                  )}

                  {!isCompleted && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center gap-2 text-xs font-medium text-blue-900 dark:text-blue-300">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Unlock "{quiz.badgeUnlocked}" badge on passing!</span>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <Link href={`/learn/${quiz.courseId}/${quiz.lessonId}/quiz`}>
                    <Button className="w-full justify-center gap-2 rounded-xl bg-[#044E3A] hover:bg-[#033b2c] text-white font-bold py-3">
                      <Play className="w-4 h-4" />
                      <span>{isCompleted ? 'Retake Quiz' : 'Start Quiz Now'}</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

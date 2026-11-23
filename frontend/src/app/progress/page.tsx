'use client';

import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import {
  useProgressStore,
  ProgressHeader,
  OverallProgressCard,
  CourseProgressSection,
  LessonProgressList,
  QuizPerformanceCard,
  TopicMasterySection,
  AreasToPracticeSection,
  PersonalizedRecommendationsSection,
  LearningStreakCard,
  RecentActivityFeed
} from '@/features/progress';

export default function ProgressPage() {
  const {
    overview,
    courses,
    lessons,
    quizHistory,
    quizTrend,
    topicMasteries,
    recommendations,
    recentActivity,
    isLoading,
    initializeProgress
  } = useProgressStore();

  useEffect(() => {
    initializeProgress();
  }, [initializeProgress]);

  if (isLoading || !overview) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading your learning journey...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Main Header */}
        <ProgressHeader studentName="Alex" />

        {/* Learning Streak Banner */}
        <LearningStreakCard
          currentStreak={overview.currentStreak}
          longestStreak={overview.longestStreak}
        />

        {/* Overall Completion Metric */}
        <OverallProgressCard overview={overview} />

        {/* Personalized Recommendations */}
        <PersonalizedRecommendationsSection recommendations={recommendations} />

        {/* Areas to Practice */}
        <AreasToPracticeSection topics={topicMasteries} />

        {/* AI Progress Guidance Banner */}
        <div className="bg-[#DCEFFF] dark:bg-blue-950/40 rounded-3xl p-6 shadow-xs mb-8 border border-[#BFDBFE] dark:border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-blue-900 text-[#1E40AF] dark:text-blue-300 text-xs font-extrabold uppercase tracking-wider border border-[#BFDBFE] dark:border-blue-700">
              Need Help Improving?
            </span>
            <h3 className="text-lg font-extrabold text-[#1E3A5F] dark:text-blue-100 mt-2">
              Ask Nova AI About Your Progress 🤖
            </h3>
            <p className="text-xs text-slate-600 dark:text-blue-200 mt-1 max-w-xl font-medium">
              Get personalized practice advice, targeted hints, and step-by-step guidance to master your developing topics!
            </p>
          </div>

          <a
            href="/ai-assistant"
            className="px-5 py-2.5 rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white font-extrabold text-xs transition-colors shrink-0 shadow-xs"
          >
            Ask AI Assistant →
          </a>
        </div>

        {/* Course Completion Section */}
        <CourseProgressSection courses={courses} />

        {/* Lesson Status List */}
        <LessonProgressList lessons={lessons} />

        {/* Quiz Performance History & Trend Line Chart */}
        <QuizPerformanceCard history={quizHistory} trend={quizTrend} />

        {/* Topic Mastery Breakdown */}
        <TopicMasterySection topics={topicMasteries} />

        {/* Recent Activity Log */}
        <RecentActivityFeed activities={recentActivity} />
      </div>

      <AiCompanionModal />
    </AppShell>
  );
}

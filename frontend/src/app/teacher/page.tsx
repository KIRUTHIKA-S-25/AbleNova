'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import { useUiStore } from '@/store/useUiStore';
import {
  useTeacherStore,
  TeacherOverviewCards,
  LearnerRosterList,
  TeacherAssignmentsSection
} from '@/features/teacher';

export default function TeacherDashboardPage() {
  const { overview, learners, isLoading, loadDashboard } = useTeacherStore();
  const { setActiveRoleView } = useUiStore();

  useEffect(() => {
    setActiveRoleView('teacher');
    loadDashboard();
  }, [setActiveRoleView, loadDashboard]);

  if (isLoading || !overview) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading Teacher Dashboard...
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs mb-8">
          <div>
            <span className="px-3 py-1 bg-[#D9FAF2] text-[#044E3A] text-xs font-extrabold uppercase tracking-wider rounded-full">
              Educator Workspace
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">
              Teacher Dashboard 📚
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
              See how your learners are progressing and discover where they may need support.
            </p>
          </div>

          <Link
            href="/ai-assistant"
            className="px-4 py-2.5 rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white font-extrabold text-xs transition-colors self-start md:self-center shrink-0 shadow-xs"
          >
            🤖 Ask AI for Teaching Ideas
          </Link>
        </header>

        {/* Overview Metric Cards */}
        <TeacherOverviewCards stats={overview.overviewStats} />

        {/* Assigned Student Roster List */}
        <LearnerRosterList learners={learners} />

        {/* Assignments Section */}
        <TeacherAssignmentsSection />
      </div>

      <AiCompanionModal />
    </AppShell>
  );
}

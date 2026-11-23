'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import { useUiStore } from '@/store/useUiStore';
import {
  useCaregiverStore,
  CaregiverProgressOverview,
  CaregiverActivityTimeline,
  CaregiverSupportRecommendations
} from '@/features/caregiver';

export default function CaregiverDashboardPage() {
  const { overview, isLoading, loadDashboard } = useCaregiverStore();
  const { setActiveRoleView } = useUiStore();

  useEffect(() => {
    setActiveRoleView('caregiver');
    loadDashboard();
  }, [setActiveRoleView, loadDashboard]);

  if (isLoading || !overview) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading Caregiver Portal...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Simple Non-Technical Progress Overview */}
        <CaregiverProgressOverview learner={overview.learner} />

        {/* Supportive Actions for Home */}
        <CaregiverSupportRecommendations recommendations={overview.recommendations} />

        {/* Activity Timeline */}
        <CaregiverActivityTimeline activities={overview.recentActivities} />
      </div>

      <AiCompanionModal />
    </AppShell>
  );
}

'use client';

import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useUiStore } from '@/store/useUiStore';
import { useCaregiverStore, CaregiverActivityTimeline } from '@/features/caregiver';

export default function CaregiverLearnerActivityPage() {
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
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <CaregiverActivityTimeline activities={overview.recentActivities} />
      </div>
    </AppShell>
  );
}

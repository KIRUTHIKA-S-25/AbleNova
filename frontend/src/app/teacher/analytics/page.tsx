'use client';

import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useUiStore } from '@/store/useUiStore';
import { TeacherAnalyticsSection } from '@/features/teacher';

export default function TeacherAnalyticsPage() {
  const { setActiveRoleView } = useUiStore();

  useEffect(() => {
    setActiveRoleView('teacher');
  }, [setActiveRoleView]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <TeacherAnalyticsSection />
      </div>
    </AppShell>
  );
}

'use client';

import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useUiStore } from '@/store/useUiStore';
import { useTeacherStore, TeacherAssignmentsSection } from '@/features/teacher';

export default function TeacherAssignmentsPage() {
  const { loadDashboard } = useTeacherStore();
  const { setActiveRoleView } = useUiStore();

  useEffect(() => {
    setActiveRoleView('teacher');
    loadDashboard();
  }, [setActiveRoleView, loadDashboard]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <TeacherAssignmentsSection />
      </div>
    </AppShell>
  );
}

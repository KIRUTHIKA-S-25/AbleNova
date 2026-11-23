'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useUiStore } from '@/store/useUiStore';
import { useTeacherStore, LearnerDetailView } from '@/features/teacher';

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params?.studentId as string;
  const { selectedLearner, isLoading, loadLearnerDetail } = useTeacherStore();
  const { setActiveRoleView } = useUiStore();

  useEffect(() => {
    setActiveRoleView('teacher');
    if (studentId) {
      loadLearnerDetail(studentId);
    }
  }, [setActiveRoleView, studentId, loadLearnerDetail]);

  if (isLoading || !selectedLearner) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading Learner Details...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <LearnerDetailView student={selectedLearner} />
      </div>
    </AppShell>
  );
}

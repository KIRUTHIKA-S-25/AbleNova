'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AssistantShell } from '@/features/ai';

export default function AiAssistantPage() {
  return (
    <AppShell>
      <div className="py-6">
        <AssistantShell />
      </div>
    </AppShell>
  );
}

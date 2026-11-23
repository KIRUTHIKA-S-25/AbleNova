'use client';

import React, { useEffect } from 'react';
import { useAiStore } from '../store/useAiStore';
import { AssistantHeader } from './AssistantHeader';
import { ConversationView } from './ConversationView';
import { QuickPromptGroup } from './QuickPromptGroup';
import { MessageComposer } from './MessageComposer';
import { ClearConversationDialog } from './ClearConversationDialog';
import { AIContext } from '../types/ai';

interface AssistantShellProps {
  initialContext?: AIContext;
}

export const AssistantShell: React.FC<AssistantShellProps> = ({ initialContext }) => {
  const { initializeStore, setContext } = useAiStore();

  useEffect(() => {
    initializeStore();
    if (initialContext) {
      setContext(initialContext);
    }
  }, [initializeStore, setContext, initialContext]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AssistantHeader />

      {typeof window !== 'undefined' && !navigator.onLine && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">⚡</span>
            <span>AI assistance is unavailable while you&apos;re offline. You can still access saved lessons and practice activities!</span>
          </div>
          <a href="/lessons" className="underline font-bold shrink-0">View Saved Lessons</a>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 p-4 md:p-6 shadow-xs flex flex-col">
        <ConversationView />
        <QuickPromptGroup />
        <MessageComposer />
      </div>

      <ClearConversationDialog />
    </div>
  );
};

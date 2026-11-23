'use client';

import React from 'react';
import { useAiStore } from '../store/useAiStore';
import { ContextBadge } from './ContextBadge';

interface AssistantHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  title = 'Ask Nova — AI Learning Companion',
  subtitle = 'Get instant, simplified breakdowns of tough topics, hints, and code examples!'
}) => {
  const { activeContext, setClearModalOpen } = useAiStore();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#D9FAF2] text-[#044E3A] text-xs font-extrabold uppercase tracking-wider">
            ✨ AI Tutor Active
          </span>
          <ContextBadge context={activeContext} />
        </div>

        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 self-start md:self-center">
        <button
          onClick={() => setClearModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#F6F3EE] hover:bg-[#ECE9E4] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors border border-[#ECE9E4] dark:border-slate-700 focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
          aria-label="Clear chat conversation"
        >
          Clear Chat
        </button>
      </div>
    </header>
  );
};

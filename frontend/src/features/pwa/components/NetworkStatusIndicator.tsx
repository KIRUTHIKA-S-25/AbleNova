'use client';

import React from 'react';
import { usePwaStore } from '../store/usePwaStore';

export const NetworkStatusIndicator: React.FC = () => {
  const { isOnline, syncStatus, pendingSyncCount, setSyncModalOpen } = usePwaStore();

  const getStatusBadge = () => {
    if (!isOnline) {
      return {
        icon: '⚡',
        text: 'Offline — Saved Mode',
        ariaText: 'App is offline. Lessons and quizzes saved on this device are available.',
        className: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: '🔄',
          text: `Syncing ${pendingSyncCount} action${pendingSyncCount > 1 ? 's' : ''}...`,
          ariaText: `Syncing ${pendingSyncCount} pending actions to server.`,
          className: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800'
        };
      case 'sync_failed':
        return {
          icon: '⚠️',
          text: 'Sync Failed — Tap to retry',
          ariaText: 'Sync failed. Click to open sync details and retry.',
          className: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
        };
      case 'synced':
        return {
          icon: '✓',
          text: 'Progress Synced',
          ariaText: 'All learning progress is synced.',
          className: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
        };
      case 'online':
      default:
        return {
          icon: '●',
          text: 'Online',
          ariaText: 'App is connected online.',
          className: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <button
      onClick={() => setSyncModalOpen(true)}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border transition-all shadow-xs focus:ring-2 focus:ring-emerald-400 focus:outline-hidden ${badge.className}`}
      aria-label={badge.ariaText}
      title={badge.ariaText}
    >
      <span className="shrink-0 font-bold" aria-hidden="true">
        {badge.icon}
      </span>
      <span>{badge.text}</span>
    </button>
  );
};

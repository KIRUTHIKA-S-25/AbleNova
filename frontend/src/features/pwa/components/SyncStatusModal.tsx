'use client';

import React from 'react';
import { usePwaStore } from '../store/usePwaStore';

export const SyncStatusModal: React.FC = () => {
  const {
    isSyncModalOpen,
    setSyncModalOpen,
    isOnline,
    syncStatus,
    pendingSyncCount,
    triggerSync
  } = usePwaStore();

  if (!isSyncModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🔄</span>
            <h2 id="sync-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Sync & Connectivity Status
            </h2>
          </div>
          <button
            onClick={() => setSyncModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-base"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Connection:</span>
            <span className={`font-bold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isOnline ? 'Online Connected' : 'Offline Mode'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Pending Actions:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {pendingSyncCount} action{pendingSyncCount !== 1 ? 's' : ''} queued
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Status:</span>
            <span className="font-bold capitalize text-emerald-600 dark:text-emerald-400">
              {syncStatus.replace('_', ' ')}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          When offline, your completed lessons and quiz scores are safely saved on this device and will automatically sync when connectivity returns.
        </p>

        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setSyncModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
          >
            Close
          </button>
          {isOnline && pendingSyncCount > 0 && (
            <button
              onClick={() => triggerSync()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

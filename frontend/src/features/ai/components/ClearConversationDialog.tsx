'use client';

import React from 'react';
import { useAiStore } from '../store/useAiStore';

export const ClearConversationDialog: React.FC = () => {
  const { isClearModalOpen, setClearModalOpen, clearConversation } = useAiStore();

  if (!isClearModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-dialog-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        <h2 id="clear-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
          Start a New Conversation?
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
          This will clear current chat messages. Your overall course completion and topic progress will remain safe!
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setClearModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={clearConversation}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
          >
            Start New Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

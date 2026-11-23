'use client';

import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 my-3" role="status" aria-live="polite">
      <div className="w-9 h-9 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs" aria-hidden="true">
        🤖
      </div>

      <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping motion-reduce:animate-none" aria-hidden="true" />
        <span>Nova AI is crafting a simplified answer...</span>
      </div>
    </div>
  );
};

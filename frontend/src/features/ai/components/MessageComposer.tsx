'use client';

import React, { useState } from 'react';
import { useAiStore } from '../store/useAiStore';

export const MessageComposer: React.FC = () => {
  const [text, setText] = useState('');
  const { sendMessage, isLoading } = useAiStore();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    sendMessage(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nova anything about your studies... (Press Enter to send)"
          rows={2}
          className="flex-1 bg-transparent border-0 resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden px-2 py-1"
          aria-label="Ask Nova AI question"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-extrabold text-xs transition-colors shrink-0 shadow-xs focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
          aria-label="Send message to Nova AI"
        >
          {isLoading ? 'Thinking...' : 'Send →'}
        </button>
      </div>
    </form>
  );
};

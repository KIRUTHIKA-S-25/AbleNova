'use client';

import React from 'react';
import { useAiStore } from '../store/useAiStore';
import { AIMode } from '../types/ai';

interface PresetPrompt {
  label: string;
  query: string;
  mode: AIMode;
  icon: string;
}

export const QuickPromptGroup: React.FC = () => {
  const { sendMessage, isLoading } = useAiStore();

  const presets: PresetPrompt[] = [
    { label: 'Explain Simply', query: 'Explain this topic simply', mode: 'simplified', icon: '💡' },
    { label: 'Give an Example', query: 'Give me a code example', mode: 'example', icon: '💻' },
    { label: 'Give me a Hint', query: 'Give me a hint to solve this', mode: 'hint', icon: '🔑' },
    { label: 'Summarize Lesson', query: 'Summarize this lesson', mode: 'summary', icon: '📝' },
    { label: 'What to Practice?', query: 'What should I practice next?', mode: 'standard', icon: '🎯' }
  ];

  return (
    <div className="py-3 px-1 border-t border-[#ECE9E4] dark:border-slate-800" role="region" aria-label="Suggested Quick Prompts">
      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        Suggested Prompts
      </span>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset, index) => (
          <button
            key={index}
            disabled={isLoading}
            onClick={() => sendMessage(preset.query, preset.mode)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F3EE] dark:bg-slate-800 hover:bg-[#D9FAF2] dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-[#044E3A] dark:hover:text-emerald-300 text-xs font-bold border border-[#ECE9E4] dark:border-slate-700 hover:border-[#A3EAD2] dark:hover:border-emerald-700 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
          >
            <span aria-hidden="true">{preset.icon}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

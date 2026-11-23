'use client';

import React from 'react';
import { AIMessage } from '../types/ai';
import { useAiStore } from '../store/useAiStore';

interface MessageBubbleProps {
  message: AIMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { toggleSpeech, isSpeaking, speakingMessageId } = useAiStore();
  const isStudent = message.role === 'student';
  const isThisSpeaking = isSpeaking && speakingMessageId === message.id;

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 list-disc my-1">
            {line.replace(/^[•-]\s*/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-3 my-3 ${isStudent ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for AI */}
      {!isStudent && (
        <div 
          className="w-9 h-9 rounded-2xl bg-[#044E3A] dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
          aria-hidden="true"
        >
          🤖
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-xs ${
          isStudent
            ? 'bg-[#044E3A] text-white dark:bg-emerald-700 dark:text-white rounded-tr-none font-bold'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-[#ECE9E4] dark:border-slate-700 rounded-tl-none'
        }`}
      >
        {/* Mode badge if provided */}
        {message.mode && message.mode !== 'standard' && !isStudent && (
          <span className="inline-block px-2 py-0.5 mb-2 rounded-full bg-[#D9FAF2] dark:bg-emerald-950/70 text-[#044E3A] dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
            Mode: {message.mode}
          </span>
        )}

        {/* Content text */}
        <div className="space-y-1">{renderFormattedText(message.content)}</div>

        {/* Optional code block */}
        {message.codeSnippet && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{message.codeSnippet}</pre>
          </div>
        )}

        {/* Audio Listen action for AI messages */}
        {!isStudent && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <button
              onClick={() => toggleSpeech(message.id, message.content)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-hidden"
              aria-label={isThisSpeaking ? 'Stop reading AI answer' : 'Listen to AI answer read aloud'}
            >
              <span>{isThisSpeaking ? '⏹ Stop Reading' : '🔊 Listen'}</span>
            </button>

            <span className="text-[10px] text-slate-400">
              {message.timestamp}
            </span>
          </div>
        )}
      </div>

      {/* Avatar for Student */}
      {isStudent && (
        <div 
          className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
          aria-hidden="true"
        >
          👤
        </div>
      )}
    </div>
  );
};

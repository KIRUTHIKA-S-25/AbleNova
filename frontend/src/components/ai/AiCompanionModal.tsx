'use client';

import React, { useState, useEffect } from 'react';
import { useAiStore } from '@/features/ai';
import { Bot, Sparkles, X, Send, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AiCompanionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const {
    conversation,
    isLoading,
    sendMessage,
    toggleSpeech,
    isSpeaking,
    speakingMessageId,
    initializeStore
  } = useAiStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;
    setInputQuery('');
    await sendMessage(q);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="accent"
          size="large"
          className="rounded-full shadow-2xl px-5 py-4 gap-3 text-base border-2 border-emerald-300 dark:border-emerald-400 hover:scale-105 transition-transform"
          aria-label="Open AI Learning Companion Nova"
        >
          <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" aria-hidden="true" />
          <span className="font-extrabold text-slate-900 dark:text-white">Ask Nova AI</span>
        </Button>
      </div>

      {/* Floating Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 shadow-2xl rounded-3xl overflow-hidden border-2 border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-900 transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <Bot className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Nova AI Tutor</h3>
                <span className="text-xs text-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Learning Companion
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors focus:outline-hidden"
              aria-label="Close Nova AI Assistant"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Quick Prompt Badges */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => handleSend('Explain this topic simply')}
              className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full border border-emerald-300 dark:border-emerald-600 text-slate-800 dark:text-slate-200 whitespace-nowrap hover:bg-emerald-50 font-medium"
            >
              💡 Explain simply
            </button>
            <button
              onClick={() => handleSend('Give me a code example')}
              className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full border border-emerald-300 dark:border-emerald-600 text-slate-800 dark:text-slate-200 whitespace-nowrap hover:bg-emerald-50 font-medium"
            >
              💻 Code example
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950">
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs font-medium leading-relaxed ${
                    msg.role === 'student'
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.role === 'ai' && (
                    <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <button
                        onClick={() => toggleSpeech(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        <Volume2 className="w-3 h-3" aria-hidden="true" />
                        {isSpeaking && speakingMessageId === msg.id ? 'Stop' : 'Listen'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="p-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span>Nova is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Nova a question..."
              className="flex-1 text-xs py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden text-slate-900 dark:text-white"
              aria-label="Ask Nova AI question"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
              aria-label="Send question to Nova"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

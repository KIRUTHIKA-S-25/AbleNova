// src/features/quiz/components/QuestionCard.tsx

'use client';

import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { QuizQuestion } from '../types/quiz';
import { QuizAudioReader } from './QuizAudioReader';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  children: React.ReactNode;
  soundEnabled?: boolean;
  highContrast?: boolean;
  simplified?: boolean;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  children,
  soundEnabled = true,
  highContrast = false,
  simplified = false,
  className,
}) => {
  const [showHint, setShowHint] = useState(false);

  // Prepare full text narration for Web Speech API
  const audioText = `${question.question}. ${
    question.options
      ? 'The options are: ' + question.options.map((o) => o.text).join('. ')
      : question.instruction || ''
  }`;

  return (
    <article
      aria-labelledby={`question-heading-${question.id}`}
      className={cn(
        'rounded-3xl border-2 transition-all p-5 sm:p-8 space-y-6',
        highContrast
          ? 'border-slate-700 bg-black text-white'
          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
        className
      )}
    >
      {/* Header row: metadata tags + audio reader */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {question.topic}
          </span>
        </div>

        {/* Audio Narration Button */}
        <QuizAudioReader
          textToRead={audioText}
          label="Listen"
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Question Prompt */}
      <div className="space-y-2">
        <h2
          id={`question-heading-${question.id}`}
          className={cn(
            'font-black tracking-tight leading-snug',
            simplified
              ? 'text-xl sm:text-2xl'
              : 'text-2xl sm:text-3xl',
            highContrast ? 'text-white' : 'text-slate-900 dark:text-white'
          )}
        >
          {question.question}
        </h2>

        {question.instruction && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {question.instruction}
          </p>
        )}
      </div>

      {/* Interactive Options Area */}
      <div className="pt-2">{children}</div>

      {/* Optional Hint Drawer */}
      {question.hint && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg py-1 px-1.5 transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400 flex-shrink-0" />
              <span>Need a helpful hint?</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2 text-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Friendly Hint
                </span>
                <button
                  type="button"
                  onClick={() => setShowHint(false)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Hide</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                {question.hint}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

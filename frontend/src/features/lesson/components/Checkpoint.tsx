'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import type { LessonCheckpoint } from '../types/Lesson';

interface CheckpointFeedback {
  type: 'correct' | 'incorrect';
  selectedIndex: number;
}

interface CheckpointProps {
  checkpoint: LessonCheckpoint;
  feedback: CheckpointFeedback | null;
  largeTouchTargets?: boolean;
  onAnswer: (optionIndex: number, isCorrect: boolean) => void;
  onRetry: () => void;
}

export const Checkpoint: React.FC<CheckpointProps> = ({
  checkpoint,
  feedback,
  largeTouchTargets = false,
  onAnswer,
  onRetry,
}) => {
  const answered = feedback !== null;
  const isCorrect = feedback?.type === 'correct';

  const handleSelect = (index: number) => {
    if (answered) return;
    const correct = index === checkpoint.correctOptionIndex;
    onAnswer(index, correct);
  };

  const targetClass = largeTouchTargets ? 'min-h-[56px] text-base' : 'min-h-[48px] text-sm';

  return (
    <section
      className="rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6 space-y-4"
      aria-label="Interactive checkpoint"
    >
      {/* Question */}
      <div className="space-y-1">
        <span className="inline-block text-xs font-bold text-violet-500 uppercase tracking-widest mb-1">
          Quick Check
        </span>
        <p className="font-bold text-slate-800 text-base leading-snug whitespace-pre-line">
          {checkpoint.question}
        </p>
      </div>

      {/* Options */}
      <fieldset disabled={answered} className="space-y-2">
        <legend className="sr-only">Choose an answer</legend>
        {checkpoint.options.map((option, i) => {
          const isSelected = feedback?.selectedIndex === i;
          const isCorrectOption = i === checkpoint.correctOptionIndex;

          let optionStyle = 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50';
          if (answered && isSelected && isCorrect) {
            optionStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800';
          } else if (answered && isSelected && !isCorrect) {
            optionStyle = 'border-red-400 bg-red-50 text-red-800';
          } else if (answered && isCorrectOption) {
            optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-700';
          }

          return (
            <label
              key={i}
              className={cn(
                'flex items-center gap-3 w-full px-4 rounded-xl border-2 cursor-pointer transition-all',
                'focus-within:ring-2 focus-within:ring-violet-400',
                targetClass,
                optionStyle,
                answered && 'cursor-default'
              )}
            >
              <input
                type="radio"
                name={`checkpoint-${checkpoint.id}`}
                value={i}
                onChange={() => handleSelect(i)}
                disabled={answered}
                className="sr-only"
                aria-describedby={`option-${checkpoint.id}-${i}`}
              />
              {/* Custom radio circle */}
              <span
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  isSelected
                    ? answered && isCorrect
                      ? 'border-emerald-500 bg-emerald-500'
                      : answered && !isCorrect
                      ? 'border-red-500 bg-red-500'
                      : 'border-violet-500 bg-violet-500'
                    : 'border-slate-300 bg-white'
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>
              <span id={`option-${checkpoint.id}-${i}`} className="font-medium flex-1">
                {option}
              </span>
              {/* Indicator icons */}
              {answered && isSelected && isCorrect && (
                <span className="text-emerald-600 font-bold text-lg" aria-label="Correct">✓</span>
              )}
              {answered && isSelected && !isCorrect && (
                <span className="text-red-500 font-bold text-lg" aria-label="Incorrect">✗</span>
              )}
              {answered && !isSelected && isCorrectOption && (
                <span className="text-emerald-600 font-semibold text-xs">Correct answer</span>
              )}
            </label>
          );
        })}
      </fieldset>

      {/* Feedback */}
      {answered && (
        <div
          className={cn(
            'rounded-xl px-4 py-3 text-sm font-semibold',
            isCorrect
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          )}
          role="alert"
          aria-live="polite"
        >
          {isCorrect ? (
            <>
              <p className="font-extrabold text-base">🎉 Great work!</p>
              <p className="mt-0.5 font-normal text-emerald-700">
                {checkpoint.options[checkpoint.correctOptionIndex]} is the right answer.
              </p>
            </>
          ) : (
            <>
              <p className="font-extrabold text-base">Not quite — let&apos;s look at it together.</p>
              <p className="mt-0.5 font-normal text-red-700">
                The correct answer is: <strong>{checkpoint.options[checkpoint.correctOptionIndex]}</strong>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label="Try the checkpoint again"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

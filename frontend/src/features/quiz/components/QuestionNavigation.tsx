// src/features/quiz/components/QuestionNavigation.tsx

'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Bookmark, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface QuestionNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  isFlagged: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onOpenReview: () => void;
  largeTouchTargets?: boolean;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  currentIndex,
  totalQuestions,
  isFlagged,
  onPrev,
  onNext,
  onToggleFlag,
  onOpenReview,
  largeTouchTargets = false,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <nav
      aria-label="Question navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2"
    >
      {/* Flag / Mark for Review button */}
      <button
        type="button"
        onClick={onToggleFlag}
        aria-pressed={isFlagged}
        className={cn(
          'inline-flex items-center gap-2 rounded-2xl border-2 transition-all font-bold text-xs sm:text-sm select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
          largeTouchTargets ? 'px-4 py-3 min-h-[48px]' : 'px-3.5 py-2.5 min-h-[42px]',
          isFlagged
            ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600 shadow-xs'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:bg-amber-50/40'
        )}
      >
        <Bookmark
          className={cn(
            'w-4 h-4',
            isFlagged ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
          )}
          aria-hidden="true"
        />
        <span>{isFlagged ? 'Marked for Review' : 'Mark for Review'}</span>
      </button>

      {/* Prev / Next / Review Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Previous */}
        <Button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          variant="outline"
          size={largeTouchTargets ? 'large' : 'medium'}
          className={cn(
            'gap-1.5 flex-1 sm:flex-initial rounded-2xl border-2',
            isFirst && 'opacity-40 cursor-not-allowed'
          )}
          aria-label="Go to previous question"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </Button>

        {/* Next / Review */}
        {!isLast ? (
          <Button
            type="button"
            onClick={onNext}
            variant="primary"
            size={largeTouchTargets ? 'large' : 'medium'}
            className="gap-1.5 flex-1 sm:flex-initial rounded-2xl glow-mint"
            aria-label="Go to next question"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onOpenReview}
            variant="accent"
            size={largeTouchTargets ? 'large' : 'medium'}
            className="gap-2 flex-1 sm:flex-initial rounded-2xl glow-mint"
            aria-label="Review all questions and submit"
          >
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
            <span>Review & Submit</span>
          </Button>
        )}
      </div>
    </nav>
  );
};

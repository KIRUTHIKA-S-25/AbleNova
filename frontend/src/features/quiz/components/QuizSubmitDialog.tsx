// src/features/quiz/components/QuizSubmitDialog.tsx

'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuizSubmitDialogProps {
  isOpen: boolean;
  unansweredCount: number;
  totalQuestions: number;
  onClose: () => void;
  onConfirmSubmit: () => void;
  largeTouchTargets?: boolean;
}

export const QuizSubmitDialog: React.FC<QuizSubmitDialogProps> = ({
  isOpen,
  unansweredCount,
  totalQuestions,
  onClose,
  onConfirmSubmit,
  largeTouchTargets = false,
}) => {
  // Trap escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 relative">
        {/* Close icon button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close submit confirmation dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            {unansweredCount > 0 ? (
              <AlertCircle className="w-6 h-6 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            )}
          </div>

          <h2
            id="submit-dialog-title"
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
          >
            {unansweredCount > 0 ? 'Review Unanswered Questions?' : 'Ready to finish practice?'}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {unansweredCount > 0 ? (
              <>
                You still have <strong className="text-amber-600 dark:text-amber-400">{unansweredCount}</strong> of{' '}
                {totalQuestions} questions without an answer. You can go back and complete them or submit anyway.
              </>
            ) : (
              'All questions have been answered! Submit your practice to see your score and helpful explanations.'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size={largeTouchTargets ? 'large' : 'medium'}
            className="flex-1 rounded-2xl"
          >
            Continue Reviewing
          </Button>

          <Button
            type="button"
            onClick={onConfirmSubmit}
            variant={unansweredCount > 0 ? 'secondary' : 'accent'}
            size={largeTouchTargets ? 'large' : 'medium'}
            className="flex-1 rounded-2xl glow-mint"
          >
            {unansweredCount > 0 ? 'Submit Anyway' : 'Submit Practice'}
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '@/utils/cn';

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 6,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full flex flex-col gap-2 items-center text-center select-none">
      <div className="flex items-center justify-between w-full max-w-xl px-2">
        <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {percentage}% Completed
        </span>
      </div>

      {/* Visual Step Indicator Dots */}
      <div
        className="flex items-center gap-2"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Onboarding Progress: Step ${currentStep} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className={cn(
                'h-3 rounded-full transition-all duration-300',
                isCurrent
                  ? 'w-10 bg-teal-500 dark:bg-yellow-400 shadow-md glow-mint'
                  : isCompleted
                  ? 'w-4 bg-teal-300 dark:bg-teal-700'
                  : 'w-3 bg-slate-200 dark:bg-slate-800'
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

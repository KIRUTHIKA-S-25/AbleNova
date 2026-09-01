import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  label?: string;
  showText?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ value, label = 'Progress', showText = true, className, ...props }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn('w-full space-y-2', className)} {...props}>
      <div className="flex justify-between items-center text-sm font-bold">
        <span>{label}</span>
        {showText && <span>{percentage}%</span>}
      </div>
      <div
        className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-700 p-0.5"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentage}%`}
      >
        <div
          className="h-full bg-blue-600 dark:bg-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

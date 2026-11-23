import React from 'react';
import { cn } from '@/utils/cn';

export interface LoadingStateProps {
  label?: string;
  size?: 'normal' | 'large';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading content, please wait...',
  size = 'normal',
  className,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn('flex flex-col items-center justify-center p-8 gap-4 text-center', className)}
    >
      <div
        className={cn(
          'border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-yellow-400 rounded-full animate-spin',
          size === 'normal' ? 'w-10 h-10 border-4' : 'w-16 h-16 border-6'
        )}
        aria-hidden="true"
      />
      <p className="font-semibold text-base text-slate-800 dark:text-slate-200 tracking-wide">
        {label}
      </p>
    </div>
  );
};

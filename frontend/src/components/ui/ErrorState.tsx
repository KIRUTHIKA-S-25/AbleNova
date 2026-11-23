import React from 'react';
import { cn } from '@/utils/cn';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not load this content right now. Please check your internet connection or try again.',
  onRetry,
  retryLabel = 'Try Again',
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 rounded-2xl gap-4',
        className
      )}
    >
      <div className="p-3 bg-red-100 dark:bg-red-900/60 rounded-2xl text-red-600 dark:text-red-300">
        <AlertOctagon className="w-10 h-10" aria-hidden="true" />
      </div>
      <div className="max-w-md flex flex-col gap-1">
        <h3 className="text-xl font-bold text-red-950 dark:text-red-100">{title}</h3>
        <p className="text-base text-red-800 dark:text-red-200">{message}</p>
      </div>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-5 h-5" aria-hidden="true" />
          <span>{retryLabel}</span>
        </Button>
      )}
    </div>
  );
};

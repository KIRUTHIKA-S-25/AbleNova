import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  hint?: string;
  errorMessage?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id: customId, hint, errorMessage, fullWidth = true, className, ...props }, ref) => {
    const generatedId = React.useId();
    const id = customId || generatedId;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = errorMessage ? `${id}-error` : undefined;
    const ariaDescribedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label htmlFor={id} className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
            {label}
            {props.required && <span className="text-red-600 font-bold ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        {hint && (
          <p id={hintId} className="text-sm text-slate-600 dark:text-slate-300">
            {hint}
          </p>
        )}

        <input
          ref={ref}
          id={id}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!!errorMessage}
          className={cn(
            'min-h-[48px] px-4 py-3 text-base rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
            'transition-colors focus-visible:outline-none disabled:opacity-50 disabled:bg-slate-100',
            errorMessage
              ? 'border-red-600 focus-visible:ring-red-600'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400',
            className
          )}
          {...props}
        />

        {errorMessage && (
          <div id={errorId} role="alert" className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold mt-1">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

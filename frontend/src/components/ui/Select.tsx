import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options?: SelectOption[];
  hint?: string;
  errorMessage?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, options, hint, errorMessage, fullWidth = true, className, children, ...props }, ref) => {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = errorMessage ? `${id}-error` : undefined;
    const ariaDescribedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth ? 'w-full' : 'w-auto')}>
        <label htmlFor={id} className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
          {label}
          {props.required && <span className="text-red-600 font-bold ml-1" aria-hidden="true">*</span>}
        </label>

        {hint && (
          <p id={hintId} className="text-sm text-slate-600 dark:text-slate-300">
            {hint}
          </p>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-describedby={ariaDescribedBy}
            aria-invalid={!!errorMessage}
            className={cn(
              'w-full min-h-[48px] pl-4 pr-10 py-3 text-base rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer',
              'transition-colors focus-visible:outline-none disabled:opacity-50 disabled:bg-slate-100',
              errorMessage
                ? 'border-red-600 focus-visible:ring-red-600'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-500" aria-hidden="true" />
        </div>

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

Select.displayName = 'Select';

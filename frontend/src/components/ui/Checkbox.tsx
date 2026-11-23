import React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  hint?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, hint, className, checked, disabled, onChange, ...props }, ref) => {
    const hintId = hint ? `${id}-hint` : undefined;

    return (
      <div className="flex items-start gap-3 select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-describedby={hintId}
            className={cn(
              'peer appearance-none w-6 h-6 rounded-lg border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer',
              'checked:bg-blue-600 checked:border-blue-600 dark:checked:bg-yellow-400 dark:checked:border-yellow-400',
              'focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          <Check
            className="w-4 h-4 text-white dark:text-black absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor={id}
            className={cn(
              'font-medium text-base text-slate-900 dark:text-slate-100 cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
          {hint && (
            <p id={hintId} className="text-sm text-slate-600 dark:text-slate-300">
              {hint}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

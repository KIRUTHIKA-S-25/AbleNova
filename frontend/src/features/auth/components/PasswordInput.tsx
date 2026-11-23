import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  hint?: string;
  errorMessage?: string;
  fullWidth?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, id, hint, errorMessage, fullWidth = true, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

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

        <div className="relative flex items-center">
          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            aria-describedby={ariaDescribedBy}
            aria-invalid={!!errorMessage}
            className={cn(
              'w-full min-h-[48px] pl-4 pr-12 py-3 text-base rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
              'transition-colors focus-visible:outline-none disabled:opacity-50 disabled:bg-slate-100',
              errorMessage
                ? 'border-red-600 focus-visible:ring-red-600'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400',
              className
            )}
            {...props}
          />
          <IconButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            ariaLabel={showPassword ? 'Hide password' : 'Show password'}
            icon={showPassword ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-slate-500" />}
            className="absolute right-2"
          />
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

PasswordInput.displayName = 'PasswordInput';

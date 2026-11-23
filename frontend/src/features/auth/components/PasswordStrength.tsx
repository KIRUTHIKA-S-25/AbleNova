import React from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, Circle } from 'lucide-react';

export interface PasswordRequirement {
  id: string;
  label: string;
  isMet: boolean;
}

export interface PasswordStrengthProps {
  passwordValue: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  passwordValue,
  className,
}) => {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      isMet: passwordValue.length >= 8,
    },
    {
      id: 'number',
      label: 'Contains a number (0-9)',
      isMet: /[0-9]/.test(passwordValue),
    },
    {
      id: 'uppercase',
      label: 'Contains an uppercase letter (A-Z)',
      isMet: /[A-Z]/.test(passwordValue),
    },
    {
      id: 'special',
      label: 'Contains a special character (!@#$%^&*)',
      isMet: /[^a-zA-Z0-9]/.test(passwordValue),
    },
  ];

  const metCount = requirements.filter((r) => r.isMet).length;
  const scorePercent = Math.round((metCount / requirements.length) * 100);

  return (
    <div
      role="region"
      aria-label="Password Strength Checklist"
      className={cn('flex flex-col gap-2 p-3 bg-slate-100 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs select-none', className)}
    >
      <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
        <span>Password Requirements</span>
        <span>{metCount} of 4 met ({scorePercent}%)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={cn(
              'flex items-center gap-1.5 font-medium transition-colors',
              req.isMet
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {req.isMet ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

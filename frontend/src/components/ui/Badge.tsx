import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'info' | 'success' | 'warning' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, children, variant = 'info', ...props }) => {
  const variants = {
    info: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-cyan-300 dark:border-cyan-500',
    success: 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500',
    warning: 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500',
    neutral: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border-2 tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

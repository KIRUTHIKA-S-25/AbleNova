import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, children, variant = 'info', ...props }) => {
  const variants = {
    primary: 'bg-[#D9FAF2] text-[#044E3A] border-[#A3EAD2] dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
    secondary: 'bg-[#F1EAFB] text-[#6D28D9] border-[#E5D9FA] dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700',
    info: 'bg-[#DCEFFF] text-[#1E40AF] border-[#BFDBFE] dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
    success: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0] dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
    warning: 'bg-[#FFF0B8] text-[#92400E] border-[#FDE68A] dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700',
    error: 'bg-[#FFE5D6] text-[#991B1B] border-[#FECACA] dark:bg-red-950 dark:text-red-300 dark:border-red-700',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border tracking-wide select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

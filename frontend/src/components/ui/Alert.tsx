import React from 'react';
import { cn } from '@/utils/cn';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
  ...props
}) => {
  const isPolite = variant === 'info' || variant === 'success';
  const role = isPolite ? 'status' : 'alert';

  const config = {
    info: {
      container: 'bg-blue-50 border-blue-400 text-blue-950 dark:bg-blue-950/80 dark:border-blue-500 dark:text-blue-100',
      icon: <Info className="w-6 h-6 text-blue-600 dark:text-cyan-300 shrink-0" aria-hidden="true" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-400 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-100',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-300 shrink-0" aria-hidden="true" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-400 text-amber-950 dark:bg-amber-950/80 dark:border-amber-500 dark:text-amber-100',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-300 shrink-0" aria-hidden="true" />,
    },
    error: {
      container: 'bg-red-50 border-red-500 text-red-950 dark:bg-red-950/80 dark:border-red-500 dark:text-red-100',
      icon: <XCircle className="w-6 h-6 text-red-600 dark:text-red-300 shrink-0" aria-hidden="true" />,
    },
  };

  return (
    <div
      role={role}
      className={cn(
        'p-4 rounded-xl border-2 flex items-start gap-3 shadow-sm',
        config[variant].container,
        className
      )}
      {...props}
    >
      {config[variant].icon}
      <div className="flex-1 flex flex-col gap-1">
        {title && <h4 className="font-bold text-base tracking-wide">{title}</h4>}
        <div className="text-base font-normal">{children}</div>
      </div>
    </div>
  );
};

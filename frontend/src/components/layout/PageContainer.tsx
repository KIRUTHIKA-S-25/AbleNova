import React from 'react';
import { cn } from '@/utils/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            {title && <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h1>}
            {subtitle && <p className="text-base text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

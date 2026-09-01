import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highContrastBorder?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, highContrastBorder = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 shadow-md border-2 border-slate-200 dark:border-slate-800 transition-all',
          highContrastBorder && 'border-[3px] border-blue-600 dark:border-yellow-400',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

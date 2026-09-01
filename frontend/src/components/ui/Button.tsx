import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold tracking-wide transition-all focus-visible:ring-4 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-sm rounded-xl cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-yellow-400 dark:hover:bg-yellow-300 dark:text-black border-2 border-transparent',
        secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border-2 border-slate-300 dark:border-slate-600',
        accent: 'bg-amber-500 hover:bg-amber-600 text-black font-extrabold border-2 border-amber-600',
        outline: 'bg-transparent border-[3px] border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-950',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100',
        danger: 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-700',
      },
      size: {
        normal: 'min-h-[48px] px-6 py-3 text-base',
        large: 'min-h-[56px] px-8 py-4 text-lg',
        icon: 'min-h-[48px] min-w-[48px] p-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'normal',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ariaLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ariaLabel, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

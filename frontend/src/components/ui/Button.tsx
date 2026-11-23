import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold tracking-wide transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] rounded-full cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#044E3A] hover:bg-[#033b2c] text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-700',
        accent: 'bg-[#A3EAD2] hover:bg-[#8be0c5] text-[#044E3A] font-extrabold',
        outline: 'bg-white hover:bg-slate-50 border border-[#ECE9E4] text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      size: {
        normal: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
        medium: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
        small: 'min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5',
        large: 'min-h-[52px] px-7 py-3.5 text-base gap-2.5',
        icon: 'min-h-[44px] min-w-[44px] p-2.5 text-base justify-center',
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
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ariaLabel, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        aria-label={ariaLabel}
        aria-disabled={disabled || isLoading}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="inline-block w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

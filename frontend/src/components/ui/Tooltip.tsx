import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  text: string;
  children: React.ReactElement<{
    'aria-describedby'?: string;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
    onFocus?: React.FocusEventHandler;
    onBlur?: React.FocusEventHandler;
  }>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top',
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipId = `tooltip-${text.toLowerCase().replace(/\s+/g, '-')}`;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const childProps = {
    'aria-describedby': visible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      setVisible(true);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      setVisible(false);
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      setVisible(true);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      setVisible(false);
    },
  };

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, childProps)}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm font-semibold text-white bg-slate-900 dark:bg-yellow-400 dark:text-black rounded-lg shadow-lg whitespace-nowrap border border-slate-700 pointer-events-none',
            positionClasses[position],
            className
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
};

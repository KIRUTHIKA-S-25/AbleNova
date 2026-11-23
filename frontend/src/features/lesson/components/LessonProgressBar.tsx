'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface LessonProgressBarProps {
  value: number; // 0–100
  label?: string;
  sectionLabel?: string;
  className?: string;
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  value,
  label = 'Lesson progress',
  sectionLabel,
  className,
}) => {
  const pct = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
        <span>{label}</span>
        <span className="text-cyan-600 font-bold">{pct}%</span>
      </div>

      <div
        className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #06b6d4, #818cf8)',
          }}
        />
      </div>

      {sectionLabel && (
        <p className="text-xs text-slate-500 font-medium">{sectionLabel}</p>
      )}
    </div>
  );
};

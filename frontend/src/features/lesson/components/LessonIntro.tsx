'use client';

import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { LessonObjective } from '../types/Lesson';

interface LessonIntroProps {
  title: string;
  description: string;
  objectives: LessonObjective[];
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  simplified?: boolean;
  className?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const LessonIntro: React.FC<LessonIntroProps> = ({
  title,
  description,
  objectives,
  durationMinutes,
  difficulty,
  simplified = false,
  className,
}) => {
  const simplifiedDesc = simplified
    ? description.split('.')[0] + '.'
    : description;

  return (
    <header
      className={cn(
        'rounded-2xl overflow-hidden border border-slate-200 shadow-sm',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #eff6ff 100%)',
      }}
    >
      {/* Gradient bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #06b6d4, #818cf8, #34d399)' }}
        aria-hidden="true"
      />

      <div className="p-6 sm:p-8 space-y-5">
        {/* Meta row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border',
              DIFFICULTY_COLORS[difficulty]
            )}
          >
            <Zap className="w-3 h-3" aria-hidden="true" />
            {difficulty}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {durationMinutes} min
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {title}
        </h1>

        {/* Description */}
        <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
          {simplifiedDesc}
        </p>

        {/* Objectives */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            You&apos;ll learn:
          </h2>
          <ul className="space-y-2" aria-label="Learning objectives">
            {objectives.map((obj) => (
              <li
                key={obj.id}
                className="flex items-start gap-2 text-slate-700 text-sm font-medium"
              >
                <span
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{obj.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

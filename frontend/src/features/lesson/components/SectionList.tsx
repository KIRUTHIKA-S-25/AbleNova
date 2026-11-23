'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SectionListProps {
  sections: { id: string; title: string }[];
  currentSectionId: string;
  completedSectionIds: string[];
  onSelect: (index: number) => void;
  className?: string;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  currentSectionId,
  completedSectionIds,
  onSelect,
  className,
}) => {
  return (
    <nav
      aria-label="Lesson sections"
      className={cn('space-y-1', className)}
    >
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
        Sections
      </p>
      <ol className="space-y-1">
        {sections.map((section, i) => {
          const isCompleted = completedSectionIds.includes(section.id);
          const isCurrent = section.id === currentSectionId;

          return (
            <li key={section.id}>
              <button
                onClick={() => onSelect(i)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  isCurrent
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold'
                    : isCompleted
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-500 hover:bg-slate-50'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${section.title}${isCompleted ? ' (completed)' : ''}`}
              >
                <span className="flex-shrink-0" aria-hidden="true">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle
                      className={cn(
                        'w-4 h-4',
                        isCurrent ? 'text-cyan-500' : 'text-slate-300'
                      )}
                    />
                  )}
                </span>
                <span className="flex-1 leading-snug">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

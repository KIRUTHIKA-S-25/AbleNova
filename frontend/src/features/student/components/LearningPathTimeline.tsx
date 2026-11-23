'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LearningPathStep } from '@/types/studentDashboard';
import { CheckCircle2, PlayCircle, Lock, ArrowRight, Flag } from 'lucide-react';

interface LearningPathTimelineProps {
  steps: LearningPathStep[];
}

export const LearningPathTimeline: React.FC<LearningPathTimelineProps> = ({ steps }) => {
  return (
    <Card className="p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 space-y-6 bg-white dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="bg-teal-700 text-white">
              Visual Progression
            </Badge>
            <Badge variant="secondary">Python Basics Path</Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Your Learning Path</span>
            <Flag className="w-6 h-6 text-teal-600 dark:text-yellow-400" aria-hidden="true" />
          </h2>
        </div>

        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 w-fit">
          Step 4 of 6 Active
        </span>
      </div>

      {/* Horizontal / Vertical Timeline */}
      <div className="relative pt-2" role="region" aria-label="Learning Path Steps">
        <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isLocked = step.status === 'locked';

            let borderClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500';
            if (isCompleted) {
              borderClass = 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200';
            } else if (isCurrent) {
              borderClass = 'border-teal-500 dark:border-yellow-400 bg-teal-50 dark:bg-teal-950/40 text-slate-900 dark:text-white ring-4 ring-teal-400/20 dark:ring-yellow-400/20 font-bold';
            }

            return (
              <li
                key={step.id}
                className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-3 ${borderClass}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-current flex items-center justify-center text-xs font-extrabold shadow-xs">
                      {step.stepNumber}
                    </span>

                    {isCompleted && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Done
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="primary" className="gap-1 text-xs bg-teal-700 text-white animate-pulse">
                        <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" /> Current
                      </Badge>
                    )}
                    {isLocked && (
                      <Badge variant="secondary" className="gap-1 text-xs text-slate-500">
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Locked
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>

                {isCurrent && (
                  <Link href="/lessons/lesson_001">
                    <Button size="small" variant="primary" className="w-full justify-center text-xs font-bold gap-1 mt-1 shadow-md">
                      <span>Start Step</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};

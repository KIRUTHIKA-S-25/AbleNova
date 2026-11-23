'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface LessonSkeletonProps {
  className?: string;
}

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-lg bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]',
      className
    )}
    aria-hidden="true"
  />
);

export const LessonSkeleton: React.FC<LessonSkeletonProps> = ({ className }) => (
  <div
    className={cn('space-y-6 w-full', className)}
    aria-label="Loading lesson content..."
    aria-busy="true"
    role="status"
  >
    {/* Header skeleton */}
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
      <div className="flex gap-2">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      <Shimmer className="h-9 w-3/4" />
      <Shimmer className="h-5 w-full" />
      <Shimmer className="h-5 w-5/6" />
      <div className="space-y-2 pt-2">
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-5 w-2/3" />
        <Shimmer className="h-5 w-1/2" />
        <Shimmer className="h-5 w-3/5" />
      </div>
    </div>

    {/* Progress skeleton */}
    <Shimmer className="h-10 w-full rounded-xl" />

    {/* Content skeleton */}
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <Shimmer className="h-7 w-2/5" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-11/12" />
      <Shimmer className="h-4 w-4/5" />
      <Shimmer className="h-24 w-full rounded-xl" />
      <Shimmer className="h-4 w-full" />
    </div>

    {/* Navigation skeleton */}
    <div className="flex justify-between gap-4">
      <Shimmer className="h-12 w-32 rounded-xl" />
      <Shimmer className="h-12 w-36 rounded-xl" />
    </div>

    {/* Screen reader text */}
    <span className="sr-only">Loading lesson content, please wait.</span>
  </div>
);

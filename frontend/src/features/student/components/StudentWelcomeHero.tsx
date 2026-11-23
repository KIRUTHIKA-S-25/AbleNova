'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PlayCircle, Compass, Flame } from 'lucide-react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

interface StudentWelcomeHeroProps {
  studentName: string;
  streakDays: number;
  gradeLabel: string;
  onContinueClick?: () => void;
  onExploreClick?: () => void;
}

export const StudentWelcomeHero: React.FC<StudentWelcomeHeroProps> = ({
  studentName,
  streakDays,
  gradeLabel,
  onContinueClick,
  onExploreClick,
}) => {
  const { reducedMotion } = useAccessibilityStore();

  return (
    <section
      aria-label="Welcome Overview"
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-[#ECE9E4] dark:border-slate-800 p-6 sm:p-8 shadow-xs"
    >
      {/* Subtle decorative blobs */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#9FF2DF]/30 blur-3xl pointer-events-none ${
          reducedMotion ? '' : 'animate-pulse'
        }`}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 right-16 w-32 h-32 rounded-full bg-[#BFEAF5]/30 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* Streak badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0B8] border border-[#FDE68A] text-amber-800 text-xs font-extrabold">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" aria-hidden="true" />
              {streakDays} Day Learning Streak! 🔥
            </div>

            {/* Grade badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFFF] border border-[#BFDBFE] text-[#1E40AF] text-xs font-extrabold">
              {gradeLabel}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Good day, <span className="text-[#044E3A] dark:text-emerald-400">{studentName}!</span> 👋
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Ready to learn something new today? You have 4 personalized activities waiting for you!
          </p>
        </div>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Link href="/lessons/lesson_001" className="w-full sm:w-auto">
            <Button
              onClick={onContinueClick}
              size="large"
              variant="primary"
              className="w-full justify-center gap-2.5 font-extrabold"
            >
              <PlayCircle className="w-5 h-5" aria-hidden="true" />
              <span>Continue Learning</span>
            </Button>
          </Link>

          <Link href="/lessons" className="w-full sm:w-auto">
            <Button
              onClick={onExploreClick}
              size="large"
              variant="outline"
              className="w-full justify-center gap-2 font-bold"
            >
              <Compass className="w-5 h-5" aria-hidden="true" />
              <span>Explore Learning</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

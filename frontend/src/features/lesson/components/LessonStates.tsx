'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface LessonErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const LessonError: React.FC<LessonErrorProps> = ({ onRetry, className }) => (
  <main
    className={cn(
      'flex flex-col items-center justify-center text-center space-y-6 py-20 px-4',
      className
    )}
    role="alert"
    aria-label="Lesson load error"
  >
    <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
      <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
    </div>

    <div className="space-y-2">
      <h1 className="text-2xl font-extrabold text-slate-900">Lesson Unavailable</h1>
      <p className="text-slate-500 max-w-sm">
        We couldn&apos;t open this lesson right now. Please try again or go back to your learning path.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          aria-label="Try loading the lesson again"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </Button>
      )}
      <Link href="/student">
        <Button variant="outline" aria-label="Return to your learning dashboard">
          ← Back to Learning
        </Button>
      </Link>
    </div>
  </main>
);

interface LessonEmptyProps {
  className?: string;
}

export const LessonEmpty: React.FC<LessonEmptyProps> = ({ className }) => (
  <main
    className={cn(
      'flex flex-col items-center justify-center text-center space-y-6 py-20 px-4',
      className
    )}
    aria-label="Empty lesson"
  >
    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-4xl">
      📚
    </div>

    <div className="space-y-2">
      <h1 className="text-2xl font-extrabold text-slate-900">This Lesson is Getting Ready</h1>
      <p className="text-slate-500 max-w-sm">
        Content for this lesson is coming soon. Head back to explore other topics.
      </p>
    </div>

    <Link href="/student">
      <Button variant="primary" aria-label="Go back to learning dashboard">
        ← Back to Learning
      </Button>
    </Link>
  </main>
);

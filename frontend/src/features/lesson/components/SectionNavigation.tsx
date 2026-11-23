'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface SectionNavigationProps {
  currentIndex: number;
  totalSections: number;
  canPrevious: boolean;
  canNext: boolean;
  isLastSection: boolean;
  largeTouchTargets?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  className?: string;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  currentIndex,
  totalSections,
  canPrevious,
  canNext,
  isLastSection,
  largeTouchTargets = false,
  onPrevious,
  onNext,
  onFinish,
  className,
}) => {
  const buttonSize = largeTouchTargets ? 'large' : 'normal';

  return (
    <nav
      className={cn(
        'flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200',
        className
      )}
      aria-label="Lesson section navigation"
    >
      {/* Previous */}
      <Button
        variant="outline"
        size={buttonSize}
        onClick={onPrevious}
        disabled={!canPrevious}
        aria-label="Go to previous section"
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        Previous
      </Button>

      {/* Section counter */}
      <span className="text-sm text-slate-500 font-medium order-first sm:order-none">
        Section {currentIndex + 1} of {totalSections}
      </span>

      {/* Next / Finish */}
      {isLastSection ? (
        <Button
          variant="success"
          size={buttonSize}
          onClick={onFinish}
          aria-label="Finish lesson"
          className="w-full sm:w-auto"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #818cf8)',
            border: 'none',
          }}
        >
          Finish Lesson ✨
        </Button>
      ) : (
        <Button
          variant="primary"
          size={buttonSize}
          onClick={onNext}
          disabled={!canNext}
          aria-label="Go to next section"
          className="w-full sm:w-auto"
          style={
            canNext
              ? { background: 'linear-gradient(135deg, #06b6d4, #818cf8)', border: 'none' }
              : {}
          }
        >
          Continue
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </Button>
      )}
    </nav>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href="/student"
        className="flex items-center gap-1 text-slate-500 hover:text-cyan-600 transition-colors font-medium"
        aria-label="Back to learning dashboard"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-slate-500 hover:text-cyan-600 transition-colors font-medium truncate max-w-[140px]"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-slate-800 font-semibold truncate max-w-[180px]"
              aria-current={i === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface BackToLearningProps {
  courseTitle: string;
  href?: string;
}

export const BackToLearning: React.FC<BackToLearningProps> = ({
  courseTitle,
  href = '/student',
}) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors group"
      aria-label={`Back to ${courseTitle}`}
    >
      <BookOpen className="w-4 h-4" aria-hidden="true" />
      <span className="group-hover:underline">{courseTitle}</span>
    </Link>
  );
};

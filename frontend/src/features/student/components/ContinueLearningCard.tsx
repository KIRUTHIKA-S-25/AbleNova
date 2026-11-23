'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { PlayCircle, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

interface ContinueLearningCardProps {
  topicName: string;
  subjectName: string;
  progressPercentage: number;
  lastActiveLabel: string;
  onContinueClick?: () => void;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  topicName,
  subjectName,
  progressPercentage,
  lastActiveLabel,
  onContinueClick,
}) => {
  return (
    <Card className="p-6 sm:p-8 border-2 border-teal-400 dark:border-yellow-400 bg-gradient-to-r from-white via-teal-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-xl space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="bg-teal-700 text-white font-bold">
              Current Active Topic
            </Badge>
            <Badge variant="secondary" className="bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {subjectName}
            </Badge>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Last active: {lastActiveLabel}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-teal-600 dark:text-yellow-400 shrink-0" aria-hidden="true" />
            <span>{topicName}</span>
          </h2>

          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            You were learning how variables store numbers and words in memory. You are almost finished with this topic!
          </p>

          {/* Accessible Progress Section */}
          <div className="space-y-2 max-w-md pt-2">
            <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200">
              <span>Topic Progress</span>
              <span className="text-teal-700 dark:text-yellow-400 font-extrabold text-base">
                {progressPercentage}% Complete
              </span>
            </div>

            <Progress
              value={progressPercentage}
              label={`${subjectName} ${topicName} progress`}
              showText={false}
            />

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span>3 of 4 activities completed in this topic</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="w-full lg:w-auto shrink-0">
          <Link href="/learn/python-basics/variables" className="w-full block">
            <Button
              onClick={onContinueClick}
              size="large"
              variant="primary"
              className="w-full lg:w-auto justify-center gap-3 px-8 shadow-xl glow-mint font-extrabold text-lg"
            >
              <PlayCircle className="w-6 h-6" aria-hidden="true" />
              <span>Continue Lesson</span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PracticeRecommendation } from '@/types/studentDashboard';
import { Sparkles, ArrowRight, Eye, Volume2, Puzzle, BookOpen, Clock } from 'lucide-react';

interface PersonalizedRecommendationsProps {
  recommendations: PracticeRecommendation[];
  userStyles?: string[];
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  recommendations,
  userStyles = ['visual', 'interactive'],
}) => {
  const getStyleIcon = (style: PracticeRecommendation['matchingPreference']) => {
    switch (style) {
      case 'visual':
        return <Eye className="w-4 h-4 text-teal-600 dark:text-yellow-400" aria-hidden="true" />;
      case 'audio':
        return <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />;
      case 'interactive':
        return <Puzzle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />;
      case 'reading':
        return <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />;
    }
  };

  return (
    <section aria-labelledby="recommended-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 id="recommended-heading" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Recommended for You</span>
            <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-400" aria-hidden="true" />
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Personalized based on your onboarding learning preferences: {userStyles.join(', ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommendations.map((rec) => (
          <Card
            key={rec.id}
            className="p-6 border-2 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-yellow-400 transition-all flex flex-col justify-between gap-5 bg-white dark:bg-slate-900 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="primary" className="gap-1.5 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 font-bold">
                  {getStyleIcon(rec.matchingPreference)}
                  <span>{rec.badgeLabel}</span>
                </Badge>

                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {rec.estimatedMinutes} min
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-teal-700 dark:text-yellow-400 uppercase tracking-wider block">
                  {rec.subject}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-yellow-400 transition-colors leading-snug">
                  {rec.title}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-200/60 dark:border-slate-700 text-xs font-semibold text-teal-900 dark:text-teal-200">
                ✨ Reason: {rec.reason}
              </div>
            </div>

            <Link href="/lessons/lesson_001">
              <Button size="medium" variant="secondary" className="w-full justify-center gap-2 font-bold group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-yellow-400 dark:group-hover:text-black transition-colors">
                <span>Try Recommendation</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
};

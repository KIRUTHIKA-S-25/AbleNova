'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PracticeSkillSuggestion } from '@/types/studentDashboard';
import { Lightbulb, ArrowRight, Clock } from 'lucide-react';

interface PracticeSuggestionsProps {
  suggestions: PracticeSkillSuggestion[];
}

export const PracticeSuggestions: React.FC<PracticeSuggestionsProps> = ({ suggestions }) => {
  return (
    <section aria-labelledby="strengthen-skills-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="strengthen-skills-heading" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>Let&apos;s strengthen these skills</span>
          <Lightbulb className="w-6 h-6 text-amber-500 fill-amber-400" aria-hidden="true" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {suggestions.map((item) => (
          <Card
            key={item.id}
            className="p-6 border-2 border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-white via-amber-50/20 to-orange-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 hover:border-amber-400 transition-all flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{item.iconEmoji}</span>
                  <Badge variant="primary" className="bg-amber-500 text-black border-amber-600 font-bold">
                    {item.subject}
                  </Badge>
                </div>

                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {item.estimatedMinutes} mins
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.topicName}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-1 font-medium">
                  {item.encouragingMessage}
                </p>
              </div>
            </div>

            <Link href="/quizzes/quiz_001">
              <Button size="medium" variant="outline" className="w-full justify-center gap-2 border-2 border-amber-600 text-amber-900 dark:border-amber-400 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950 font-bold">
                <span>Practice Skill</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
};

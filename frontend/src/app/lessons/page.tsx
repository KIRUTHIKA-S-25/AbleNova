'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { BookOpen, Search, PlayCircle, HelpCircle, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import { MOCK_LESSONS } from '@/lib/mock';

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredLessons = MOCK_LESSONS.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || lesson.topic_id.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  return (
    <AppShell>
      <div className="space-y-8 py-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#A3EAD2] text-[#044E3A] font-extrabold px-3 py-1 border-none">
              Interactive Library
            </Badge>
            <Badge className="bg-slate-100 text-slate-700 font-bold border border-slate-200">
              WCAG AAA Accessible
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Accessible Learning Lessons
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl font-medium">
            Choose a lesson below. All lessons adapt to your text size, simplified reading mode, and audio narration preferences!
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons by topic (e.g. Variables, Loops)..."
              className="pl-10 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              aria-label="Search lessons"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-[#044E3A] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedSubject('sub_001')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === 'sub_001'
                  ? 'bg-[#044E3A] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Math & Code
            </button>
            <button
              onClick={() => setSelectedSubject('sub_002')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                selectedSubject === 'sub_002'
                  ? 'bg-[#044E3A] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Science & Web
            </button>
          </div>
        </div>

        {/* Lessons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="p-6 rounded-3xl border border-[#ECE9E4] dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between gap-6 group bg-white dark:bg-slate-900"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#D1FAE5] text-[#047857] font-bold border-none text-xs">
                    {lesson.difficulty.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    ⏱️ {lesson.estimated_minutes} Minutes
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#044E3A] dark:group-hover:text-emerald-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 line-clamp-3 leading-relaxed font-medium">
                    {lesson.content.simplified}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/learn/math-101/lesson-1`} className="flex-1">
                  <Button size="normal" className="w-full justify-center gap-2 rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white font-extrabold text-xs">
                    <PlayCircle className="w-4 h-4" aria-hidden="true" />
                    Open Lesson
                  </Button>
                </Link>
                <Link href={`/learn/math-101/lesson-1/quiz`}>
                  <Button size="normal" variant="outline" className="gap-2 rounded-full font-bold text-xs">
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                    Quiz
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AiCompanionModal />
    </AppShell>
  );
}

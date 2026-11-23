'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import {
  Play,
  Compass,
  Sparkles,
  BarChart2,
  Volume2,
  Clock,
  Puzzle,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  Award,
  Zap,
  Flame,
  Target,
  Heart,
  Bot,
  ArrowRight,
  X,
  VolumeX,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [isCalmBreakOpen, setIsCalmBreakOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Web Speech API for "Listen to Page"
  const handleListenToPage = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const text =
        "Good morning, Alex! You are currently on your AbleNova Student Dashboard. You have a 5-day learning streak. Your most recent lesson is For Loops & Repetition in Python Fundamentals. You are 72% completed with your overall course. You're only 7 lessons away from your Bronze Certificate!";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-8 text-slate-900 dark:text-slate-100">
        {/* 1. HERO GREETING SECTION */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Good morning, Alex! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-base sm:text-lg">
              Ready to continue your coding adventure today?
            </p>

            {/* Action Chips / Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFEDD5] text-[#C2410C] text-xs font-black">
                <Flame className="w-4 h-4 fill-current text-[#F97316]" />
                <span>5 Day Learning Streak</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CFFAFE] text-[#0E7490] text-xs font-black">
                <Target className="w-4 h-4 text-[#06B6D4]" />
                <span>Level: Python Explorer (Grade 5)</span>
              </div>

              <button
                onClick={handleListenToPage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                aria-label="Listen to Page text aloud"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-emerald-600 animate-pulse" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                <span>{isSpeaking ? 'Stop Reading' : 'Listen to Page'}</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#047857] text-xs font-black">
                <Zap className="w-4 h-4 text-[#10B981]" />
                <span>Low-Bandwidth Mode: Active (Fast & Light)</span>
              </div>
            </div>
          </div>

          {/* Top Right Calm Break Button */}
          <div>
            <button
              onClick={() => setIsCalmBreakOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] font-black text-sm transition-transform active:scale-95 shadow-xs cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current text-[#8B5CF6]" />
              <span>🧘 2-Min Calm Break</span>
            </button>
          </div>
        </div>

        {/* 2. TOP 4 QUICK ACTION CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Continue */}
          <Link href="/learn/math-101/lesson-1" className="group focus-visible:outline-none">
            <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center font-bold">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Continue</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Resume Python Loops where you stopped
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-[#059669] group-hover:gap-2 transition-all">
                <span>Resume Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          {/* Card 2: Explore */}
          <Link href="/lessons" className="group focus-visible:outline-none">
            <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Explore</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Discover 14 interactive topics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-[#0284C7] group-hover:gap-2 transition-all">
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          {/* Card 3: Ask AI Buddy */}
          <Link href="/ai-assistant" className="group focus-visible:outline-none">
            <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Ask AI Buddy</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Instant child-friendly voice hints
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-[#9333EA] group-hover:gap-2 transition-all">
                <span>Chat with Nova</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          {/* Card 4: My Progress */}
          <Link href="/progress" className="group focus-visible:outline-none">
            <Card className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-[#CFFAFE] text-[#0891B2] flex items-center justify-center font-bold">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">My Progress</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    See your badges & quiz reports
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-extrabold text-[#0891B2] group-hover:gap-2 transition-all">
                <span>View Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>
        </div>

        {/* 3. MAIN DASHBOARD CONTENT (2 COLUMN GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: MAIN CONTENT (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* FEATURED ACTIVE LESSON BANNER */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#E8F6F2] via-[#EEFAF7] to-[#F5FCFA] dark:from-emerald-950/40 dark:to-slate-900 border border-[#BCE8DC] dark:border-emerald-800 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#A3EAD2] text-[#044E3A] font-extrabold text-xs px-3 py-1 border-none">
                    Most Recent Lesson
                  </Badge>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">• Python Fundamentals</span>
                </div>
                <button
                  onClick={handleListenToPage}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#044E3A] dark:text-emerald-300 hover:underline"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-snug">
                  For Loops & Repetition
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                  Learn how to make your computer repeat fun actions automatically without typing them twice! Build repeat patterns for games and visual art.
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#044E3A] dark:text-emerald-400" />
                    Lesson Progress
                  </span>
                  <span className="text-[#044E3A] dark:text-emerald-400">72% Completed</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#044E3A] dark:bg-emerald-400 rounded-full transition-all duration-500 w-[72%]" />
                </div>
              </div>

              {/* Sub Info Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~8 mins left
                </span>
                <span className="flex items-center gap-1">
                  <Volume2 className="w-4 h-4" />
                  Audio narration ready
                </span>
                <span className="flex items-center gap-1">
                  <Puzzle className="w-4 h-4" />
                  Interactive puzzle included
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/learn/math-101/lesson-1">
                  <Button className="rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white font-extrabold text-sm px-6 py-3 shadow-sm gap-2">
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/learn/math-101/lesson-1">
                  <Button variant="outline" className="rounded-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm px-5 py-3">
                    Review Notes
                  </Button>
                </Link>
              </div>
            </div>

            {/* MY LEARNING PATHS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">My Learning Paths</h2>
                <Link href="/lessons" className="text-xs font-extrabold text-[#044E3A] dark:text-emerald-400 hover:underline flex items-center gap-1">
                  <span>View All Courses (6)</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {/* Course 1 */}
                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center font-bold flex-shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Python Fundamentals</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        18 / 25 lessons completed • Grade 5 Level
                      </p>
                      <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#044E3A] dark:bg-emerald-400 rounded-full w-[72%]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">72%</span>
                    <Link href="/learn/math-101/lesson-1">
                      <Button size="small" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-2">
                        Continue →
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Course 2 */}
                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold flex-shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Web Basics (HTML & Colors)</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        12 / 20 lessons completed • Creative Web Design
                      </p>
                      <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#0284C7] rounded-full w-[60%]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">60%</span>
                    <Link href="/lessons">
                      <Button size="small" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-2">
                        Continue →
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Course 3 */}
                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center font-bold flex-shrink-0">
                      <Puzzle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Data & Logic Basics</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        8 / 20 lessons completed • Computational Thinking
                      </p>
                      <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#9333EA] rounded-full w-[40%]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">40%</span>
                    <Link href="/lessons">
                      <Button size="small" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-2">
                        Continue →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>

            {/* RECOMMENDED FOR YOU CARD */}
            <div className="p-6 rounded-3xl bg-[#F3E8FF] dark:bg-purple-950/40 border border-[#E9D5FF] dark:border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-200/70 dark:bg-purple-900/60 px-2.5 py-1 rounded-md">
                  RECOMMENDED FOR YOU
                </span>
                <h3 className="text-lg font-black text-purple-950 dark:text-purple-100">
                  Continue For Loops & Repetition
                </h3>
                <p className="text-xs text-purple-800 dark:text-purple-200 max-w-lg leading-relaxed font-medium">
                  You started this lesson yesterday and did great on the first two challenges. Finish this one to unlock your "Loop Master" badge!
                </p>
              </div>
              <Link href="/learn/math-101/lesson-1">
                <Button className="rounded-full bg-white dark:bg-slate-900 hover:bg-purple-50 text-purple-900 dark:text-purple-200 font-extrabold text-xs px-5 py-2.5 shadow-xs whitespace-nowrap">
                  Resume Lesson →
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: SECONDARY WIDGETS (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            {/* YOUR PROGRESS CARD */}
            <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Your Progress</h2>
                <BarChart2 className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Circular Ring Graphic */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#044E3A] dark:text-emerald-400"
                      strokeDasharray="72, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-lg font-black text-slate-900 dark:text-white">72%</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Overall Course</h3>
                  <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">18 of 25 Lessons Done</p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    On Track for Certificate
                  </span>
                </div>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⭐ AVG QUIZ</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">82%</span>
                  <span className="text-[10px] font-bold text-emerald-600 block">High Accuracy</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚡ STREAK</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">5 Days</span>
                  <span className="text-[10px] font-bold text-amber-600 block">Personal Best</span>
                </div>
              </div>

              {/* Certificate Banner Callout */}
              <div className="p-3.5 bg-[#D1FAE5]/60 dark:bg-emerald-950/40 rounded-2xl border border-[#A3EAD2] dark:border-emerald-800 flex items-center gap-3">
                <Award className="w-6 h-6 text-[#044E3A] dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs font-bold text-[#044E3A] dark:text-emerald-300 leading-snug">
                  You're only 7 lessons away from your Bronze Certificate!
                </p>
              </div>
            </Card>

            {/* LEARNING FOCUS CARD */}
            <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Learning Focus</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Personalized insights based on your recent puzzles
                </p>
              </div>

              {/* Topics to Practice */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  🎯 Topics to Practice
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
                    Functions <RotateCcw className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
                    Nested Loops <RotateCcw className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </div>

              {/* You're Strong In */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  ⭐ You're Strong In
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-[#A3EAD2]/50 text-[#044E3A] dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    Variables & Types <CheckCircle2 className="w-3 h-3" />
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-[#A3EAD2]/50 text-[#044E3A] dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    Conditions & If-Else <CheckCircle2 className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Practice hint */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-900 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Reviewing functions takes just 5 minutes with AI Buddy before your quiz!</span>
              </div>
            </Card>

            {/* RECENT ACTIVITY FEED */}
            <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Activity</h2>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3.5 text-xs font-medium">
                {/* Item 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#047857] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">Completed "Variables in Python"</p>
                    <span className="text-[11px] text-slate-400">Yesterday</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#047857] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">Scored 85% in "Python Basics Quiz"</p>
                    <span className="text-[11px] text-slate-400">2 days ago</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">Started "For Loops & Repetition"</p>
                    <span className="text-[11px] text-slate-400">3 days ago</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">Asked AI Buddy about Functions</p>
                    <span className="text-[11px] text-slate-400">3 days ago</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* NEED HELP UNDERSTANDING CARD */}
            <Card className="p-6 rounded-3xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-[#BFDBFE] dark:border-blue-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-200/70 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-blue-950 dark:text-blue-100">
                  Need help understanding?
                </h3>
              </div>
              <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
                Child-friendly & patient explanations... ask AI Buddy or read your lessons out loud.
              </p>
              <Link href="/ai-assistant">
                <Button className="w-full justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 mt-1">
                  Chat with AI Buddy
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* 4. CALM BREAK SENSORY MODAL */}
        {isCalmBreakOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-200 dark:border-purple-800 relative">
              <button
                onClick={() => setIsCalmBreakOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto text-2xl animate-pulse">
                  🧘
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">2-Minute Calm Break</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Take a slow, deep breath in... and let it out softly.
                </p>
              </div>

              {/* Animated Breath Visualizer */}
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-300 via-purple-400 to-indigo-300 dark:from-purple-800 dark:to-indigo-900 flex items-center justify-center animate-ping opacity-75">
                  <span className="text-xs font-black text-purple-950 dark:text-purple-100">Breathe</span>
                </div>
              </div>

              <Button
                onClick={() => setIsCalmBreakOpen(false)}
                className="w-full justify-center rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3"
              >
                I'm Ready to Resume Learning ✨
              </Button>
            </div>
          </div>
        )}

        <AiCompanionModal />
      </div>
    </AppShell>
  );
}

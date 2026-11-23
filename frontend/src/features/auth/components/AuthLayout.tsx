import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ShieldCheck, BookOpen, Sparkles, HeartHandshake, Award } from 'lucide-react';

export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: AbleNova Branding & Educational Showcase */}
        <div className="lg:col-span-6 flex flex-col gap-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#ECE9E4] dark:border-slate-800 shadow-xs">
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit focus-visible:outline-none rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-[#044E3A] text-white flex items-center justify-center font-black text-lg">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                AbleNova
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Accessible Personalized Learning</p>
            </div>
          </Link>

          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3EAD2] text-[#044E3A] text-xs font-extrabold">
              ✨ Personalized Learning Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug text-slate-900 dark:text-white">
              Learning That Adapts <br />
              <span className="text-[#044E3A] dark:text-emerald-400">To YOU.</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Your personalized learning journey with custom font sizes, contrast modes, speech support, and adaptive practice challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#ECE9E4] dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#047857]" aria-hidden="true" />
              </div>
              <span>Adaptive Lessons</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-[#F1EAFB] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#9333EA]" aria-hidden="true" />
              </div>
              <span>AI Learning Companion</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-[#DCEFFF] flex items-center justify-center">
                <HeartHandshake className="w-4 h-4 text-[#1E40AF]" aria-hidden="true" />
              </div>
              <span>Accessible Controls</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              <div className="w-7 h-7 rounded-lg bg-[#FFF0B8] flex items-center justify-center">
                <Award className="w-4 h-4 text-[#92400E]" aria-hidden="true" />
              </div>
              <span>Gamified Badges</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card Form */}
        <div className="lg:col-span-6 w-full flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center lg:text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

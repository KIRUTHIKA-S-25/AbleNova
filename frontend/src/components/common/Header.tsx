'use client';

import React from 'react';
import Link from 'next/link';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HeartHandshake, Wifi, WifiOff, UserCheck, BookOpen, BarChart3, Bot } from 'lucide-react';

export const Header: React.FC = () => {
  const { isOnline } = useOfflineSync();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b-2 border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:ring-4 focus-visible:outline-none rounded-xl p-1"
          aria-label="AbleNova Home Page"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-yellow-400 text-white dark:text-black flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
            AN
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              AbleNova
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-yellow-950 dark:text-yellow-300 font-bold px-2 py-0.5 rounded-full border border-blue-300 dark:border-yellow-500">
                Accessible AI
              </span>
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold hidden sm:block">
              Inclusive Learning Platform
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="normal" className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-yellow-400" />
              <span>Student Dashboard</span>
            </Button>
          </Link>
          <Link href="/progress">
            <Button variant="ghost" size="normal" className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
              <span>Progress</span>
            </Button>
          </Link>
          <Link href="/ai-assistant">
            <Button variant="ghost" size="normal" className="flex items-center gap-2 text-sm">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>AI Tutor</span>
            </Button>
          </Link>
          <Link href="/teacher">
            <Button variant="ghost" size="normal" className="flex items-center gap-2 text-sm">
              <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Teacher</span>
            </Button>
          </Link>
        </nav>

        {/* Network & Account Controls */}
        <div className="flex items-center gap-3">
          {/* Online/Offline Network Status Indicator */}
          <Badge variant={isOnline ? 'success' : 'warning'} className="hidden sm:inline-flex items-center gap-1.5 py-1 px-3">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Offline Mode</span>
              </>
            )}
          </Badge>

          <Link href="/onboarding">
            <Button variant="primary" size="normal" className="flex items-center gap-2 text-sm">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Accessibility Setup</span>
              <span className="sm:hidden">Setup</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

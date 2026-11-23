'use client';

import React from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';

export default function AuthWelcomePage() {
  return (
    <AuthLayout
      title="Welcome to AbleNova"
      subtitle="The accessible, AI-powered learning platform built for every child."
    >
      <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center items-center flex flex-col gap-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-100 dark:bg-slate-800 text-teal-600 dark:text-yellow-400 flex items-center justify-center shadow-lg glow-mint">
          <ShieldCheck className="w-9 h-9" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Start Your Learning Journey
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Choose an option below to sign in to your existing account or register a new learner profile.
          </p>
        </div>

        <CardContent className="w-full space-y-4 p-0 pt-2">
          <Link href="/login" className="block w-full">
            <Button size="large" variant="primary" className="w-full shadow-lg glow-mint gap-2">
              <LogIn className="w-5 h-5" aria-hidden="true" />
              <span>Log In</span>
            </Button>
          </Link>

          <Link href="/signup" className="block w-full">
            <Button size="large" variant="outline" className="w-full gap-2 border-2 border-teal-500 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800">
              <UserPlus className="w-5 h-5" aria-hidden="true" />
              <span>Create Account</span>
            </Button>
          </Link>

          <Link href="/onboarding" className="block w-full pt-2">
            <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Preview Accessibility Onboarding First</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

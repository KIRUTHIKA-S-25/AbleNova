'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { mockAuthService } from '../services/mockAuthService';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Mail, RefreshCw, Sparkles, Edit3 } from 'lucide-react';

export const EmailVerificationCard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [cooldown, setCooldown] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const targetEmail = user?.email || 'alex.student@ablenova.local';

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    setNotification(null);

    try {
      const res = await mockAuthService.resendVerificationEmail(targetEmail);
      setNotification(res.message);
      setCooldown(30);
    } catch {
      setNotification('Failed to resend verification email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <CardContent className="space-y-6 p-0 text-center items-center flex flex-col">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-slate-800 text-teal-600 dark:text-yellow-400 flex items-center justify-center shadow-md">
          <Mail className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Almost There! ✨
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            We sent a verification link to <strong className="text-slate-900 dark:text-white font-bold">{targetEmail}</strong>.
          </p>
        </div>

        {notification && (
          <Alert variant="info" title="Verification Email Sent">
            {notification}
          </Alert>
        )}

        <div className="w-full space-y-3 pt-2">
          <Button
            variant="outline"
            size="large"
            onClick={handleResend}
            disabled={cooldown > 0 || isSending}
            isLoading={isSending}
            loadingText="Resending..."
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>
              {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
            </span>
          </Button>

          <Link href="/signup" className="block w-full">
            <Button variant="ghost" className="w-full gap-2 text-slate-600 dark:text-slate-400">
              <Edit3 className="w-4 h-4" aria-hidden="true" />
              <span>Change Email Address</span>
            </Button>
          </Link>

          <Button
            variant="accent"
            size="large"
            onClick={() => router.push('/protected-demo')}
            className="w-full shadow-lg glow-mint gap-2 mt-4"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span>Continue to AbleNova</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

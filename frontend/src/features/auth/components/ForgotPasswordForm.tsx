'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/authSchemas';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { requestPasswordReset, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearError();
    const msg = await requestPasswordReset(data.email);
    if (msg) {
      setSuccessMessage(msg);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <CardContent className="space-y-5 p-0">
        {error && (
          <Alert variant="error" title="Password Reset Error">
            {error}
          </Alert>
        )}

        {successMessage ? (
          <div className="space-y-4 text-center py-2">
            <Alert variant="success" title="Check Your Email ✨">
              {successMessage}
            </Alert>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              If you don&apos;t see the email within a few minutes, please check your spam folder.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Return to Log In</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="forgot-email"
              label="Email Address"
              type="email"
              placeholder="e.g. alex.student@ablenova.local"
              autoComplete="email"
              required
              errorMessage={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full shadow-lg glow-mint gap-2"
              isLoading={isLoading}
              loadingText="Sending reset link..."
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              <span>Send Reset Link</span>
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-yellow-400 underline focus-visible:outline-none"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};


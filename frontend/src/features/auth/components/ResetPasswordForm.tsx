'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/authSchemas';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { KeyRound, Sparkles } from 'lucide-react';

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    const success = await resetPassword(data.password);
    if (success) {
      setIsSuccess(true);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <CardContent className="space-y-5 p-0">
        {error && (
          <Alert variant="error" title="Reset Error">
            {error}
          </Alert>
        )}

        {isSuccess ? (
          <div className="space-y-5 text-center py-2">
            <Alert variant="success" title="Password Updated! ✨">
              Your password has been updated successfully. You can now use your new password to log in.
            </Alert>
            <div className="pt-2">
              <Button
                variant="accent"
                size="large"
                className="w-full shadow-lg glow-mint gap-2"
                onClick={() => router.push('/login')}
              >
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Continue to Log In</span>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <PasswordInput
              id="reset-password"
              label="New Password"
              placeholder="Enter your new password"
              autoComplete="new-password"
              required
              errorMessage={errors.password?.message}
              {...register('password')}
            />

            <PasswordStrength passwordValue={passwordValue} />

            <PasswordInput
              id="reset-confirm-password"
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              required
              errorMessage={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full shadow-lg glow-mint gap-2 mt-2"
              isLoading={isLoading}
              loadingText="Updating password..."
            >
              <KeyRound className="w-5 h-5" aria-hidden="true" />
              <span>Reset Password</span>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

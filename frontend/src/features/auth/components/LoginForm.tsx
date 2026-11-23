'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';
import { PasswordInput } from './PasswordInput';
import { LogIn, Sparkles, UserCheck } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, loginAsDemoUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  // Removed watch usage and rememberMeValue; checkbox uses register directly
  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data);
    if (success) {
      router.push('/protected-demo');
    }
  };

  const handleDemoClick = () => {
    loginAsDemoUser();
    router.push('/protected-demo');
  };

  return (
    <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <CardContent className="space-y-5 p-0">
        {error && (
          <Alert variant="error" title="Sign In Error">
            {error}
          </Alert>
        )}

        {/* Quick Demo Login Option */}
        <div className="bg-teal-50 dark:bg-slate-800 p-3 rounded-2xl border border-teal-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300">
            <UserCheck className="w-4 h-4" aria-hidden="true" />
            <span>Try Demo Account</span>
          </div>
          <Button variant="accent" size="normal" onClick={handleDemoClick} className="py-1 px-3 text-xs gap-1">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Demo Student</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="e.g. alex.student@ablenova.local"
            autoComplete="email"
            required
            errorMessage={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            id="login-password"
            label="Password"

            placeholder="Enter your password"
            autoComplete="current-password"
            required
            errorMessage={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              id="remember-me"
              label="Remember me"
              {...register('rememberMe')}
            />

            <Link
              href="/forgot-password"
              className="text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-400 dark:hover:text-yellow-400 underline focus-visible:outline-none"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full shadow-lg glow-mint gap-2"
            isLoading={isLoading}
            loadingText="Logging in..."
          >
            <LogIn className="w-5 h-5" aria-hidden="true" />
            <span>Log In</span>
          </Button>
        </form>

        <div className="text-center pt-2 text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-bold text-teal-700 hover:text-teal-900 dark:text-yellow-400 underline focus-visible:outline-none"
          >
            Create one here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

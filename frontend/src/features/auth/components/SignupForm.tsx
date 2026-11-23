'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '../schemas/authSchemas';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { UserPlus, Sparkles } from 'lucide-react';

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const { register: registerAuth, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      role: 'student',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data: SignupFormData) => {
    clearError();
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const success = await registerAuth({
      name: fullName,
      email: data.email,
      password: data.password,
      role: data.role,
    });
    if (success) {
      router.push('/verify-email');
    }
  };

  return (
    <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      <CardContent className="space-y-5 p-0">
        {error && (
          <Alert variant="error" title="Sign Up Error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="signup-first-name"
              label="First Name"
              placeholder="e.g. Alex"
              autoComplete="given-name"
              required
              errorMessage={errors.firstName?.message}
              {...register('firstName')}
            />

            <Input
              id="signup-last-name"
              label="Last Name"
              placeholder="e.g. River"
              autoComplete="family-name"
              required
              errorMessage={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            id="signup-email"
            label="Email Address"
            type="email"
            placeholder="e.g. alex.student@ablenova.local"
            autoComplete="email"
            required
            errorMessage={errors.email?.message}
            {...register('email')}
          />

          <Select
            id="signup-role"
            label="I am joining AbleNova as a:"
            hint="Select your primary role to customize your experience."
            required
            errorMessage={errors.role?.message}
            options={[
              { value: 'student', label: 'Student / Learner' },
              { value: 'teacher', label: 'Teacher / Educator' },
              { value: 'caregiver', label: 'Parent / Caregiver' },
            ]}
            {...register('role')}
          />

          <PasswordInput
            id="signup-password"
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
            errorMessage={errors.password?.message}
            {...register('password')}
          />

          {/* Password Strength Component */}
          <PasswordStrength passwordValue={passwordValue} />

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm Password"
            placeholder="Re-enter your password"
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
            loadingText="Creating account..."
          >
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            <span>Create Account</span>
          </Button>
        </form>

        <div className="text-center pt-2 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-teal-700 hover:text-teal-900 dark:text-yellow-400 underline focus-visible:outline-none"
          >
            Log in here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

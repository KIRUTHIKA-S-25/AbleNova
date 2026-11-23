'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your AbleNova account to continue your personalized learning."
    >
      <LoginForm />
    </AuthLayout>
  );
}

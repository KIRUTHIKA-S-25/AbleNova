'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { EmailVerificationCard } from '@/features/auth/components/EmailVerificationCard';

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Please verify your email address to activate your account."
    >
      <EmailVerificationCard />
    </AuthLayout>
  );
}

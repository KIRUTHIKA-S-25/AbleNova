'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { SignupForm } from '@/features/auth/components/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join AbleNova and unlock accessible, adaptive education tailored to you."
    >
      <SignupForm />
    </AuthLayout>
  );
}

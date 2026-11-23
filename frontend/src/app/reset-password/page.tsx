'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Choose a new strong password to secure your AbleNova account."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

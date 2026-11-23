'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Your Password?"
      subtitle="Enter your email address and we'll help you get back into AbleNova."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

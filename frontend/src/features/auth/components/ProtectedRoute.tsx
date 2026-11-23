'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingState } from '@/components/ui/LoadingState';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackUrl = '/login',
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, initAuthFromStorage } = useAuthStore();

  useEffect(() => {
    initAuthFromStorage();
  }, [initAuthFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, isLoading, fallbackUrl, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState label="Verifying access permissions..." />
      </div>
    );
  }

  return <>{children}</>;
};

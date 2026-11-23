'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const { initializeFromStorage } = useAccessibilityStore();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>{children}</AccessibilityProvider>
    </QueryClientProvider>
  );
}

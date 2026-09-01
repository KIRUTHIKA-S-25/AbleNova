'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { ScreenReaderAnnouncement } from '@/components/accessibility/ScreenReaderAnnouncement';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <ScreenReaderAnnouncement />
        <Header />
        <main id="main-content" className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

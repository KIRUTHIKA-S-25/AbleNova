'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AccessibilityBar } from '@/components/accessibility/AccessibilityBar';
import { ScreenReaderAnnouncement } from '@/components/accessibility/ScreenReaderAnnouncement';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { MainContent } from './MainContent';
import {
  useNetworkStatus,
  usePwaStore,
  NetworkStatusIndicator,
  InstallPromptBanner,
  SyncStatusModal
} from '@/features/pwa';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const isOnline = useNetworkStatus();
  const { setOnlineState, initializePwaStore, setDeferredInstallEvent } = usePwaStore();

  useEffect(() => {
    initializePwaStore();

    // Register Service Worker in browser
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration skipped or not supported:', err);
      });

      // Capture beforeinstallprompt event
      const handleInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredInstallEvent(e);
      };

      window.addEventListener('beforeinstallprompt', handleInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }
  }, [initializePwaStore, setDeferredInstallEvent]);

  useEffect(() => {
    setOnlineState(isOnline);
  }, [isOnline, setOnlineState]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EE] dark:bg-slate-950 text-[#1F2933] dark:text-slate-100 transition-colors">
      {/* Dynamic Screen Reader Announcement Region */}
      <ScreenReaderAnnouncement />

      {/* Floating Accessibility Bar */}
      <AccessibilityBar />

      {/* Main Top Header */}
      <Header />

      {/* Mobile Navigation Drawer */}
      <MobileNavigation />

      {/* Main Body Area: Sidebar + Content */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        <Sidebar />
        <MainContent>
          {/* PWA Install Banner */}
          <InstallPromptBanner />

          {/* Network Status Header Bar */}
          <div className="flex justify-end mb-4">
            <NetworkStatusIndicator />
          </div>

          {children}
        </MainContent>
      </div>

      {/* Sync Status Drawer Modal */}
      <SyncStatusModal />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { AccessibilityQuickControl } from '@/components/accessibility/AccessibilityQuickControl';
import { Wifi, WifiOff, Menu, ShieldCheck, UserCheck, LogIn, LogOut, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { isOnline } = useOfflineSync();
  const { toggleMobileMenu, activeRoleView } = useUiStore();
  const { isAuthenticated, user, logout, initAuthFromStorage } = useAuthStore();

  useEffect(() => {
    initAuthFromStorage();
  }, [initAuthFromStorage]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-[#ECE9E4] dark:border-slate-800">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <IconButton
            icon={<Menu className="w-5 h-5" />}
            ariaLabel="Open navigation menu"
            variant="ghost"
            className="md:hidden"
            onClick={toggleMobileMenu}
          />

          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none rounded-xl p-1"
            aria-label="AbleNova Home Page"
          >
            <div className="w-9 h-9 rounded-xl bg-[#044E3A] text-white flex items-center justify-center font-black text-sm">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                AbleNova
              </span>
            </div>
          </Link>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Status - compact pill */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            isOnline
              ? 'bg-[#D1FAE5] text-[#047857]'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" aria-hidden="true" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" aria-hidden="true" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Low-Bandwidth Mode badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D9FAF2] text-[#044E3A] text-xs font-bold">
            <span>Low-Bandwidth Mode Active</span>
          </div>

          {/* Accessibility Quick Popover Control */}
          <AccessibilityQuickControl />

          {/* Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/protected-demo">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-200 transition-colors">
                  <User className="w-3 h-3" aria-hidden="true" />
                  <span className="hidden md:inline">{user?.name}</span>
                </div>
              </Link>
              <IconButton
                icon={<LogOut className="w-4 h-4" />}
                ariaLabel="Log out"
                variant="ghost"
                size="icon"
                onClick={logout}
              />
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="small" className="gap-1.5 text-xs font-bold">
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Log In</span>
              </Button>
            </Link>
          )}

          {/* Active Role Indicator */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1EAFB] text-[#6D28D9] text-xs font-bold capitalize">
            <UserCheck className="w-3 h-3" aria-hidden="true" />
            <span>{activeRoleView}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { User, Sliders, LogOut, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const DashboardProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { fontSize } = useAccessibilityStore();

  const studentName = user?.name || 'Alex Johnson';
  const studentEmail = user?.email || 'alex.student@ablenova.edu';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Profile Menu"
        className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400"
      >
        <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-yellow-400 text-white dark:text-black flex items-center justify-center font-black text-sm shadow-xs">
          {studentName.charAt(0)}
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white hidden md:inline-block max-w-[120px] truncate">
          {studentName}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 hidden md:inline-block" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* User Details */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 dark:bg-yellow-400 text-white dark:text-black flex items-center justify-center font-black text-base shadow-sm">
              {studentName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {studentName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {studentEmail}
              </p>
              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 dark:bg-yellow-950 dark:text-yellow-300">
                Student Account
              </span>
            </div>
          </div>

          {/* Menu Links */}
          <div className="space-y-1 text-sm font-semibold">
            <Link
              href="/accessibility"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Sliders className="w-4 h-4 text-teal-600 dark:text-yellow-400" aria-hidden="true" />
              <span>Accessibility Setup</span>
            </Link>

            <Link
              href="/accessibility"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              variant="outline"
              size="normal"
              className="w-full justify-center gap-2 text-xs font-bold border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

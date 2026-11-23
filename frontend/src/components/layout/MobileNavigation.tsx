import React, { useEffect } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { Navigation } from './Navigation';
import { IconButton } from '../ui/IconButton';
import { X, ShieldCheck } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { mobileMenuOpen, setMobileMenuOpen, activeRoleView, setActiveRoleView } = useUiStore();

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  if (!mobileMenuOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-slate-900/80 backdrop-blur-xs md:hidden"
      onClick={() => setMobileMenuOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        onClick={(e) => e.stopPropagation()}
        className="w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 border-r-4 border-blue-600 dark:border-yellow-400 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-blue-600 dark:text-yellow-400 font-black text-xl">
              <ShieldCheck className="w-7 h-7" aria-hidden="true" />
              <span>AbleNova</span>
            </div>
            <IconButton
              icon={<X className="w-6 h-6" />}
              ariaLabel="Close mobile menu"
              variant="ghost"
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role View (Demo Switcher)
            </span>
            <div className="flex gap-1">
              {(['student', 'teacher', 'caregiver'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRoleView(role)}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg capitalize transition-colors ${
                    activeRoleView === role
                      ? 'bg-blue-600 text-white dark:bg-yellow-400 dark:text-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <Navigation orientation="vertical" onItemClick={() => setMobileMenuOpen(false)} />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
          AbleNova Accessibility Architecture v1.0
        </div>
      </div>
    </div>
  );
};

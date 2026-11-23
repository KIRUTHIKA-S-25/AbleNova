import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { Navigation } from './Navigation';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, activeRoleView, setActiveRoleView } = useUiStore();

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={cn(
        'hidden md:flex flex-col justify-between border-r border-[#ECE9E4] dark:border-slate-800 bg-[#F5F3EB] dark:bg-slate-900 transition-all duration-300 z-20 p-4',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Toggle Collapse Button */}
        <div className={cn('flex items-center', sidebarOpen ? 'justify-between' : 'justify-center')}>
          {sidebarOpen && (
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </span>
          )}
          <IconButton
            icon={sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            ariaLabel={sidebarOpen ? 'Collapse sidebar menu' : 'Expand sidebar menu'}
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          />
        </div>

        {/* Role View Selector for Demo */}
        {sidebarOpen ? (
          <div className="bg-white/80 dark:bg-slate-800 p-3 rounded-2xl flex flex-col gap-2 border border-[#ECE9E4] dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <UserCheck className="w-4 h-4 text-[#044E3A] dark:text-emerald-400" aria-hidden="true" />
              <span>Role View (Demo Mode)</span>
            </div>
            <div className="flex gap-1">
              {(['student', 'teacher', 'caregiver'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRoleView(role)}
                  className={cn(
                    'flex-1 py-1.5 px-2 text-xs font-bold rounded-xl capitalize transition-colors focus-visible:outline-none cursor-pointer',
                    activeRoleView === role
                      ? 'bg-[#044E3A] text-white dark:bg-emerald-600 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Navigation Items */}
        <Navigation orientation="vertical" />
      </div>

      {sidebarOpen && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
          AbleNova Design System
        </div>
      )}
    </aside>
  );
};

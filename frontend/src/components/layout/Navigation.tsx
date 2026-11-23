import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  TrendingUp,
  Bot,
  Sliders,
  Settings,
  Users,
  ClipboardList,
  BarChart3,
  Activity
} from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const getNavItemsForRole = (role: 'student' | 'teacher' | 'caregiver'): NavItem[] => {
  if (role === 'teacher') {
    return [
      { label: 'Teacher Dashboard', href: '/teacher', icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Learners Roster', href: '/teacher/students', icon: <Users className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Assignments', href: '/teacher/assignments', icon: <ClipboardList className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Class Analytics', href: '/teacher/analytics', icon: <BarChart3 className="w-5 h-5" aria-hidden="true" /> },
      { label: 'AI Assistant', href: '/ai-assistant', icon: <Bot className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Accessibility', href: '/accessibility', icon: <Sliders className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" aria-hidden="true" /> },
    ];
  }

  if (role === 'caregiver') {
    return [
      { label: 'Caregiver Portal', href: '/caregiver', icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Learner Progress', href: '/caregiver/progress', icon: <TrendingUp className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Recent Activity', href: '/caregiver/learner', icon: <Activity className="w-5 h-5" aria-hidden="true" /> },
      { label: 'AI Companion', href: '/ai-assistant', icon: <Bot className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Accessibility', href: '/accessibility', icon: <Sliders className="w-5 h-5" aria-hidden="true" /> },
      { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" aria-hidden="true" /> },
    ];
  }

  // Student Navigation matching reference design
  return [
    { label: 'Dashboard', href: '/student', icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> },
    { label: 'My Lessons', href: '/lessons', icon: <BookOpen className="w-5 h-5" aria-hidden="true" /> },
    { label: 'My Quizzes', href: '/quizzes', icon: <FileCheck className="w-5 h-5" aria-hidden="true" /> },
    { label: 'My Progress', href: '/progress', icon: <TrendingUp className="w-5 h-5" aria-hidden="true" /> },
    { label: 'AI Buddy', href: '/ai-assistant', icon: <Bot className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Accessibility', href: '/accessibility', icon: <Sliders className="w-5 h-5" aria-hidden="true" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" aria-hidden="true" /> },
  ];
};

export const Navigation: React.FC<{ orientation?: 'vertical' | 'horizontal'; onItemClick?: () => void }> = ({
  orientation = 'vertical',
  onItemClick,
}) => {
  const pathname = usePathname();
  const { activeRoleView } = useUiStore();
  const navItems = getNavItemsForRole(activeRoleView);

  return (
    <nav
      aria-label="Main Navigation"
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col gap-2 w-full' : 'flex-row items-center gap-4'
      )}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/student' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all',
              'focus-visible:outline-none select-none',
              isActive
                ? 'bg-[#A3EAD2] text-[#044E3A] dark:bg-emerald-600 dark:text-white shadow-xs font-extrabold'
                : 'text-slate-700 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

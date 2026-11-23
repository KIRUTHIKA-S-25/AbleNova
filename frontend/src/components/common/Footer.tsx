import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Accessibility, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-t border-[#ECE9E4] dark:border-slate-800 mt-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#044E3A] text-white flex items-center justify-center font-black text-xs">
              AN
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">AbleNova</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md leading-relaxed">
            AI-powered personalized learning platform engineered specifically for children with disabilities in remote and underserved communities.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Accessibility className="w-3.5 h-3.5 text-[#044E3A] dark:text-emerald-400" /> WCAG AAA
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#044E3A] dark:text-emerald-400" /> Offline Ready
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#044E3A] dark:text-emerald-400" /> Low-Bandwidth
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-3 text-sm tracking-wider uppercase">User Portals</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/student" className="hover:text-[#044E3A] dark:hover:text-emerald-400 transition-colors">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/onboarding" className="hover:text-[#044E3A] dark:hover:text-emerald-400 transition-colors">
                Accessibility Setup
              </Link>
            </li>
            <li>
              <Link href="/teacher" className="hover:text-[#044E3A] dark:hover:text-emerald-400 transition-colors">
                Teacher Hub
              </Link>
            </li>
            <li>
              <Link href="/caregiver" className="hover:text-[#044E3A] dark:hover:text-emerald-400 transition-colors">
                Caregiver Overview
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-3 text-sm tracking-wider uppercase">Accessibility</h3>
          <ul className="space-y-2 text-sm">
            <li>Screen Reader Compatible</li>
            <li>High Contrast (AAA)</li>
            <li>Dyslexia-Friendly Fonts</li>
            <li>Text-to-Speech Built-in</li>
            <li>Keyboard Navigable</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto pt-6 border-t border-[#ECE9E4] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
        <p>© 2026 AbleNova Platform. Built for inclusive global education.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> for learners everywhere.
        </p>
      </div>
    </footer>
  );
};

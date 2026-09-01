import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Accessibility, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-2 border-slate-800 mt-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-xl">
              AN
            </div>
            <span className="text-2xl font-black text-white">AbleNova</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            AI-powered personalized learning platform engineered specifically for children with disabilities in remote and underserved communities. Accessibility first, personalization second, education third.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Accessibility className="w-4 h-4 text-yellow-400" /> WCAG 2.1 AAA Ready
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Offline Capable
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-cyan-400" /> Low-Bandwidth Optimized
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3 text-base tracking-wider uppercase">User Portals</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/dashboard" className="hover:text-yellow-400 transition-colors">
                Student Dashboard
              </Link>
            </li>
            <li>
              <Link href="/onboarding" className="hover:text-yellow-400 transition-colors">
                Accessibility Setup
              </Link>
            </li>
            <li>
              <Link href="/teacher" className="hover:text-yellow-400 transition-colors">
                Teacher Hub
              </Link>
            </li>
            <li>
              <Link href="/caregiver" className="hover:text-yellow-400 transition-colors">
                Caregiver Overview
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3 text-base tracking-wider uppercase">Accessibility</h3>
          <ul className="space-y-2 text-sm">
            <li>Screen Reader Compatible</li>
            <li>High Contrast (AAA)</li>
            <li>Dyslexia-Friendly Fonts</li>
            <li>Text-to-Speech Built-in</li>
            <li>Keyboard Navigable</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 AbleNova Platform. Built for inclusive global education.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for learners everywhere.
        </p>
      </div>
    </footer>
  );
};

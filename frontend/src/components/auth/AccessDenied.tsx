'use client';

import React from 'react';
import Link from 'next/link';

interface AccessDeniedProps {
  requiredRole?: string;
  userRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole = 'authorized', userRole }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center text-3xl mx-auto" aria-hidden="true">
          🔒
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Access Restricted
        </h1>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          This portal requires <strong className="text-slate-900 dark:text-white capitalize">{requiredRole}</strong> role permissions.
          {userRole && ` You are currently viewing as ${userRole}.`}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/student"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
          >
            Return to Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

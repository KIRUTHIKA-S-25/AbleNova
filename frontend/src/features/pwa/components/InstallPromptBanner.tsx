'use client';

import React from 'react';
import { usePwaStore } from '../store/usePwaStore';

export const InstallPromptBanner: React.FC = () => {
  const { isInstallPromptVisible, deferredInstallEvent, dismissInstallPrompt } = usePwaStore();

  if (!isInstallPromptVisible || !deferredInstallEvent) return null;

  const handleInstall = async () => {
    const evt = deferredInstallEvent as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    if (evt && typeof evt.prompt === 'function') {
      evt.prompt();
      const choice = await evt.userChoice;
      if (choice.outcome === 'accepted') {
        dismissInstallPrompt();
      }
    }
  };

  return (
    <div className="bg-[#D9FAF2] dark:bg-emerald-950/60 text-[#044E3A] dark:text-emerald-100 p-3.5 px-4 rounded-2xl border border-[#A3EAD2] dark:border-emerald-800 flex items-center justify-between gap-4 mb-4" role="region" aria-label="Install AbleNova Application">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-white/70 dark:bg-emerald-900/50 flex items-center justify-center text-xl shrink-0" aria-hidden="true">
          📲
        </span>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#044E3A] dark:text-emerald-200">
            PWA Install Available
          </h4>
          <p className="text-xs font-bold text-slate-700 dark:text-emerald-300 mt-0.5">
            Install AbleNova for fast, offline learning anywhere!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3.5 py-1.5 rounded-full bg-[#044E3A] text-white font-extrabold text-xs hover:bg-[#033b2c] transition-colors shadow-xs"
        >
          Install App
        </button>
        <button
          onClick={dismissInstallPrompt}
          className="px-2.5 py-1.5 text-xs text-slate-500 dark:text-emerald-400 hover:text-slate-800 dark:hover:text-white font-bold"
          aria-label="Dismiss installation prompt"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Volume2, Eye, User, Type, Check } from 'lucide-react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export default function SettingsPage() {
  const {
    soundEnabled,
    toggleSound,
    fontSize,
    setFontSize,
    dyslexicFont,
    toggleDyslexicFont,
  } = useAccessibilityStore();

  const [readingSpeed, setReadingSpeed] = useState<number>(1);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
        {/* Page Header */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Account & Preferences</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Customize learning speeds, audio preferences, and student profile settings.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-6 rounded-3xl space-y-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Learner Profile</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Name</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold">Alex Rivera</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade / Level</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold">Junior Explorer • Grade 5</div>
            </div>
          </div>
        </Card>

        {/* Audio & Narrator Settings */}
        <Card className="p-6 rounded-3xl space-y-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span>Voice & Audio Narration Speed</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Text-to-Speech Narration Speed</span>
              <span className="text-sm font-bold text-emerald-600">{readingSpeed}x</span>
            </div>
            <div className="flex gap-2">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setReadingSpeed(speed)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    readingSpeed === speed
                      ? 'bg-[#044E3A] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Audio Narration Enabled</div>
              <div className="text-xs text-slate-500">Read questions and lesson text aloud</div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
              }`}
            >
              {soundEnabled ? 'Enabled ✓' : 'Disabled'}
            </button>
          </div>
        </Card>

        {/* Display & Reading Preferences */}
        <Card className="p-6 rounded-3xl space-y-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <Type className="w-5 h-5 text-purple-600" />
            <span>Reading & Font Display</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">OpenDyslexic Reading Font</div>
                <div className="text-xs text-slate-500">Specialized font for easier character recognition</div>
              </div>
              <button
                onClick={toggleDyslexicFont}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  dyslexicFont ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                }`}
              >
                {dyslexicFont ? 'Active ✓' : 'Standard'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Font Size</div>
                <div className="text-xs text-slate-500">Adjust overall text scaling</div>
              </div>
              <div className="flex gap-1">
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                      fontSize === size ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

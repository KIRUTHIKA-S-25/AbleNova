'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAccessibilityStore, FontSize, ContrastMode } from '@/store/useAccessibilityStore';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Sliders, X, Eye, Type, Contrast } from 'lucide-react';
import { trapFocus } from '@/utils/a11y';

export const AccessibilityQuickControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    fontSize,
    contrastMode,
    dyslexicFont,
    reducedMotion,
    increasedSpacing,
    largeTouchTargets,
    soundEnabled,
    setFontSize,
    setContrastMode,
    toggleDyslexicFont,
    toggleReducedMotion,
    toggleIncreasedSpacing,
    toggleLargeTouchTargets,
    toggleSound,
    resetSettings,
  } = useAccessibilityStore();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if (panelRef.current) {
        trapFocus(panelRef.current, e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <Button
        variant="accent"
        size="normal"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="accessibility-quick-panel"
        aria-label="Open Accessibility Quick Controls Panel"
        className="gap-2 shadow-md hover:glow-mint"
      >
        <Sliders className="w-5 h-5" aria-hidden="true" />
        <span className="hidden sm:inline">Accessibility</span>
      </Button>

      {/* Popover Control Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          id="accessibility-quick-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Quick Accessibility Settings"
          tabIndex={-1}
          className="absolute right-0 top-full mt-3 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border-3 border-teal-500 dark:border-yellow-400 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-slate-900 dark:text-slate-100 focus-visible:outline-none"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-lg text-teal-700 dark:text-yellow-400">
              <Eye className="w-5 h-5" aria-hidden="true" />
              <span>Quick Accessibility</span>
            </div>
            <IconButton
              icon={<X className="w-5 h-5" />}
              ariaLabel="Close accessibility panel"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            />
          </div>

          {/* Text Size Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold flex items-center gap-1.5">
              <Type className="w-4 h-4 text-blue-600 dark:text-yellow-400" aria-hidden="true" />
              <span>Text Size</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'large', 'xlarge'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl capitalize transition-all focus-visible:outline-none ${
                    fontSize === size
                      ? 'bg-teal-600 text-white dark:bg-yellow-400 dark:text-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {size === 'normal' ? 'Standard' : size === 'large' ? 'Large' : 'Extra Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Mode Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold flex items-center gap-1.5">
              <Contrast className="w-4 h-4 text-indigo-600 dark:text-cyan-400" aria-hidden="true" />
              <span>Color Contrast</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'high-contrast', 'dark'] as ContrastMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setContrastMode(mode)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl capitalize transition-all focus-visible:outline-none ${
                    contrastMode === mode
                      ? 'bg-teal-600 text-white dark:bg-yellow-400 dark:text-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {mode === 'high-contrast' ? 'High Contrast' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles List */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Checkbox
              id="quick-dyslexic"
              label="Dyslexic Friendly Font"
              checked={dyslexicFont}
              onChange={toggleDyslexicFont}
            />

            <Checkbox
              id="quick-motion"
              label="Reduced Motion"
              checked={reducedMotion}
              onChange={toggleReducedMotion}
            />

            <Checkbox
              id="quick-spacing"
              label="Comfortable Spacing"
              checked={increasedSpacing}
              onChange={toggleIncreasedSpacing}
            />

            <Checkbox
              id="quick-touch"
              label="Larger Touch Targets"
              checked={largeTouchTargets}
              onChange={toggleLargeTouchTargets}
            />

            <Checkbox
              id="quick-sound"
              label="Audio & Sound Feedback"
              checked={soundEnabled}
              onChange={toggleSound}
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={resetSettings}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline focus-visible:outline-none"
            >
              Reset Defaults
            </button>
            <Button variant="primary" size="normal" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup } from '@/components/ui/Radio';
import { Alert } from '@/components/ui/Alert';
import { useAccessibilityStore, FontSize, ContrastMode, InstructionStyle } from '@/store/useAccessibilityStore';
import {
  Type,
  Contrast,
  MousePointer,
  ListChecks,
  RotateCcw,
  Eye,
} from 'lucide-react';

export default function AccessibilitySettingsPage() {
  const {
    fontSize,
    contrastMode,
    dyslexicFont,
    reducedMotion,
    increasedSpacing,
    simplifiedVisual,
    largeTouchTargets,
    instructionStyle,
    setFontSize,
    setContrastMode,
    setInstructionStyle,
    toggleDyslexicFont,
    toggleReducedMotion,
    toggleIncreasedSpacing,
    toggleSimplifiedVisual,
    toggleLargeTouchTargets,
    resetSettings,
  } = useAccessibilityStore();

  return (
    <AppShell>
      <PageContainer
        title="Make AbleNova Comfortable for You"
        subtitle="Customize text size, contrast, motion, spacing, and interaction settings. Preferences are automatically saved."
        action={
          <Button variant="outline" onClick={resetSettings} className="gap-2">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reset Defaults</span>
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls (Column 1 & 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Text Size Card */}
            <Card className="glow-mint border-2 border-teal-200 dark:border-teal-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl">
                    <Type className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Text Size</CardTitle>
                    <CardDescription>Adjust text size for comfortable reading across all lessons.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  name="text-size-setting"
                  legend="Choose your preferred font scale:"
                  selectedValue={fontSize}
                  onChange={(val) => setFontSize(val as FontSize)}
                  options={[
                    { value: 'normal', label: 'Standard Text Size', hint: 'Default reading size' },
                    { value: 'large', label: 'Large Text Size', hint: '112% scaled up for easier reading' },
                    { value: 'xlarge', label: 'Extra Large Text Size', hint: '125% scaled up for visual comfort' },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Contrast Settings Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl">
                    <Contrast className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Color & Contrast</CardTitle>
                    <CardDescription>Increase visual distinction between elements.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  name="contrast-setting"
                  legend="Select contrast mode:"
                  selectedValue={contrastMode}
                  onChange={(val) => setContrastMode(val as ContrastMode)}
                  options={[
                    { value: 'normal', label: 'Standard Light Theme', hint: 'Soft background with dark charcoal text' },
                    { value: 'high-contrast', label: 'High Contrast Mode (WCAG AAA)', hint: 'Pure black background with bright yellow borders & text' },
                    { value: 'dark', label: 'Dark Mode', hint: 'Sleek dark background for low-light reading' },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Interaction & Motion Controls Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-xl">
                    <MousePointer className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Motion & Touch Interaction</CardTitle>
                    <CardDescription>Configure movement reductions and touch target sizes.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <Checkbox
                  id="setting-reduced-motion"
                  label="Reduced Motion"
                  hint="Reduce animations, transitions, and bouncing movement."
                  checked={reducedMotion}
                  onChange={toggleReducedMotion}
                />

                <Checkbox
                  id="setting-touch-targets"
                  label="Larger Touch Targets"
                  hint="Make buttons, links, and form inputs easier to tap and select."
                  checked={largeTouchTargets}
                  onChange={toggleLargeTouchTargets}
                />

                <Checkbox
                  id="setting-increased-spacing"
                  label="Comfortable Spacing"
                  hint="Give content more breathing room with extra line and letter spacing."
                  checked={increasedSpacing}
                  onChange={toggleIncreasedSpacing}
                />

                <Checkbox
                  id="setting-dyslexic-font"
                  label="Dyslexic Friendly Font"
                  hint="Use OpenDyslexic weighted font for reading assistance."
                  checked={dyslexicFont}
                  onChange={toggleDyslexicFont}
                />

                <Checkbox
                  id="setting-simplified-visual"
                  label="Simplified Visual Mode"
                  hint="Hide non-essential background patterns and visual effects."
                  checked={simplifiedVisual}
                  onChange={toggleSimplifiedVisual}
                />
              </CardContent>
            </Card>

            {/* Learning Presentation Style */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-xl">
                    <ListChecks className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Instruction Presentation</CardTitle>
                    <CardDescription>Select how lesson prompts and instructions are phrased.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  name="instruction-style-setting"
                  legend="Choose instruction style:"
                  selectedValue={instructionStyle}
                  onChange={(val) => setInstructionStyle(val as InstructionStyle)}
                  options={[
                    { value: 'simple', label: 'Simple & Short Instructions', hint: 'Direct, step-by-step sentences with visual icons' },
                    { value: 'detailed', label: 'Detailed Instructions', hint: 'Provides full contextual explanations' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Sidebar (Column 3) */}
          <div className="flex flex-col gap-6">
            <Card className="sticky top-24 border-2 border-teal-400 dark:border-yellow-400 shadow-xl bg-teal-50/50 dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center gap-2 text-teal-800 dark:text-yellow-400 font-bold">
                  <Eye className="w-5 h-5" aria-hidden="true" />
                  <span>Live Preview</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100">
                    Sample Lesson Heading
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    &quot;This is how your learning content will look with your active accessibility settings.&quot;
                  </p>
                  <Button variant="primary" size="normal" className="w-full">
                    Sample Interactive Button
                  </Button>
                </div>

                <Alert variant="info" title="Auto-Saved">
                  Your preferences are automatically saved in local browser storage.
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

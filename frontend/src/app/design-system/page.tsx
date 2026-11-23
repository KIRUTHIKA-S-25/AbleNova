'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Modal,
  Tooltip,
  Progress,
  Alert,
  LoadingState,
  EmptyState,
  ErrorState,
} from '@/components/ui';
import { Heart, Sparkles } from 'lucide-react';

export default function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioSelected, setRadioSelected] = useState('audio');
  const [progressVal, setProgressVal] = useState(65);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleValidate = () => {
    if (!inputValue.trim()) {
      setInputError('This field is required. Please enter a valid student name.');
    } else {
      setInputError('');
    }
  };

  return (
    <AppShell>
      <PageContainer
        title="AbleNova Design System & Component Library"
        subtitle="Phase 2 Accessible Architecture — WCAG AAA Contrast, Keyboard Focus Management & Responsive Tokens"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Test Accessible Modal Dialog
          </Button>
        }
      >
        {/* Section 1: Color Tokens & Typography */}
        <section aria-labelledby="section-tokens" className="flex flex-col gap-4">
          <h2 id="section-tokens" className="text-2xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">
            1. Semantic Badges & Accessibility Status Tokens
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="primary">Primary Token</Badge>
            <Badge variant="secondary">Secondary Token</Badge>
            <Badge variant="info">Info Badge</Badge>
            <Badge variant="success">Success Mode</Badge>
            <Badge variant="warning">Warning Notice</Badge>
            <Badge variant="error">Error Alert</Badge>
            <Badge variant="neutral">Neutral State</Badge>
          </div>
        </section>

        {/* Section 2: Buttons & IconButtons */}
        <section aria-labelledby="section-buttons" className="flex flex-col gap-4">
          <h2 id="section-buttons" className="text-2xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">
            2. Accessible Buttons & Icon Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Action</Button>
            <Button variant="primary" isLoading loadingText="Saving Data...">
              Submit
            </Button>
            <Tooltip text="Add to favorites">
              <IconButton icon={<Heart className="w-5 h-5 text-red-500" />} ariaLabel="Add to favorites" variant="outline" />
            </Tooltip>
            <Tooltip text="AI Assistant Help">
              <IconButton icon={<Sparkles className="w-5 h-5 text-amber-500" />} ariaLabel="Ask AI Assistant for help" variant="accent" />
            </Tooltip>
          </div>
        </section>

        {/* Section 3: Accessible Form Controls */}
        <section aria-labelledby="section-forms" className="flex flex-col gap-6">
          <h2 id="section-forms" className="text-2xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">
            3. Form Controls with ARIA & Error Feedback
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input & Validation Demo</CardTitle>
                <CardDescription>Includes aria-describedby for hints and non-color-only error messages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="student-name-demo"
                  label="Student Full Name"
                  placeholder="e.g. Maya Lin"
                  hint="Enter the registered student name."
                  required
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  errorMessage={inputError}
                />
                <Button variant="secondary" onClick={handleValidate}>
                  Validate Input
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select & Textarea Controls</CardTitle>
                <CardDescription>Accessible drop-downs and text areas for user input.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  id="grade-level-select"
                  label="Target Grade Level"
                  hint="Select appropriate difficulty for lesson material."
                  options={[
                    { value: 'grade-1', label: 'Grade 1 (Foundational)' },
                    { value: 'grade-2', label: 'Grade 2 (Intermediate)' },
                    { value: 'grade-3', label: 'Grade 3 (Advanced)' },
                  ]}
                />
                <Textarea
                  id="feedback-text"
                  label="Learning Preferences & Notes"
                  placeholder="Describe child's specific sensory or learning needs..."
                  hint="Optional details for personalized AI lesson generation."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkboxes & Radio Options</CardTitle>
                <CardDescription>Keyboard accessible radio groups and checkboxes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Checkbox
                  id="sound-feedback-check"
                  label="Enable Audio Cues & Sound Feedback"
                  hint="Plays subtle sound chimes when answering questions correctly."
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />

                <RadioGroup
                  name="learning-mode-radio"
                  legend="Preferred Learning Mode"
                  hint="Select the primary assistance format for lesson content."
                  selectedValue={radioSelected}
                  onChange={setRadioSelected}
                  options={[
                    { value: 'audio', label: 'Audio Narration + Read Aloud', hint: 'Best for visual difficulties' },
                    { value: 'visual', label: 'High Contrast Visual Guides', hint: 'Best for hearing difficulties' },
                    { value: 'simplified', label: 'Simplified Text & Symbols', hint: 'Best for cognitive focus' },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress & Interactive Control</CardTitle>
                <CardDescription>Progress bar with ARIA percentage values.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressVal} label="Lesson Completion Progress" />
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="normal" onClick={() => setProgressVal((v) => Math.max(0, v - 15))}>
                    - 15%
                  </Button>
                  <Button variant="outline" size="normal" onClick={() => setProgressVal((v) => Math.min(100, v + 15))}>
                    + 15%
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 4: Alerts & Banners */}
        <section aria-labelledby="section-alerts" className="flex flex-col gap-4">
          <h2 id="section-alerts" className="text-2xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">
            4. Semantic Alert Banners
          </h2>
          <div className="flex flex-col gap-4">
            <Alert variant="info" title="System Feature Notice">
              AbleNova supports full offline learning mode. Lessons saved locally will sync when internet becomes available.
            </Alert>
            <Alert variant="success" title="Progress Saved">
              Your lesson activity and badge achievements have been successfully recorded.
            </Alert>
            <Alert variant="warning" title="Offline Mode Active">
              You are currently working offline. AI real-time chat queries will be queued for synchronization.
            </Alert>
            <Alert variant="error" title="Input Verification Error">
              Please complete all required fields highlighted above before proceeding to the quiz.
            </Alert>
          </div>
        </section>

        {/* Section 5: Application States (Loading, Empty, Error) */}
        <section aria-labelledby="section-states" className="flex flex-col gap-4">
          <h2 id="section-states" className="text-2xl font-bold border-b pb-2 border-slate-200 dark:border-slate-800">
            5. Reusable Application States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-sm font-semibold text-slate-500">Loading State Component</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingState label="Preparing lesson content..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-sm font-semibold text-slate-500">Empty State Component</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No Quizzes Completed"
                  description="When you complete your first lesson, badges will appear here."
                  actionLabel="Browse Lessons"
                  onAction={() => alert('Navigating to lessons...')}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-sm font-semibold text-slate-500">Error State Component</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorState
                  title="Lesson Connection Error"
                  message="We could not fetch lesson modules right now."
                  onRetry={() => alert('Retrying connection...')}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Modal Dialog */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Accessible Modal Component"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Understand & Continue
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p>
              This dialog implements <strong>keyboard focus trapping</strong>, <strong>ARIA attributes</strong> (<code>role=&quot;dialog&quot;</code>, <code>aria-modal=&quot;true&quot;</code>), and listens to the <strong>Escape key</strong> to close cleanly.
            </p>
            <Alert variant="info">Try pressing <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Tab</kbd> to cycle focus within this dialog or press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Escape</kbd> to exit!</Alert>
          </div>
        </Modal>
      </PageContainer>
    </AppShell>
  );
}

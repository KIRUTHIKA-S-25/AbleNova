'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { OnboardingProgress } from '@/features/student/onboarding/OnboardingProgress';
import { PreferenceCard } from '@/features/student/onboarding/PreferenceCard';
import { OnboardingSummary } from '@/features/student/onboarding/OnboardingSummary';
import {
  LEARNING_STYLE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  PACE_OPTIONS,
  GOAL_OPTIONS,
} from '@/lib/mock';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Star } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    learningStyles,
    accessibilitySelections,
    learningPace,
    selectedGoals,
    nextStep,
    prevStep,
    toggleLearningStyle,
    toggleAccessibilitySelection,
    setPace,
    toggleGoal,
    completeOnboarding,
  } = useOnboardingStore();

  const handleFinish = () => {
    completeOnboarding();
    router.push('/');
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center gap-8 py-6 max-w-4xl mx-auto w-full">
        {/* Progress Indicator */}
        <OnboardingProgress currentStep={currentStep} totalSteps={6} />

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <Card className="w-full max-w-2xl text-center items-center p-8 sm:p-12 glow-mint border-2 border-teal-300 dark:border-teal-800 bg-gradient-to-b from-white via-teal-50/40 to-white dark:from-slate-900 dark:to-slate-950 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-teal-600 dark:bg-yellow-400 text-white dark:text-black flex items-center justify-center shadow-xl glow-mint mx-auto">
              <ShieldCheck className="w-12 h-12" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              <Badge variant="primary" className="bg-yellow-400 text-black font-black border-yellow-500">
                <Star className="w-4 h-4 inline mr-1 fill-current" aria-hidden="true" /> Welcome to AbleNova! 🌟
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Let&apos;s Make Learning <br />
                <span className="text-teal-600 dark:text-yellow-400">Work for YOU.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                AbleNova adapts text, sound, pacing, and visual themes to match your unique strengths and preferences.
              </p>
            </div>

            <div className="pt-4">
              <Button size="large" variant="accent" onClick={nextStep} className="w-full sm:w-auto px-10 shadow-xl glow-mint">
                <span>Let&apos;s Get Started</span>
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Learning Preferences */}
        {currentStep === 2 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="info">Step 2 of 6</Badge>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                What helps you learn best?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base">
                Select one or more learning formats that feel most comfortable for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEARNING_STYLE_OPTIONS.map((option) => (
                <PreferenceCard
                  key={option.id}
                  id={option.id}
                  title={option.title}
                  description={option.description}
                  iconName={option.iconName}
                  isSelected={learningStyles.includes(option.id)}
                  onSelect={toggleLearningStyle}
                  isMultiSelect={true}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" onClick={prevStep} className="gap-2">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={nextStep}>
                  Skip for now
                </Button>
                <Button variant="primary" onClick={nextStep} className="gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Accessibility Preferences */}
        {currentStep === 3 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="secondary">Step 3 of 6</Badge>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                What makes learning easier for you?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base">
                Select accessibility controls that enhance your reading and visual experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACCESSIBILITY_OPTIONS.map((option) => (
                <PreferenceCard
                  key={option.id}
                  id={option.id}
                  title={option.title}
                  description={option.description}
                  iconName={option.iconName}
                  isSelected={accessibilitySelections.includes(option.id)}
                  onSelect={toggleAccessibilitySelection}
                  isMultiSelect={true}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" onClick={prevStep} className="gap-2">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={nextStep}>
                  Skip for now
                </Button>
                <Button variant="primary" onClick={nextStep} className="gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Learning Pace */}
        {currentStep === 4 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="warning">Step 4 of 6</Badge>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                How do you like to learn?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base">
                Choose the interaction and challenge speed that feels right.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PACE_OPTIONS.map((option) => (
                <PreferenceCard
                  key={option.id}
                  id={option.id}
                  title={option.title}
                  description={option.description}
                  iconName={option.iconName}
                  isSelected={learningPace === option.id}
                  onSelect={setPace}
                  isMultiSelect={false}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" onClick={prevStep} className="gap-2">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
              <Button variant="primary" onClick={nextStep} className="gap-2">
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Learning Goals */}
        {currentStep === 5 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="info">Step 5 of 6</Badge>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                What would you like to learn?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base">
                Select your favorite subjects and topics to personalize your recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOAL_OPTIONS.map((option) => (
                <PreferenceCard
                  key={option.id}
                  id={option.id}
                  title={option.title}
                  description={option.description}
                  iconName={option.iconName}
                  isSelected={selectedGoals.includes(option.id)}
                  onSelect={toggleGoal}
                  isMultiSelect={true}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" onClick={prevStep} className="gap-2">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
              <Button variant="primary" onClick={nextStep} className="gap-2">
                <span>See Summary</span>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Personalization Summary */}
        {currentStep === 6 && (
          <OnboardingSummary
            learningStyles={learningStyles}
            accessibilitySelections={accessibilitySelections}
            learningPace={learningPace}
            selectedGoals={selectedGoals}
            onComplete={handleFinish}
          />
        )}
      </div>
    </AppShell>
  );
}

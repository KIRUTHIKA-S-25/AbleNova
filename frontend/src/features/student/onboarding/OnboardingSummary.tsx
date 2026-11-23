import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, CheckCircle2, BookOpen, Sliders, Zap, Award } from 'lucide-react';
import { LEARNING_STYLE_OPTIONS, ACCESSIBILITY_OPTIONS, PACE_OPTIONS, GOAL_OPTIONS } from '@/lib/mock';

export interface OnboardingSummaryProps {
  learningStyles: string[];
  accessibilitySelections: string[];
  learningPace: string;
  selectedGoals: string[];
  onComplete: () => void;
}

export const OnboardingSummary: React.FC<OnboardingSummaryProps> = ({
  learningStyles,
  accessibilitySelections,
  learningPace,
  selectedGoals,
  onComplete,
}) => {
  const paceObj = PACE_OPTIONS.find((p) => p.id === learningPace) || PACE_OPTIONS[1];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Celebration Header Card */}
      <Card className="border border-[#A3EAD2] bg-[#D9FAF2] dark:bg-emerald-950/40 dark:border-emerald-800 p-8 text-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#044E3A] text-white flex items-center justify-center shadow-lg mb-2">
          <Sparkles className="w-9 h-9" aria-hidden="true" />
        </div>
        <Badge variant="success" className="mb-2">Personalization Complete</Badge>
        <h2 className="text-3xl font-black text-slate-900 dark:text-emerald-100">
          Your AbleNova Experience is Ready! ✨
        </h2>
        <p className="text-base text-slate-700 dark:text-emerald-200 max-w-lg mt-1 font-medium">
          We have personalized your visual themes, interaction speeds, and learning formats just for you.
        </p>
      </Card>

      {/* Preferences Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Learning Styles */}
        <Card className="p-5">
          <div className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400 mb-3">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            <span>How You Learn Best</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {learningStyles.map((styleId) => {
              const opt = LEARNING_STYLE_OPTIONS.find((o) => o.id === styleId);
              return (
                <Badge key={styleId} variant="primary" className="py-1 px-3">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-yellow-400" aria-hidden="true" />
                  {opt ? opt.title : styleId}
                </Badge>
              );
            })}
          </div>
        </Card>

        {/* Accessibility Preferences */}
        <Card className="p-5">
          <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400 mb-3">
            <Sliders className="w-5 h-5" aria-hidden="true" />
            <span>Comfort Settings</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {accessibilitySelections.map((accId) => {
              const opt = ACCESSIBILITY_OPTIONS.find((o) => o.id === accId);
              return (
                <Badge key={accId} variant="secondary" className="py-1 px-3">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-cyan-400" aria-hidden="true" />
                  {opt ? opt.title : accId}
                </Badge>
              );
            })}
          </div>
        </Card>

        {/* Pace */}
        <Card className="p-5">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 mb-3">
            <Zap className="w-5 h-5" aria-hidden="true" />
            <span>Learning Pace</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="py-1 px-3 text-sm">
              {paceObj.title}
            </Badge>
          </div>
        </Card>

        {/* Selected Goals */}
        <Card className="p-5">
          <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400 mb-3">
            <Award className="w-5 h-5" aria-hidden="true" />
            <span>Chosen Learning Goals</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goalId) => {
              const opt = GOAL_OPTIONS.find((o) => o.id === goalId);
              return (
                <Badge key={goalId} variant="info" className="py-1 px-3">
                  {opt ? opt.title : goalId}
                </Badge>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Completion CTA */}
      <div className="flex justify-center pt-4">
        <Button variant="accent" size="large" onClick={onComplete} className="w-full sm:w-auto px-10 shadow-xl glow-mint">
          <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
          <span>Continue to AbleNova</span>
        </Button>
      </div>
    </div>
  );
};

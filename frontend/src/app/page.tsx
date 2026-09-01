'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AccessibilityBar } from '@/components/accessibility/AccessibilityBar';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  BookOpen,
  Brain,
  HeartHandshake,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Wifi,
  Eye,
  Volume2,
  Keyboard,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Star,
} from 'lucide-react';

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-blue-400 dark:hover:border-yellow-400">
      <div
        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </Card>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  color,
  buttonLabel,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
  color: string;
  buttonLabel: string;
}) {
  return (
    <Link href={href} className="focus-visible:outline-none rounded-3xl block group" tabIndex={0}>
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-blue-400 dark:hover:border-yellow-400 cursor-pointer flex flex-col gap-5 min-h-[300px]">
        {/* Decorative gradient blob */}
        <div
          className={`absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${color}`}
          aria-hidden="true"
        />

        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${color} text-white shadow-lg z-10`}>
          <Icon className="w-8 h-8" />
        </div>

        <div className="z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
            <Badge variant="info" className="text-xs">{badge}</Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{description}</p>
        </div>

        <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-yellow-400 group-hover:gap-4 transition-all duration-300 z-10">
          <span>{buttonLabel}</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────
function StatItem({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon className="w-8 h-8 text-yellow-400" />
      <span className="text-3xl font-black text-white">{value}</span>
      <span className="text-slate-400 text-sm font-semibold">{label}</span>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { speakText } = useAccessibility();

  const heroText =
    'AbleNova. AI-powered personalized learning for children with disabilities. Accessible, adaptive, and built for every learner, everywhere.';

  return (
    <div className="flex flex-col">
      {/* ── Accessibility Bar ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <AccessibilityBar />
      </div>

      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" aria-hidden="true" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <Badge variant="success" className="inline-flex gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Inclusive Education
            </Badge>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white"
            >
              Learning that
              <span className="block text-blue-600 dark:text-yellow-400"> adapts to</span>
              <span className="block">every child.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              AbleNova brings{' '}
              <strong className="text-blue-600 dark:text-yellow-400">AI-powered personalized learning</strong> to
              children with disabilities — accessible, offline-ready, and designed for every learner in remote and
              underserved communities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <Link href="/onboarding">
                <Button size="large" variant="primary" className="flex items-center gap-2 shadow-lg">
                  <Zap className="w-5 h-5" />
                  Get Started — It&apos;s Free
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="large"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => speakText(heroText)}
                ariaLabel="Listen to page summary aloud"
              >
                <Volume2 className="w-5 h-5" />
                Listen to This Page
              </Button>
            </div>

            {/* Quick Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start text-sm font-semibold text-slate-500 dark:text-slate-400">
              {[
                'Offline Ready',
                'Screen Reader Friendly',
                'No diagnosis required',
                'Multilingual',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Visual Card */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Main Dashboard Preview Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Good morning!</p>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Ready to learn today?</h2>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Mock progress bars */}
                {[
                  { label: 'Mathematics', pct: 68, color: 'bg-blue-500' },
                  { label: 'Science', pct: 45, color: 'bg-purple-500' },
                  { label: 'Reading', pct: 82, color: 'bg-emerald-500' },
                ].map((sub) => (
                  <div key={sub.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>{sub.label}</span>
                      <span>{sub.pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${sub.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${sub.pct}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* AI Suggestion */}
                <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 mt-2">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    AI suggests: Let&apos;s revisit Fractions today!
                  </p>
                </div>

                {/* CTA */}
                <Link href="/dashboard">
                  <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Continue Learning
                  </Button>
                </Link>
              </div>

              {/* Floating accessibility badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                ✦ Accessible
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="bg-slate-900 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8" aria-label="Platform Statistics">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem value="19+" label="Learning Modules" icon={BookOpen} />
          <StatItem value="3" label="User Roles Supported" icon={Users} />
          <StatItem value="8" label="Accessibility Modes" icon={Eye} />
          <StatItem value="100%" label="Offline Capable" icon={Wifi} />
        </div>
      </section>

      {/* ── Role Selection ── */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950"
        aria-labelledby="roles-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="info" className="mb-4 inline-flex gap-2">
              <Users className="w-4 h-4" /> Who is AbleNova for?
            </Badge>
            <h2 id="roles-heading" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Choose your role to get started
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
              AbleNova serves students, teachers, and caregivers with a personalized view designed for each role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard
              href="/onboarding"
              icon={BookOpen}
              title="I'm a Student"
              description="Start your personalized learning journey. Set accessibility preferences and follow an AI-guided learning path matched to your pace."
              badge="Primary"
              color="bg-blue-600"
              buttonLabel="Start Learning"
            />
            <RoleCard
              href="/teacher"
              icon={HeartHandshake}
              title="I'm a Teacher"
              description="Upload educational content, monitor each student's progress, and see AI-recommended interventions for your class."
              badge="Educator"
              color="bg-amber-500"
              buttonLabel="Teacher Dashboard"
            />
            <RoleCard
              href="/caregiver"
              icon={Shield}
              title="I'm a Caregiver"
              description="View your child's learning progress, strengths, and areas needing support — without any medical labels or diagnoses."
              badge="Parent/Guardian"
              color="bg-emerald-600"
              buttonLabel="View Progress"
            />
          </div>
        </div>
      </section>

      {/* ── Accessibility Features ── */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900"
        aria-labelledby="accessibility-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="warning" className="mb-4 inline-flex gap-2">
              <Shield className="w-4 h-4" /> Accessibility First
            </Badge>
            <h2 id="accessibility-heading" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Designed for every learner
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base">
              We don&apos;t assume all children learn the same way. AbleNova adapts to each learner&apos;s visual, hearing, motor,
              and cognitive needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Eye}
              title="Visual Accessibility"
              description="High contrast mode, large text scaling (up to 150%), dyslexia-friendly fonts, and screen-reader-optimized semantic HTML."
              color="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
            />
            <FeatureCard
              icon={Volume2}
              title="Audio Support"
              description="Built-in text-to-speech for every lesson, quiz question, and button. Captions and transcripts for all audio and video content."
              color="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
            />
            <FeatureCard
              icon={Keyboard}
              title="Motor Accessibility"
              description="Full keyboard navigation with visible focus indicators. Large touch targets (minimum 48px). No time-critical interactions."
              color="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
            />
            <FeatureCard
              icon={Brain}
              title="Cognitive Support"
              description="Simple language mode, step-by-step explanations, reduced distractions, progress indicators, and predictable navigation patterns."
              color="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            />
            <FeatureCard
              icon={Wifi}
              title="Offline Learning"
              description="Full offline capability via Progressive Web App and IndexedDB. Complete lessons and quizzes without internet — syncs automatically when reconnected."
              color="bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
            />
            <FeatureCard
              icon={Globe}
              title="Low-Bandwidth Ready"
              description="Optimized for slow connections and low-end devices. Skeleton loading, lazy images, minimal JavaScript, and efficient caching."
              color="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
            />
          </div>
        </div>
      </section>

      {/* ── Student Learning Flow ── */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950"
        aria-labelledby="flow-heading"
      >
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="success" className="mb-4 inline-flex gap-2">
            <Zap className="w-4 h-4" /> Student Learning Journey
          </Badge>
          <h2 id="flow-heading" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            How AbleNova works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-12 text-base">
            Each student follows a personally tailored path — no two journeys look exactly the same.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                icon: Shield,
                title: 'Set Accessibility',
                desc: 'Choose text size, contrast, audio, simplified mode and more.',
                color: 'bg-blue-600',
              },
              {
                step: '2',
                icon: BookOpen,
                title: 'Start a Lesson',
                desc: 'Accessible lessons adapt text, audio, and captions to your preferences.',
                color: 'bg-purple-600',
              },
              {
                step: '3',
                icon: Award,
                title: 'Take a Quiz',
                desc: 'Keyboard-navigable large-button quizzes submitted securely to backend.',
                color: 'bg-amber-500',
              },
              {
                step: '4',
                icon: Sparkles,
                title: 'Get Recommendations',
                desc: 'AI backend suggests next lessons based on your results and mastery.',
                color: 'bg-emerald-600',
              },
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center gap-4 relative">
                <div className={`w-16 h-16 rounded-2xl ${step.color} text-white flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-900 dark:bg-yellow-400 text-white dark:text-black text-xs font-black rounded-full flex items-center justify-center shadow">
                  {step.step}
                </div>
                <div className="text-center">
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-700 dark:bg-blue-900"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Badge className="inline-flex gap-2 bg-yellow-400 text-black border-yellow-500 text-sm font-black">
            <Star className="w-4 h-4 fill-current" /> Start Your Journey
          </Badge>
          <h2 id="cta-heading" className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Every child deserves<br />a fair chance to learn.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed max-w-xl mx-auto">
            AbleNova removes barriers, adapts to individual needs, and brings world-class accessible education
            to every learner — wherever they are.
          </p>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="large" variant="accent" className="shadow-2xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Begin Accessibility Setup
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="large" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

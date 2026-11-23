'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLessonStore } from '@/features/lesson/store/useLessonStore';

// Components
import { Breadcrumbs, BackToLearning } from '@/features/lesson/components/Breadcrumbs';
import { LessonIntro } from '@/features/lesson/components/LessonIntro';
import { LessonProgressBar } from '@/features/lesson/components/LessonProgressBar';
import { ContentBlock } from '@/features/lesson/components/ContentBlock';
import { Checkpoint } from '@/features/lesson/components/Checkpoint';
import { AudioPlayer } from '@/features/lesson/components/AudioPlayer';
import { SectionNavigation } from '@/features/lesson/components/SectionNavigation';
import { SectionList } from '@/features/lesson/components/SectionList';
import { CompletionScreen } from '@/features/lesson/components/CompletionScreen';
import { LessonSkeleton } from '@/features/lesson/components/LessonSkeleton';
import { LessonError, LessonEmpty } from '@/features/lesson/components/LessonStates';
import { cn } from '@/utils/cn';

export default function LessonPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;

  // Accessibility & auth
  const {
    fontSize,
    contrastMode,
    reducedMotion,
    increasedSpacing,
    largeTouchTargets,
    instructionStyle,
    soundEnabled,
  } = useAccessibilityStore();
  const { user } = useAuthStore();

  // Lesson state
  const store = useLessonStore();
  const lesson = useLessonStore((s) => s.lesson);
  const loading = useLessonStore((s) => s.isLoading);
  const error = useLessonStore((s) => s.error);
  const loadLesson = useLessonStore((s) => s.loadLesson);
  const resetStore = useLessonStore((s) => s.reset);

  const simplified = instructionStyle === 'simple';
  const highContrast = contrastMode === 'high-contrast';

  useEffect(() => {
    loadLesson(courseId, lessonId);
    return () => {
      resetStore();
    };
  }, [courseId, lessonId, loadLesson, resetStore]);

  const handleRetry = () => {
    loadLesson(courseId, lessonId);
  };

  // ─── Derived values ─────────────────────────────────────────────────────────
  const currentSection = lesson?.sections[store.currentSectionIndex] ?? null;
  const totalSections = lesson?.sections.length ?? 0;
  const progressPct = totalSections
    ? Math.round((store.completedSectionIds.length / totalSections) * 100)
    : 0;
  const isLastSection = store.currentSectionIndex === totalSections - 1;

  // Build a plain-text narration of the current section's content blocks
  const sectionNarration = currentSection?.blocks
    .map((b) => {
      if (b.type === 'code' || b.type === 'example') return '';
      return `${b.title ? b.title + '. ' : ''}${b.content ?? ''}`;
    })
    .filter(Boolean)
    .join(' ') ?? '';

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!lesson || !currentSection) return;
    store.completeSection(currentSection.id);
    store.goToSection(store.currentSectionIndex + 1);
  };

  const handlePrevious = () => {
    if (store.currentSectionIndex > 0) {
      store.goToSection(store.currentSectionIndex - 1);
    }
  };

  const handleFinish = () => {
    if (!lesson || !currentSection) return;
    store.completeSection(currentSection.id);
    store.completeLesson();
  };

  const handleReviewLesson = () => {
    if (!lesson) return;
    store.reset();
    store.initLesson(lesson.id, lesson.sections.map((s) => s.id));
  };

  const handleCheckpointAnswer = (
    checkpointId: string,
    optionIndex: number,
    isCorrect: boolean
  ) => {
    store.answerCheckpoint(checkpointId, optionIndex, isCorrect);
  };

  const handleRetryCheckpoint = (checkpointId: string) => {
    store.retryCheckpoint(checkpointId);
  };

  // ─── Typography scale ────────────────────────────────────────────────────────
  const textScale =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  // ─── Render states ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <LessonSkeleton />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LessonError onRetry={handleRetry} />
      </div>
    );
  }

  if (lesson.sections.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LessonEmpty />
      </div>
    );
  }

  // ─── Completion screen ───────────────────────────────────────────────────────
  if (store.isCompleted) {
    const activitiesCompleted = lesson.sections.filter((s) => s.checkpoint).length;
    return (
      <div className="min-h-screen bg-slate-50">
        <CompletionScreen
          lessonTitle={lesson.title}
          activitiesCompleted={activitiesCompleted}
          durationMinutes={lesson.durationMinutes}
          courseId={courseId}
          lessonId={lessonId}
          onReview={handleReviewLesson}
        />
      </div>
    );
  }

  // ─── Main lesson layout ──────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 transition-colors',
        highContrast && 'bg-white'
      )}
    >
      {/* ── Compact lesson header bar ─────────────────────────────────────── */}
      <header
        className={cn(
          'sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm',
          highContrast && 'border-slate-800'
        )}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Logo / wordmark */}
          <span className="font-black text-xl text-[#044E3A] dark:text-emerald-400 flex-shrink-0">
            AbleNova
          </span>

          {/* Lesson title (truncated) */}
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-xs text-slate-500 truncate">{lesson.title}</p>
            <LessonProgressBar
              value={progressPct}
              label="Lesson progress"
              sectionLabel={`Section ${store.currentSectionIndex + 1} of ${totalSections}`}
              className="max-w-xs"
            />
          </div>

          {/* Right controls */}
          <div className="flex-shrink-0 flex items-center gap-2.5 ml-auto">
            <button
              onClick={async () => {
                if (lesson) {
                  const { saveLessonOffline } = (await import('@/features/pwa')).usePwaStore.getState();
                  await saveLessonOffline(lesson);
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer"
              aria-label="Save lesson for offline access"
            >
              📥 Save Offline
            </button>

            <a
              href="/ai-assistant"
              className="px-3.5 py-1.5 rounded-full bg-[#044E3A] hover:bg-[#033b2c] text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              🤖 Ask AI
            </a>
            <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-300">
              {user?.name ?? 'Learner'}
            </span>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#818cf8)' }}
              aria-hidden="true"
            >
              {(user?.name ?? 'L').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page body ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex gap-8">
          {/* ── Sidebar (desktop only) ──────────────────────────────────────── */}
          <aside
            className="hidden lg:block w-56 flex-shrink-0 sticky top-24 self-start space-y-6"
            aria-label="Lesson sections"
          >
            <BackToLearning courseTitle={courseId.replace(/-/g, ' ')} />
            <SectionList
              sections={lesson.sections.map((s) => ({ id: s.id, title: s.title }))}
              currentSectionId={currentSection?.id ?? ''}
              completedSectionIds={store.completedSectionIds}
              onSelect={store.goToSection}
            />
          </aside>

          {/* ── Main content column ─────────────────────────────────────────── */}
          <main
            className="flex-1 min-w-0 space-y-6"
            id="main-content"
            aria-label="Lesson content"
          >
            {/* Breadcrumbs (mobile) */}
            <div className="lg:hidden">
              <Breadcrumbs
                items={[
                  { label: courseId.replace(/-/g, ' '), href: '/student' },
                  { label: lesson.title },
                ]}
              />
            </div>

            {/* Progress (mobile) */}
            <div className="lg:hidden">
              <LessonProgressBar
                value={progressPct}
                label="Lesson progress"
                sectionLabel={`Section ${store.currentSectionIndex + 1} of ${totalSections}`}
              />
            </div>

            {/* Lesson introduction (shown only on first section) */}
            {store.currentSectionIndex === 0 && (
              <LessonIntro
                title={lesson.title}
                description={lesson.description}
                objectives={lesson.objectives}
                durationMinutes={lesson.durationMinutes}
                difficulty={lesson.difficulty}
                simplified={simplified}
              />
            )}

            {/* Current section card */}
            {currentSection && (
              <article
                className={cn(
                  'rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden',
                  highContrast && 'border-slate-800',
                  increasedSpacing ? 'p-8' : 'p-6 sm:p-8'
                )}
                aria-label={`Section: ${currentSection.title}`}
              >
                {/* Section title */}
                <h2
                  className={cn(
                    'font-extrabold text-slate-900 mb-5 pb-4 border-b border-slate-100',
                    textScale === 'text-xl'
                      ? 'text-2xl'
                      : textScale === 'text-lg'
                      ? 'text-xl'
                      : 'text-xl'
                  )}
                >
                  {currentSection.title}
                </h2>

                {/* Content blocks */}
                <div
                  className={cn(
                    textScale,
                    increasedSpacing ? 'space-y-8' : 'space-y-4'
                  )}
                >
                  {currentSection.blocks.map((block, i) => (
                    <ContentBlock
                      key={i}
                      block={block}
                      highContrast={highContrast}
                      increasedSpacing={increasedSpacing}
                      simplified={simplified}
                    />
                  ))}
                </div>

                {/* Audio player */}
                {sectionNarration && (
                  <div className="mt-6">
                    <AudioPlayer
                      text={sectionNarration}
                      label="Listen to this section"
                      soundEnabled={soundEnabled}
                      reducedMotion={reducedMotion}
                    />
                  </div>
                )}

                {/* Checkpoint */}
                {currentSection.checkpoint && (
                  <div className="mt-6">
                    <Checkpoint
                      checkpoint={currentSection.checkpoint}
                      feedback={
                        store.checkpointFeedback[currentSection.checkpoint.id] != null
                          ? {
                              type: store.checkpointFeedback[currentSection.checkpoint.id]!,
                              selectedIndex:
                                store.checkpointAnswers[currentSection.checkpoint.id] ?? -1,
                            }
                          : null
                      }
                      largeTouchTargets={largeTouchTargets}
                      onAnswer={(optionIndex, isCorrect) =>
                        handleCheckpointAnswer(
                          currentSection.checkpoint!.id,
                          optionIndex,
                          isCorrect
                        )
                      }
                      onRetry={() =>
                        handleRetryCheckpoint(currentSection.checkpoint!.id)
                      }
                    />
                  </div>
                )}

                {/* Section navigation */}
                <SectionNavigation
                  currentIndex={store.currentSectionIndex}
                  totalSections={totalSections}
                  canPrevious={store.currentSectionIndex > 0}
                  canNext={true}
                  isLastSection={isLastSection}
                  largeTouchTargets={largeTouchTargets}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onFinish={handleFinish}
                  className="mt-8"
                />
              </article>
            )}

            {/* Encouraging footer nudge */}
            <p
              className="text-center text-slate-400 text-sm"
              aria-live="polite"
            >
              {progressPct === 0
                ? "You're just getting started — great work showing up!"
                : progressPct < 50
                ? 'Nice progress! Keep going.'
                : progressPct < 100
                ? "You're more than halfway there! Almost done."
                : 'Amazing — you completed every section!'}
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}

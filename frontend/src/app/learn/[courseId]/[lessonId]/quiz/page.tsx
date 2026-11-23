// src/app/learn/[courseId]/[lessonId]/quiz/page.tsx

'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useQuizStore } from '@/features/quiz/store/useQuizStore';
import {
  QuizHeader,
  QuizIntro,
  QuestionCard,
  QuestionRenderer,
  QuestionNavigation,
  QuestionNavigator,
  ReviewPanel,
  QuizSubmitDialog,
  QuizResult,
  AnswerReview,
  QuizLoadingSkeleton,
  QuizErrorState,
  QuizEmptyState,
} from '@/features/quiz';
import { cn } from '@/utils/cn';

export default function QuizPage() {
  const params = useParams();
  const courseId = (params?.courseId as string) || 'python-basics';
  const lessonId = (params?.lessonId as string) || 'variables';

  // Accessibility preferences
  const {
    fontSize,
    contrastMode,
    reducedMotion,
    largeTouchTargets,
    instructionStyle,
    soundEnabled,
  } = useAccessibilityStore();

  const highContrast = contrastMode === 'high-contrast';
  const simplified = instructionStyle === 'simple';

  // Quiz state & actions from store
  const quiz = useQuizStore((s) => s.quiz);
  const quizState = useQuizStore((s) => s.quizState);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const answers = useQuizStore((s) => s.answers);
  const markedForReview = useQuizStore((s) => s.markedForReview);
  const evaluationResult = useQuizStore((s) => s.evaluationResult);
  const isLoading = useQuizStore((s) => s.isLoading);
  const error = useQuizStore((s) => s.error);
  const showSubmitModal = useQuizStore((s) => s.showSubmitModal);

  const loadQuiz = useQuizStore((s) => s.loadQuiz);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const setMultipleChoiceAnswer = useQuizStore((s) => s.setMultipleChoiceAnswer);
  const toggleMultipleSelectAnswer = useQuizStore(
    (s) => s.toggleMultipleSelectAnswer
  );
  const setShortAnswer = useQuizStore((s) => s.setShortAnswer);
  const toggleFlagQuestion = useQuizStore((s) => s.toggleFlagQuestion);
  const goToQuestion = useQuizStore((s) => s.goToQuestion);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const prevQuestion = useQuizStore((s) => s.prevQuestion);
  const setQuizState = useQuizStore((s) => s.setQuizState);
  const setShowSubmitModal = useQuizStore((s) => s.setShowSubmitModal);
  const submitQuiz = useQuizStore((s) => s.submitQuiz);
  const retryQuiz = useQuizStore((s) => s.retryQuiz);
  const resetStore = useQuizStore((s) => s.reset);

  useEffect(() => {
    loadQuiz(courseId, lessonId);
    return () => {
      resetStore();
    };
  }, [courseId, lessonId, loadQuiz, resetStore]);

  // Handle Retry loading
  const handleRetryLoad = () => {
    loadQuiz(courseId, lessonId);
  };

  // Typography scale based on accessibility preferences
  const textScaleClass =
    fontSize === 'xlarge'
      ? 'text-xl'
      : fontSize === 'large'
      ? 'text-lg'
      : 'text-base';

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
        <QuizLoadingSkeleton />
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
        <QuizErrorState
          onRetry={handleRetryLoad}
          courseId={courseId}
          lessonId={lessonId}
        />
      </div>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────────
  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
        <QuizEmptyState courseId={courseId} lessonId={lessonId} />
      </div>
    );
  }

  // ─── Quiz Intro Screen ───────────────────────────────────────────────────
  if (quizState === 'intro') {
    const hasExistingAnswers = Object.keys(answers).length > 0;
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors',
          textScaleClass
        )}
      >
        <QuizIntro
          quiz={quiz}
          onStart={startQuiz}
          hasExistingProgress={hasExistingAnswers}
        />
      </div>
    );
  }

  // ─── Quiz Result Screen ──────────────────────────────────────────────────
  if (quizState === 'result' && evaluationResult) {
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors',
          textScaleClass
        )}
      >
        <QuizResult
          quizTitle={quiz.title}
          courseId={courseId}
          lessonId={lessonId}
          result={evaluationResult}
          onReviewAnswers={() => setQuizState('answer_review')}
          onRetry={retryQuiz}
          largeTouchTargets={largeTouchTargets}
        />
      </div>
    );
  }

  // ─── Answer Review Screen ─────────────────────────────────────────────────
  if (quizState === 'answer_review' && evaluationResult) {
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors',
          textScaleClass
        )}
      >
        <AnswerReview
          evaluations={evaluationResult.questionEvaluations}
          onBackToResult={() => setQuizState('result')}
          largeTouchTargets={largeTouchTargets}
        />
      </div>
    );
  }

  // Calculate unanswered questions for submit confirmation modal
  const totalQuestions = quiz.questions.length;
  const answeredCount = quiz.questions.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      return Boolean(a.selectedOptionId);
    }
    if (q.type === 'multiple_select') {
      return Boolean(a.selectedOptionIds && a.selectedOptionIds.length > 0);
    }
    if (q.type === 'short_answer') {
      return Boolean(a.textAnswer && a.textAnswer.trim().length > 0);
    }
    return false;
  }).length;
  const unansweredCount = totalQuestions - answeredCount;

  // ─── Review Panel (Pre-Submission) ────────────────────────────────────────
  if (quizState === 'review') {
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-4 sm:py-8',
          textScaleClass
        )}
      >
        <ReviewPanel
          questions={quiz.questions}
          answers={answers}
          markedForReview={markedForReview}
          onJumpToQuestion={goToQuestion}
          onBackToActive={() => setQuizState('active')}
          onRequestSubmit={() => setShowSubmitModal(true)}
          largeTouchTargets={largeTouchTargets}
        />

        {/* Submit Confirmation Modal */}
        <QuizSubmitDialog
          isOpen={showSubmitModal}
          unansweredCount={unansweredCount}
          totalQuestions={totalQuestions}
          onClose={() => setShowSubmitModal(false)}
          onConfirmSubmit={submitQuiz}
          largeTouchTargets={largeTouchTargets}
        />
      </div>
    );
  }

  // ─── Active Question Screen ───────────────────────────────────────────────
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isCurrentFlagged = Boolean(markedForReview[currentQuestion.id]);

  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-4 sm:py-8 px-4',
        textScaleClass,
        reducedMotion && 'motion-reduce'
      )}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with progress */}
        <QuizHeader
          quizTitle={quiz.title}
          courseId={courseId}
          lessonId={lessonId}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />

        {/* Main Content Layout: Question Card (left) & Navigator (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Question Experience */}
          <div className="lg:col-span-2 space-y-6">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              soundEnabled={soundEnabled}
              highContrast={highContrast}
              simplified={simplified}
            >
              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onSelectOption={(optId) =>
                  setMultipleChoiceAnswer(currentQuestion.id, optId)
                }
                onToggleMultipleOption={(optId) =>
                  toggleMultipleSelectAnswer(currentQuestion.id, optId)
                }
                onChangeShortAnswer={(text) =>
                  setShortAnswer(currentQuestion.id, text)
                }
                largeTouchTargets={largeTouchTargets}
                highContrast={highContrast}
              />
            </QuestionCard>

            {/* Bottom Navigation controls */}
            <QuestionNavigation
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              isFlagged={isCurrentFlagged}
              onPrev={prevQuestion}
              onNext={nextQuestion}
              onToggleFlag={() => toggleFlagQuestion(currentQuestion.id)}
              onOpenReview={() => setQuizState('review')}
              largeTouchTargets={largeTouchTargets}
            />
          </div>

          {/* Sidebar: Question Navigator */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              questions={quiz.questions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              markedForReview={markedForReview}
              onSelectQuestion={goToQuestion}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal if triggered */}
      <QuizSubmitDialog
        isOpen={showSubmitModal}
        unansweredCount={unansweredCount}
        totalQuestions={totalQuestions}
        onClose={() => setShowSubmitModal(false)}
        onConfirmSubmit={submitQuiz}
        largeTouchTargets={largeTouchTargets}
      />
    </div>
  );
}

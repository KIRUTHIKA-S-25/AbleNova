'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { AiCompanionModal } from '@/components/ai/AiCompanionModal';
import { MOCK_QUIZ } from '@/lib/mock';

export default function QuizEnginePage() {
  const params = useParams();
  const quizId = (params?.id as string) || 'quiz_001';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const { preferences } = useAccessibilityStore();

  const currentQuestion = MOCK_QUIZ.questions[currentQuestionIndex];
  const totalQuestions = MOCK_QUIZ.questions.length;

  const handleOptionSelect = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOptionId === currentQuestion.correct_option_id;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window) {
      const textToRead = `${currentQuestion.text}. ${currentQuestion.options.map((o) => o.text).join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = preferences.simplified_content ? 0.85 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setShowHint(false);
    setQuizFinished(false);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/lessons">
            <Button size="medium" variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Exit Practice
            </Button>
          </Link>

          <Badge variant="primary" className="text-sm px-3 py-1">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
        </div>

        {/* Quiz Finished View */}
        {quizFinished ? (
          <Card className="p-8 border-2 border-teal-500 text-center space-y-6 bg-gradient-to-b from-white via-teal-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <Trophy className="w-10 h-10" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Quiz Completed! Great Job! 🎉</h1>
              <p className="text-slate-600 dark:text-slate-300">
                You scored <strong className="text-teal-600 dark:text-yellow-400 text-xl">{score}</strong> out of{' '}
                <strong>{totalQuestions}</strong> correct!
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                <span>Mastery Estimated</span>
                <span>{Math.round((score / totalQuestions) * 100)}%</span>
              </div>
              <Progress value={Math.round((score / totalQuestions) * 100)} variant="success" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button onClick={restartQuiz} size="large" variant="outline" className="gap-2 w-full sm:w-auto">
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
                Try Quiz Again
              </Button>
              <Link href="/student" className="w-full sm:w-auto">
                <Button size="large" variant="accent" className="gap-2 w-full sm:w-auto glow-mint">
                  <span>Return to Dashboard &rarr;</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Active Question View */
          <Card className="p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-8 bg-white dark:bg-slate-900">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Quiz Progress</span>
                <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
              </div>
              <Progress value={Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)} variant="primary" />
            </div>

            {/* Question Text & Audio Button */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {currentQuestion.text}
                </h2>
                <Button
                  onClick={handleSpeakQuestion}
                  size="small"
                  variant="secondary"
                  className="gap-2 flex-shrink-0"
                  aria-label="Read question aloud"
                >
                  <Volume2 className="w-4 h-4 text-teal-600 dark:text-yellow-400" aria-hidden="true" />
                  <span>Listen</span>
                </Button>
              </div>

              {/* Hint Trigger Button */}
              {!showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-yellow-400 flex items-center gap-1 hover:underline focus-visible:outline-none"
                >
                  <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                  Need a hint?
                </button>
              )}

              {showHint && (
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-yellow-400 flex-shrink-0" />
                  <span>Hint: Think about dividing a shape into 2 equal slice pieces!</span>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3" role="radiogroup" aria-label="Question options">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQuestion.correct_option_id;

                let buttonClass = 'border-slate-200 dark:border-slate-800 hover:border-teal-400';
                if (isSelected) {
                  buttonClass = 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 font-bold';
                }
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    buttonClass = 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    buttonClass = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={isAnswerSubmitted}
                    role="radio"
                    aria-checked={isSelected}
                    className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between text-base sm:text-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400 ${buttonClass}`}
                  >
                    <span>{option.text}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Answer Explanation Box */}
            {isAnswerSubmitted && (
              <div
                className={`p-4 rounded-2xl border-2 space-y-2 ${
                  selectedOptionId === currentQuestion.correct_option_id
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200'
                    : 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  <span>
                    {selectedOptionId === currentQuestion.correct_option_id ? 'Correct! Excellent work!' : 'Not quite right'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              {!isAnswerSubmitted ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  size="large"
                  variant="primary"
                  className="w-full sm:w-auto px-8"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  size="large"
                  variant="accent"
                  className="w-full sm:w-auto gap-2 px-8 glow-mint"
                >
                  <span>{currentQuestionIndex + 1 < totalQuestions ? 'Next Question' : 'View Quiz Results'}</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      <AiCompanionModal />
    </AppShell>
  );
}

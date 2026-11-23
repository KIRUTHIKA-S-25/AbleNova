// src/features/quiz/services/quizService.ts

import type {
  Quiz,
  UserQuizAnswer,
  QuizEvaluationResult,
  QuestionEvaluation,
  TopicBreakdown,
  PerformanceTier,
} from '../types/quiz';
import {
  MOCK_PYTHON_VARIABLES_QUIZ,
  MOCK_QUIZ_REGISTRY,
} from '../data/mockQuizData';

/**
 * Clean async service abstraction for Quiz retrieval and evaluation.
 * When real backend endpoints are ready, only this file needs to be updated.
 */
export async function getQuiz(
  courseId: string,
  lessonId: string
): Promise<Quiz | null> {
  // Simulate minimal realistic async network latency for smooth UI transitions
  await new Promise((resolve) => setTimeout(resolve, 80));

  const key = `${courseId}_${lessonId}`;
  if (MOCK_QUIZ_REGISTRY[key]) {
    return MOCK_QUIZ_REGISTRY[key];
  }

  // Fallback to default Python variables quiz
  return MOCK_PYTHON_VARIABLES_QUIZ;
}

/**
 * Frontend deterministic mock evaluation engine.
 * Evaluates student answers against correct answers without hardcoding scoring inside components.
 */
export function evaluateQuiz(
  quiz: Quiz,
  answers: Record<string, UserQuizAnswer>
): QuizEvaluationResult {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const questionEvaluations: QuestionEvaluation[] = [];
  const topicMap: Record<string, { correct: number; total: number }> = {};

  quiz.questions.forEach((q) => {
    // Initialize topic tracker
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { correct: 0, total: 0 };
    }
    topicMap[q.topic].total += 1;

    const answer = answers[q.id];
    let isCorrect = false;
    let studentAnswerDisplay = 'Not answered';
    let correctAnswerDisplay = '';

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      const selectedId = answer?.selectedOptionId;
      const chosenOption = q.options?.find((o) => o.id === selectedId);
      const correctOption = q.options?.find((o) => o.id === q.correctAnswer);

      studentAnswerDisplay = chosenOption?.text ?? 'Not answered';
      correctAnswerDisplay = correctOption?.text ?? String(q.correctAnswer);

      if (!selectedId) {
        unansweredCount += 1;
      } else if (selectedId === q.correctAnswer) {
        isCorrect = true;
        score += 1;
        correctCount += 1;
        topicMap[q.topic].correct += 1;
      } else {
        incorrectCount += 1;
      }
    } else if (q.type === 'multiple_select') {
      const selectedIds = answer?.selectedOptionIds ?? [];
      const expectedIds = Array.isArray(q.correctAnswer)
        ? q.correctAnswer
        : [q.correctAnswer];

      const chosenOptions = q.options?.filter((o) => selectedIds.includes(o.id));
      const correctOptions = q.options?.filter((o) => expectedIds.includes(o.id));

      studentAnswerDisplay = chosenOptions?.length
        ? chosenOptions.map((o) => o.text).join(', ')
        : 'Not answered';
      correctAnswerDisplay = correctOptions?.map((o) => o.text).join(', ') ?? '';

      if (selectedIds.length === 0) {
        unansweredCount += 1;
      } else {
        // Must contain all expected and no extra
        const setsEqual =
          expectedIds.length === selectedIds.length &&
          expectedIds.every((id) => selectedIds.includes(id));

        if (setsEqual) {
          isCorrect = true;
          score += 1;
          correctCount += 1;
          topicMap[q.topic].correct += 1;
        } else {
          incorrectCount += 1;
        }
      }
    } else if (q.type === 'short_answer') {
      const userText = (answer?.textAnswer ?? '').trim().toLowerCase();
      const acceptableAnswers = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((s) => s.trim().toLowerCase())
        : [String(q.correctAnswer).trim().toLowerCase()];

      studentAnswerDisplay = answer?.textAnswer?.trim() || 'Not answered';
      correctAnswerDisplay = Array.isArray(q.correctAnswer)
        ? q.correctAnswer[0]
        : String(q.correctAnswer);

      if (!userText) {
        unansweredCount += 1;
      } else if (acceptableAnswers.includes(userText)) {
        isCorrect = true;
        score += 1;
        correctCount += 1;
        topicMap[q.topic].correct += 1;
      } else {
        incorrectCount += 1;
      }
    }

    questionEvaluations.push({
      questionId: q.id,
      questionText: q.question,
      type: q.type,
      topic: q.topic,
      isCorrect,
      studentAnswerDisplay,
      correctAnswerDisplay,
      explanation: q.explanation,
      hint: q.hint,
    });
  });

  const total = quiz.questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Determine supportive performance tier
  let performanceTier: PerformanceTier = 'growing';
  let feedbackMessage =
    'Every attempt helps build your skills. Let’s review together!';
  let encouragement =
    'Learning takes practice. Review the explanations below and give it another shot whenever you are ready!';

  if (percentage >= 90) {
    performanceTier = 'excellent';
    feedbackMessage = 'Outstanding work! You have mastered these concepts.';
    encouragement =
      'You demonstrated a strong grasp of Python variables and data types. Super proud of your hard work!';
  } else if (percentage >= 70) {
    performanceTier = 'great';
    feedbackMessage = 'Great progress! You are building solid habits.';
    encouragement =
      'You are doing really well! A quick look at the few tricky questions will make you even stronger.';
  } else if (percentage >= 50) {
    performanceTier = 'practicing';
    feedbackMessage = 'Good effort! You are getting there step by step.';
    encouragement =
      'You got half or more right! Take your time reading through the review items below to reinforce your understanding.';
  }

  // Format topic breakdown
  const topicBreakdown: TopicBreakdown[] = Object.entries(topicMap).map(
    ([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percentage:
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    })
  );

  return {
    score,
    total,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    performanceTier,
    feedbackMessage,
    encouragement,
    topicBreakdown,
    questionEvaluations,
  };
}

// src/features/quiz/components/QuestionRenderer.tsx

'use client';

import React from 'react';
import type { QuizQuestion, UserQuizAnswer } from '../types/quiz';
import { MultipleChoiceQuestion } from './questions/MultipleChoiceQuestion';
import { TrueFalseQuestion } from './questions/TrueFalseQuestion';
import { MultipleSelectQuestion } from './questions/MultipleSelectQuestion';
import { ShortAnswerQuestion } from './questions/ShortAnswerQuestion';

interface QuestionRendererProps {
  question: QuizQuestion;
  answer?: UserQuizAnswer;
  onSelectOption: (optionId: string) => void;
  onToggleMultipleOption: (optionId: string) => void;
  onChangeShortAnswer: (text: string) => void;
  largeTouchTargets?: boolean;
  highContrast?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onSelectOption,
  onToggleMultipleOption,
  onChangeShortAnswer,
  largeTouchTargets = false,
  highContrast = false,
}) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          answer={answer}
          onSelectOption={onSelectOption}
          largeTouchTargets={largeTouchTargets}
          highContrast={highContrast}
        />
      );

    case 'true_false':
      return (
        <TrueFalseQuestion
          question={question}
          answer={answer}
          onSelectOption={onSelectOption}
          largeTouchTargets={largeTouchTargets}
          highContrast={highContrast}
        />
      );

    case 'multiple_select':
      return (
        <MultipleSelectQuestion
          question={question}
          answer={answer}
          onToggleOption={onToggleMultipleOption}
          largeTouchTargets={largeTouchTargets}
          highContrast={highContrast}
        />
      );

    case 'short_answer':
      return (
        <ShortAnswerQuestion
          question={question}
          answer={answer}
          onChangeText={onChangeShortAnswer}
          largeTouchTargets={largeTouchTargets}
          highContrast={highContrast}
        />
      );

    default:
      return (
        <div className="p-4 rounded-xl bg-amber-50 text-amber-900 text-sm">
          Unsupported question type.
        </div>
      );
  }
};

// MOCK DATA FOR DEVELOPMENT / DEMO ONLY

export interface MockQuestionOption {
  id: string;
  text: string;
}

export interface MockQuestion {
  id: string;
  text: string;
  options: MockQuestionOption[];
  correct_option_id: string;
  explanation: string;
}

export interface MockQuiz {
  id: string;
  lesson_id: string;
  title: string;
  questions: MockQuestion[];
}

export const MOCK_QUIZ: MockQuiz = {
  id: 'quiz_001',
  lesson_id: 'lesson_001',
  title: 'Fractions Practice Quiz',
  questions: [
    {
      id: 'q_01',
      text: 'If a pizza is cut into 4 equal slices and you eat 1 slice, what fraction of the pizza did you eat?',
      options: [
        { id: 'opt_a', text: '1/4 (One Fourth)' },
        { id: 'opt_b', text: '1/2 (One Half)' },
        { id: 'opt_c', text: '3/4 (Three Fourths)' },
        { id: 'opt_d', text: '4/4 (Whole Pizza)' },
      ],
      correct_option_id: 'opt_a',
      explanation: 'Eating 1 slice out of 4 equal total slices equals 1/4 of the pizza.',
    },
    {
      id: 'q_02',
      text: 'What is the top number of a fraction called?',
      options: [
        { id: 'opt_a', text: 'Numerator' },
        { id: 'opt_b', text: 'Denominator' },
        { id: 'opt_c', text: 'Equation' },
        { id: 'opt_d', text: 'Multiplier' },
      ],
      correct_option_id: 'opt_a',
      explanation: 'The top number is the Numerator, which shows how many equal parts you have.',
    },
  ],
};

export const MOCK_QUIZZES = [MOCK_QUIZ];

// src/features/quiz/data/mockQuizData.ts

import type { Quiz } from '../types/quiz';

export const MOCK_PYTHON_VARIABLES_QUIZ: Quiz = {
  id: 'python-variables-quiz',
  courseId: 'python-basics',
  lessonId: 'variables',
  title: 'Python Variables & Data Types Practice',
  lessonTitle: 'Variables and Data Types',
  description:
    'A friendly practice checkpoint to test your understanding of Python variables, naming rules, and basic data types.',
  estimatedMinutes: 6,
  difficulty: 'Beginner',
  topic: 'Python Fundamentals',
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      question: 'What is a variable in computer programming?',
      instruction: 'Choose the one best answer.',
      options: [
        {
          id: 'opt1_a',
          label: 'A',
          text: 'A named container that stores data values in computer memory',
        },
        {
          id: 'opt1_b',
          label: 'B',
          text: 'A physical wire that connects your computer to the internet',
        },
        {
          id: 'opt1_c',
          label: 'C',
          text: 'A tool that permanently deletes files from your computer',
        },
        {
          id: 'opt1_d',
          label: 'D',
          text: 'A secret password required to turn on your monitor',
        },
      ],
      correctAnswer: 'opt1_a',
      explanation:
        'Just like a labeled box stores a toy, a variable holds a piece of information with a name you can refer to later.',
      hint: 'Think of a labeled storage bin with a name tag.',
      difficulty: 'Beginner',
      topic: 'Variables',
    },
    {
      id: 'q2',
      type: 'true_false',
      question:
        'In Python, you do not need to declare a variable type before using it.',
      instruction: 'Decide if the statement is True or False.',
      options: [
        { id: 'tf_true', label: 'T', text: 'True' },
        { id: 'tf_false', label: 'F', text: 'False' },
      ],
      correctAnswer: 'tf_true',
      explanation:
        'Python is dynamically typed! It automatically figures out the data type based on the value you assign to it.',
      hint: 'Recall that Python figures out if something is a number or text automatically.',
      difficulty: 'Beginner',
      topic: 'Data Types',
    },
    {
      id: 'q3',
      type: 'multiple_select',
      question: 'Which of the following are valid built-in Python data types?',
      instruction: 'Choose all answers that apply.',
      options: [
        {
          id: 'opt3_int',
          label: 'A',
          text: 'int (whole numbers like 42)',
        },
        {
          id: 'opt3_str',
          label: 'B',
          text: 'str (text characters like "hello")',
        },
        {
          id: 'opt3_float',
          label: 'C',
          text: 'float (decimal numbers like 3.14)',
        },
        {
          id: 'opt3_bool',
          label: 'D',
          text: 'bool (True or False values)',
        },
        {
          id: 'opt3_wire',
          label: 'E',
          text: 'copper_wire (physical electrical conduit)',
        },
      ],
      correctAnswer: ['opt3_int', 'opt3_str', 'opt3_float', 'opt3_bool'],
      explanation:
        'Python includes int for integers, str for text, float for decimals, and bool for boolean True/False conditions. copper_wire is hardware, not a programming data type!',
      hint: 'Look for the 4 core programming data types we explored in the lesson.',
      difficulty: 'Beginner',
      topic: 'Data Types',
    },
    {
      id: 'q4',
      type: 'short_answer',
      question:
        'Which symbol is used to assign a value to a variable in Python?',
      instruction: 'Type the single symbol below.',
      correctAnswer: ['=', 'equal', 'equals', 'equal sign', '='],
      explanation:
        'The single equals sign (`=`) is the assignment operator in Python. For example: `score = 10`.',
      hint: 'It is the same key you press for mathematical equality on your keyboard.',
      difficulty: 'Beginner',
      topic: 'Syntax',
    },
    {
      id: 'q5',
      type: 'multiple_choice',
      question: 'What will the function type("Hello, World!") return in Python?',
      instruction: 'Choose the one best answer.',
      options: [
        {
          id: 'opt5_a',
          label: 'A',
          text: "<class 'str'>",
        },
        {
          id: 'opt5_b',
          label: 'B',
          text: "<class 'int'>",
        },
        {
          id: 'opt5_c',
          label: 'C',
          text: "<class 'float'>",
        },
        {
          id: 'opt5_d',
          label: 'D',
          text: "<class 'bool'>",
        },
      ],
      correctAnswer: 'opt5_a',
      explanation:
        'Text wrapped in quotation marks is recognized by Python as a string (`str`).',
      hint: 'Anything inside quotes like "Hello" is textual string data.',
      difficulty: 'Intermediate',
      topic: 'Data Types',
    },
    {
      id: 'q6',
      type: 'true_false',
      question:
        'In Python, a variable name is allowed to start with a number (e.g. 2nd_place = "Bob").',
      instruction: 'Decide if the statement is True or False.',
      options: [
        { id: 'tf_true', label: 'T', text: 'True' },
        { id: 'tf_false', label: 'F', text: 'False' },
      ],
      correctAnswer: 'tf_false',
      explanation:
        'Variable names in Python cannot start with a number! They must start with a letter or an underscore (`_`). Numbers can only appear after the first character.',
      hint: 'Remember Python variable naming rules: letters first, numbers can only follow.',
      difficulty: 'Intermediate',
      topic: 'Variables',
    },
    {
      id: 'q7',
      type: 'multiple_select',
      question: 'Which of the following are VALID variable names in Python?',
      instruction: 'Choose all answers that apply.',
      options: [
        {
          id: 'opt7_player_score',
          label: 'A',
          text: 'player_score',
        },
        {
          id: 'opt7_totalScore2',
          label: 'B',
          text: 'totalScore2',
        },
        {
          id: 'opt7_user_name',
          label: 'C',
          text: '_user_name',
        },
        {
          id: 'opt7_invalid_space',
          label: 'D',
          text: 'player score (with a space)',
        },
        {
          id: 'opt7_invalid_dash',
          label: 'E',
          text: 'player-score (with a hyphen)',
        },
      ],
      correctAnswer: ['opt7_player_score', 'opt7_totalScore2', 'opt7_user_name'],
      explanation:
        '`player_score`, `totalScore2`, and `_user_name` are all valid. Spaces and hyphens (`-`) are not allowed because Python treats hyphens as minus signs!',
      hint: 'Spaces and hyphens are not allowed in Python variable identifiers.',
      difficulty: 'Intermediate',
      topic: 'Variables',
    },
    {
      id: 'q8',
      type: 'short_answer',
      question:
        'Which built-in Python function is used to display output text onto the screen?',
      instruction: 'Type the function name below.',
      correctAnswer: ['print', 'print()', 'print ()'],
      explanation:
        'The `print()` function is the primary way to output information, messages, and variable values to the console.',
      hint: 'It starts with the letter "p" and sounds like putting ink on paper.',
      difficulty: 'Beginner',
      topic: 'Syntax',
    },
  ],
};

export const MOCK_QUIZ_REGISTRY: Record<string, Quiz> = {
  'python-basics_variables': MOCK_PYTHON_VARIABLES_QUIZ,
  'python-variables-quiz': MOCK_PYTHON_VARIABLES_QUIZ,
};

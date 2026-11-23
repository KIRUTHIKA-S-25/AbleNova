import type { Lesson } from '../types/Lesson';

export const MOCK_PYTHON_BASICS_LESSON: Lesson = {
  id: 'variables',
  courseId: 'python-basics',
  title: 'Variables and Data Types',
  description: 'Discover how Python stores information and the different kinds of values you can work with.',
  objectives: [
    { id: 'obj-1', text: 'Explain what a variable is and why it is useful' },
    { id: 'obj-2', text: 'Create a simple variable and assign a value' },
    { id: 'obj-3', text: 'Identify the most common Python data types' },
  ],
  durationMinutes: 10,
  difficulty: 'Beginner',
  sections: [
    // ─── Section 1: What is a Variable? ──────────────────────────────────────
    {
      id: 'sec-1',
      title: 'What is a Variable?',
      blocks: [
        {
          type: 'paragraph',
          content:
            'A variable is a named place where we can store information so that a program can use it later.',
        },
        {
          type: 'tip',
          title: '💡 Think of it like a labeled box',
          content:
            'Imagine a box with "age" written on the outside and the number 20 inside. That is a variable — a name pointing to a value.',
        },
        {
          type: 'definition',
          title: 'Variable',
          content:
            'A container that holds a value. You give it a name so you can refer to that value throughout your program.',
        },
      ],
      checkpoint: {
        id: 'cp-1',
        question: 'What best describes a variable?',
        options: [
          'A named container that stores a value',
          'A type of computer hardware',
          'A website address',
          'A keyboard shortcut',
        ],
        correctOptionIndex: 0,
      },
    },

    // ─── Section 2: Creating a Variable ──────────────────────────────────────
    {
      id: 'sec-2',
      title: 'Creating a Variable',
      blocks: [
        {
          type: 'paragraph',
          content:
            'In Python, you create a variable by choosing a name, writing an equals sign (=), and then providing the value you want to store.',
        },
        {
          type: 'code',
          language: 'python',
          title: 'Example',
          content: `age = 20\nname = "Alex"\nheight = 1.75`,
        },
        {
          type: 'highlight',
          content:
            'The equals sign (=) is called the assignment operator. It means "store this value in this name."',
        },
        {
          type: 'tip',
          title: '✏️ Naming tips',
          content:
            'Use descriptive names (age, not a). Start with a letter. Use underscores for spaces: first_name.',
        },
      ],
      checkpoint: {
        id: 'cp-2',
        question: 'Which of the following correctly creates a Python variable?',
        options: [
          'age = 20',
          '20 = age',
          'variable age is 20',
          'let age = 20',
        ],
        correctOptionIndex: 0,
      },
    },

    // ─── Section 3: Common Data Types ─────────────────────────────────────────
    {
      id: 'sec-3',
      title: 'Common Data Types',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Every value in Python has a type. The type tells Python what kind of information is stored and what you can do with it.',
        },
        {
          type: 'checklist',
          title: 'Common Python data types',
          options: [
            'int — whole numbers, e.g. 42',
            'float — decimal numbers, e.g. 3.14',
            'str — text (string), e.g. "hello"',
            'bool — True or False',
          ],
        },
        {
          type: 'code',
          language: 'python',
          title: 'Examples of each type',
          content: `score = 100          # int\ntemperature = 36.6   # float\ngreeting = "Hello!"  # str\nis_active = True     # bool`,
        },
      ],
      checkpoint: {
        id: 'cp-3',
        question: 'What data type would you use to store the text "Hello, World!"?',
        options: ['str', 'int', 'bool', 'float'],
        correctOptionIndex: 0,
      },
    },

    // ─── Section 4: Visual Explanation ────────────────────────────────────────
    {
      id: 'sec-4',
      title: 'Visual: Variables as Boxes',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Here is a visual way to understand how variables work in memory. Each variable is like a labelled box holding one value.',
        },
        {
          type: 'example',
          title: 'Variable boxes',
          content: JSON.stringify([
            { name: 'age', value: '20', type: 'int' },
            { name: 'name', value: '"Alex"', type: 'str' },
            { name: 'height', value: '1.75', type: 'float' },
          ]),
        },
        {
          type: 'tip',
          title: '🔄 Values can change',
          content:
            'You can reassign a variable at any time. age = 21 will replace 20 with 21 in the same box.',
        },
      ],
    },

    // ─── Section 5: Quick Practice ────────────────────────────────────────────
    {
      id: 'sec-5',
      title: 'Quick Practice',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Let's test what you have learned with a couple of quick questions. Take your time — there is no timer!",
        },
      ],
      checkpoint: {
        id: 'cp-4',
        question: 'What will Python store in the variable below?\n\nscore = 95',
        options: [
          'The integer 95',
          'The text "score"',
          'Nothing — this will cause an error',
          'The decimal 9.5',
        ],
        correctOptionIndex: 0,
      },
    },

    // ─── Section 6: Summary ───────────────────────────────────────────────────
    {
      id: 'sec-6',
      title: 'Summary',
      blocks: [
        {
          type: 'summary',
          title: '🎉 Great work! Here is what you learned:',
          content:
            'Variables are named containers that store values. You create them with the assignment operator (=). Python has several data types: int, float, str, and bool. Choosing good variable names makes your code easier to read.',
        },
        {
          type: 'checklist',
          title: 'You can now:',
          options: [
            'Explain what a variable is',
            'Create a simple variable in Python',
            'Identify the four most common data types',
          ],
        },
      ],
    },
  ],
};

// Registry of all mock lessons keyed by courseId/lessonId
export const MOCK_LESSON_REGISTRY: Record<string, Record<string, Lesson>> = {
  'python-basics': {
    variables: MOCK_PYTHON_BASICS_LESSON,
  },
};

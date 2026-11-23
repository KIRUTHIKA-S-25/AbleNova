import {
  AIExplanationRequest,
  AIExplanationResponse,
  AIConversation,
  AIMessage,
  AIContext
} from '../types/ai';

export class AIService {
  /**
   * Send a message to the AI Assistant service.
   * Currently uses a deterministic mock implementation designed to match POST /ai/explanation.
   */
  static async sendExplanationRequest(request: AIExplanationRequest): Promise<AIExplanationResponse> {
    // Simulate slight network delay for realistic experience
    await new Promise((resolve) => setTimeout(resolve, 600));

    const query = request.question.toLowerCase();
    const mode = request.mode || 'standard';
    const ctx = request.context;

    // 1. Contextual Mistake Explanation
    if (ctx?.questionText && ctx?.studentAnswer) {
      return {
        response: `Let's break down this question together!\n\nQuestion: "${ctx.questionText}"\nYour choice: "${ctx.studentAnswer}"\n\nWhy this happens: In Python, strings must be wrapped in quotes (like "Alex" or 'hello'). When you write name = Alex without quotes, Python thinks Alex is another variable that hasn't been created yet!`,
        mode,
        code_snippet: `# Incorrect:\nname = Alex  # NameError!\n\n# Correct:\nname = "Alex"  # Stored cleanly as text!`,
        source_ids: ['chunk_syntax_quotes']
      };
    }

    // 2. Hint Mode
    if (mode === 'hint' || query.includes('hint')) {
      return {
        response: `Here's a gentle hint to guide your thinking:\n\nThink about what you store inside a labeled container so you can find it later when your code runs!`,
        mode: 'hint',
        source_ids: ['chunk_hints']
      };
    }

    // 3. Simplified Explanation Mode
    if (mode === 'simplified' || query.includes('simply') || query.includes('simple')) {
      if (query.includes('variable')) {
        return {
          response: `Imagine a small box with a sticky label on the front!\n\n• You write a name on the label (like age).\n• You drop a value inside the box (like 12).\n• Whenever your program needs that number, it looks inside the age box!`,
          mode: 'simplified',
          source_ids: ['chunk_variables_simple']
        };
      }
      if (query.includes('loop')) {
        return {
          response: `A loop is like asking a robot to repeat a chore until a timer goes off!\n\nInstead of typing the same command 5 times, you tell Python: "Do this 5 times for me!"`,
          mode: 'simplified',
          source_ids: ['chunk_loops_simple']
        };
      }
      if (query.includes('function')) {
        return {
          response: `A function is like a cooking recipe saved in a binder!\n\nYou give the recipe a name (like make_sandwich), put the instructions inside, and call its name whenever you get hungry!`,
          mode: 'simplified',
          source_ids: ['chunk_functions_simple']
        };
      }
      return {
        response: `Let's keep it extra simple! Break the concept into 3 easy steps: 1) Give it a clear name, 2) Assign a value or action, and 3) Let your code run!`,
        mode: 'simplified',
        source_ids: ['chunk_general_simple']
      };
    }

    // 4. Code Example Mode
    if (mode === 'example' || query.includes('example')) {
      if (query.includes('variable')) {
        return {
          response: `Here is a clear Python variable example:`,
          mode: 'example',
          code_snippet: `# Creating variables in Python\nplayer_name = "Alex"\nscore = 100\nis_active = True\n\nprint(player_name, "has score:", score)`,
          source_ids: ['chunk_var_example']
        };
      }
      if (query.includes('loop')) {
        return {
          response: `Here is a simple for loop example counting from 1 to 3:`,
          mode: 'example',
          code_snippet: `# Count 1 to 3\nfor i in range(1, 4):\n    print("Step number:", i)`,
          source_ids: ['chunk_loop_example']
        };
      }
      return {
        response: `Here is a code example to demonstrate:`,
        mode: 'example',
        code_snippet: `# Python Example\ndef greet(name):\n    return "Hello " + name + "!"\n\nprint(greet("Alex"))`,
        source_ids: ['chunk_general_example']
      };
    }

    // 5. Summary Mode
    if (mode === 'summary' || query.includes('summarize') || query.includes('summary')) {
      return {
        response: `Lesson Summary:\n\n1. Variables store information in memory using clear names.\n2. Standard data types include Strings (text), Integers (whole numbers), and Booleans (True/False).\n3. Good variable names make your code clean and easy for everyone to read!`,
        mode: 'summary',
        source_ids: ['chunk_summary']
      };
    }

    // 6. Progress & Practice Query
    if (query.includes('progress') || query.includes('practice')) {
      return {
        response: `Based on your recent activity, you're doing great in Variables (90%) and Conditions (82%)! Your main area for growth is Functions (54%). Spending 10 minutes practicing function parameters will boost your overall mastery!`,
        mode: 'standard',
        source_ids: ['chunk_progress_guidance']
      };
    }

    // Default Fallback Educational Response
    return {
      response: `That's a wonderful question! In Python programming, clarity comes from testing step-by-step. Would you like me to give you a simple code example or a short hint?`,
      mode: 'standard',
      source_ids: ['chunk_default']
    };
  }

  /**
   * Helper to create initial welcome conversation
   */
  static getInitialConversation(context?: AIContext): AIConversation {
    const welcomeMsg: AIMessage = {
      id: 'welcome-1',
      role: 'ai',
      content: context?.lessonTitle
        ? `Hi Alex! I'm Nova, your AbleNova Learning Assistant. I'm right here with you for "${context.lessonTitle}". Ask me anything or request a simpler explanation!`
        : `Hi Alex! I'm Nova, your personal AbleNova AI tutor. Ask me any question about your lessons, code, or practice quizzes!`,
      timestamp: 'Just now',
      status: 'sent',
      context
    };

    return {
      id: `conv-${Date.now()}`,
      title: context?.lessonTitle ? `Help with ${context.lessonTitle}` : 'Learning Assistant Chat',
      messages: [welcomeMsg],
      context,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

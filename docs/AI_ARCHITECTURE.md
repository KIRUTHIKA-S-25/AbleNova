# AbleNova — AI Learning Engine Architecture

This document describes the architectural design, components, safety barriers, and integration protocols powering the AI learning engine of the AbleNova platform.

---

## 1. System Vision & Foundational Philosophy

AbleNova provides an AI-powered personalized learning platform tailored specifically for children with diverse learning needs and accessibility requirements in remote and underserved areas.

The AI does not serve as a replacement for human educators or caregivers. Rather, it operates as a warm, patient, and highly adaptive **learning companion**:
- It scaffolds student understanding without giving answers away.
- It adapts explanations to the student's age, grade, language, and accessibility preferences.
- It grounds responses strictly in curriculum reference material retrieved via RAG.
- It strictly adheres to child privacy (COPPA/FERPA) and maintains a zero-tolerance policy against medical or disability diagnoses.

---

## 2. Architectural Blueprint

```
+-----------------------------------------------------------------------------------+
|                                AbleNova Client                                    |
|   (Web UI, Screen Readers, Offline Sync Cache, Audio Narration, High Contrast)    |
+-----------------------------------------------------------------------------------+
                                        |  HTTPS / REST JSON
                                        v
+-----------------------------------------------------------------------------------+
|                             FastAPI Routing Layer                                 |
|   /api/v1/ai/explanation, /ai/ask, /ai/simplify, /ai/translate, /ai/hints, etc.   |
+-----------------------------------------------------------------------------------+
       |                                      |                              |
       | Role-Based Auth                      | Input Sanitization           | IDOR Guards
       v                                      v                              v
+-----------------------------------------------------------------------------------+
|                       Adaptive AIService Orchestrator                             |
|  - Student Profile Resolution (Grade, Age, Language, Accessibility Preferences)   |
|  - Explanation Mode Selector (Standard, Simplified, Hint, Analogy, Visual, etc.) |
|  - Source Attribution & Request Caching                                           |
+-----------------------------------------------------------------------------------+
       |                                                                     |
       | Semantic Query                                                      | Grounded Prompt
       v                                                                     v
+----------------------------------+               +--------------------------------+
|       RAG Vector Service         |               |     Gemini Provider Layer      |
|  - SentenceTransformers (384-d)  |               |  - System Instruction Defense  |
|  - ChromaDB Vector Index         |               |  - Context Delimiters          |
|  - Metadata Filter & Dedup       |               |  - Retry & Rate Limit Handlers |
|  - Supabase / PostgreSQL Store   |               |  - Safe Mock Testing Fallback  |
+----------------------------------+               +--------------------------------+
```

---

## 3. Core Engine Components

### 3.1 AIService (`backend/app/services/ai_service.py`)
The central orchestrator for all AI operations. Responsibilities:
1. **Student Context Resolution**: Queries the student's `grade`, `preferred_language`, and `AccessibilityProfile` flags (`simplified_content`, `audio_enabled`, `captions_enabled`, `large_text`).
2. **Adaptive Mode Switching**: If a student's profile indicates cognitive accessibility needs (`simplified_content = True`), requests defaulted to standard mode are automatically adapted to `simplified`.
3. **Retrieval Coordination**: Dispatches semantic queries to `RAGService` to acquire top curriculum chunks matching the subject, topic, and grade level.
4. **Attribution Cache**: Stores source chunk identifiers, document titles, page numbers, and similarity metrics keyed by `request_id` for transparent provenance lookup.

### 3.2 AI Provider Abstraction (`backend/app/services/ai_provider.py`)
Abstracts generative AI backends behind the `BaseAIProvider` interface:
- **`GeminiProvider`**: Interfaces with Google Gemini (e.g., `gemini-1.5-flash` / `gemini-2.5-flash`) through the official `google-genai` SDK. Features exponential backoff retries, response timeout handling, and strict token limits.
- **`MockAIProvider`**: A zero-external-dependency, deterministic mock provider for testing and development. Ensures test suites run instantaneously offline without spending API quota or failing on network drops.
- **Provider Factory**: `get_ai_provider()` selects the live provider if `GEMINI_API_KEY` is present, or defaults safely to `MockAIProvider`.

### 3.3 Explanation Modes
The engine supports nine distinct pedagogic modes:
1. **`standard`**: Conversational, age-appropriate, grounded curriculum explanation.
2. **`simplified`**: Short sentences (<15 words), plain vocabulary, bulleted main ideas (ideal for cognitive load reduction).
3. **`hint`**: Multi-tiered scaffolding hints (Level 1: clue, Level 2: guided question, Level 3: step-by-step scaffold).
4. **`example`**: Concrete, tangible, real-world examples.
5. **`summary`**: Bulleted key takeaway summary with bounded word counts.
6. **`analogy`**: Relatable real-world metaphors (e.g., comparing plant cells to a solar kitchen).
7. **`vocabulary`**: Difficult terms defined in plain words with child-friendly phonetic pronunciation guides.
8. **`visual_description`**: Screen-reader and sensory friendly verbal descriptions of diagrams, charts, and layouts.
9. **`step_by_step`**: Numbered, sequential instructions with self-check prompts.

---

## 4. Prompt Segregation & Safety Isolation

To prevent prompt injection, model jailbreaks, and context corruption:
- System instructions are strictly segregated from user inputs using provider-level `system_instruction` configuration.
- Retrieved curriculum chunks are encapsulated within XML-style boundary tags:
  ```xml
  <educational_context source_id="chunk_uuid">
  ... passive curriculum text ...
  </educational_context>
  ```
- Student questions are wrapped in `<student_query>` tags.
- The system instructions explicitly mandate that text inside `<educational_context>` must never be executed as instructions, preventing indirect injection attacks.

# Phase 6 — Adaptive Learning Experience & Lesson Module Documentation

## Overview

The Lesson Module provides an accessible, responsive, and adaptive self-paced learning interface designed specifically for children with diverse cognitive, sensory, and motor abilities. It is routed at `/learn/[courseId]/[lessonId]`.

---

## Architecture & File Structure

```text
frontend/src/
├── app/
│   └── learn/
│       └── [courseId]/
│           └── [lessonId]/
│               └── page.tsx           # Assembled lesson view with responsive layout & states
├── features/
│   └── lesson/
│       ├── types/
│       │   └── Lesson.ts              # Core TypeScript interfaces & contracts
│       ├── data/
│       │   └── mockLessonData.ts      # Python Basics curriculum (6 comprehensive sections)
│       ├── services/
│       │   └── lessonService.ts       # Clean async data abstraction (getLesson)
│       ├── store/
│       │   └── useLessonStore.ts      # Zustand store with LocalStorage persistence
│       └── components/
│           ├── AudioPlayer.tsx        # Web Speech API engine with fallback & transcript
│           ├── Breadcrumbs.tsx        # Breadcrumb trail & return navigation
│           ├── Checkpoint.tsx         # Inline interactive micro-quiz with feedback
│           ├── CompletionScreen.tsx   # Lesson complete celebration & next action CTAs
│           ├── ContentBlock.tsx       # Polymorphic block renderer (code, tip, box, etc.)
│           ├── LessonIntro.tsx        # Title, description, objectives & metadata header
│           ├── LessonProgressBar.tsx  # Mint/cyan animated progress bar with ARIA
│           ├── LessonSkeleton.tsx     # Animated shimmer loading skeleton
│           ├── LessonStates.tsx       # Accessible Error and Empty states with retry
│           └── SectionList.tsx        # Desktop sidebar section navigation
```

---

## Key Capabilities

### 1. Polymorphic Content Renderer (`ContentBlock.tsx`)
Supports multiple rich block types configured to provide multi-modal learning:
- **Heading & Paragraph**: Structured typography with semantic tags.
- **Tip & Warning**: Supportive callout boxes with high-contrast icons.
- **Visual Explanation (`visual-boxes`)**: Visual memory representation diagrams (e.g. variable memory boxes with name, value, and type).
- **Code Block (`code`)**: Dark high-contrast syntax container with one-click copy to clipboard and language tags.
- **Definition (`definition`)**: Key terms highlighted in purple accent cards.
- **Checklist (`checklist`)**: Step-by-step key concept checklists with emerald check icons.

### 2. Native Web Speech API Audio Narration (`AudioPlayer.tsx`)
- Detects browser speech synthesis capabilities safely via `useSyncExternalStore` (zero hydration mismatch).
- Provides Play, Pause, and Replay audio controls.
- Dynamically translates lesson section blocks into speech narration.
- Includes an expandable accessible transcript panel for deaf/hard-of-hearing learners or noisy environments.

### 3. Interactive Checkpoints (`Checkpoint.tsx`)
- Inline comprehension checkpoints for each section.
- Non-punitive design: immediately marks correct answers in soft emerald with celebratory encouragement, or indicates needed review with a 1-click retry option.
- Full keyboard navigation and ARIA radio semantics.

### 4. Progress Tracking & Persistence (`useLessonStore.ts`)
- Backed by Zustand and synced to browser `localStorage` under key `ablenova_lesson_progress_{lessonId}`.
- Tracks completed sections, current section index, and checkpoint choices.
- Automatically restores prior progress when a student returns to the lesson.

### 5. Adaptive Accessibility Conformance
Reuses the global `useAccessibilityStore`:
- **Font Sizing**: Dynamically scales typography (`normal`, `large`, `xlarge`).
- **Contrast Modes**: Adapts code blocks, callouts, and borders for `high-contrast`.
- **Reduced Motion**: Disables transition animations when preferred.
- **Large Touch Targets**: Ensures interactive buttons meet the 48×48px minimum touch target requirement.
- **Simplified Explanations**: Supports plain-language simplified modes.

---

## Route & Usage

- **Default Route**: `/learn/python-basics/variables`
- **Dashboard Link**: The **Continue Learning** card on `/student` links directly into this lesson module.

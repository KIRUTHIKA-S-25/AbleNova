# AbleNova — System Architecture

**Project:** AbleNova
**Version:** 1.0

---

# 1. Project Overview

AbleNova is an AI-powered accessible and adaptive learning platform designed specifically for children with disabilities.

The system combines:

* Accessibility
* Personalized learning
* Adaptive difficulty
* AI assistance
* RAG
* Progress tracking
* Learning mastery
* Offline-first functionality
* Low-bandwidth support

The architecture separates frontend presentation from backend learning intelligence.

---

# 2. High-Level Architecture

```text
                         ABLE NOVA
                             │
              ┌──────────────┴──────────────┐
              │                             │
          FRONTEND                       BACKEND
              │                             │
       Next.js + TS                    FastAPI
              │                             │
       Accessibility                 Business Logic
              │                             │
       Adaptive UI              ┌───────────┼───────────┐
              │                  │           │           │
             PWA                DB          AI          RAG
              │                  │           │           │
         IndexedDB           Supabase     Gemini     pgvector
              │                  │
              └──────── REST API ──────────┘
```

---

# 3. Frontend Technology

The frontend uses:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
PWA
IndexedDB
Recharts
```

---

# 4. Frontend Responsibilities

Frontend is responsible for:

```text
UI
↓
Accessibility
↓
User interaction
↓
Local state
↓
Offline storage
↓
API communication
```

The frontend must NOT contain:

* Database credentials
* Gemini API key
* RAG implementation
* Database queries
* Core recommendation logic
* Quiz answer evaluation

---

# 5. Backend Technology

Backend uses:

```text
Python
FastAPI
Pydantic
SQLAlchemy
PostgreSQL
Supabase
```

---

# 6. Backend Responsibilities

Backend is responsible for:

```text
Authentication
Authorization
Database
Quiz evaluation
Progress
Mastery
Recommendations
Learning path
Analytics
AI
RAG
Content processing
Synchronization
```

---

# 7. AI Architecture

```text
                 AI LAYER
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
        Gemini               RAG
          │                   │
          │                pgvector
          │                   │
          └─────────┬─────────┘
                    ↓
          Personalized response
```

The frontend communicates with AI only through FastAPI.

---

# 8. Content Processing

AbleNova does not require manually storing every lesson in PostgreSQL.

The content pipeline is:

```text
Teacher uploads educational file
             ↓
       Supabase Storage
             ↓
      Document Metadata
             ↓
       Text Extraction
             ↓
          Chunking
             ↓
         Embeddings
             ↓
          pgvector
```

The source file remains in cloud storage.

Relevant text chunks are retrieved when required.

---

# 9. RAG Flow

```text
Student Question
       ↓
FastAPI
       ↓
Create Query Embedding
       ↓
pgvector Similarity Search
       ↓
Relevant Educational Chunks
       ↓
Context Filtering
       ↓
Gemini
       ↓
Personalized Explanation
       ↓
Frontend
```

Filtering can consider:

```text
grade
subject
topic
language
difficulty
```

---

# 10. Adaptive Learning Architecture

The core learning loop is:

```text
Student
   ↓
Lesson
   ↓
Interactive Activity
   ↓
Quiz
   ↓
Quiz Submission
   ↓
Backend Evaluation
   ↓
Performance Data
   ↓
Mastery Estimation
   ↓
Recommendation Engine
   ↓
Next Learning Activity
```

---

# 11. Adaptive Difficulty

The backend analyzes:

```text
Quiz accuracy
+
Recent performance
+
Historical performance
+
Topic mastery
+
Completion history
```

Then determines whether the next content should be:

```text
Easier
Same level
More challenging
```

Example:

```text
Accuracy < 50%
      ↓
Provide easier lesson + additional practice


Accuracy 50–80%
      ↓
Continue current difficulty


Accuracy > 80%
      ↓
Consider increasing difficulty
```

These thresholds are configurable and should not be hardcoded throughout the application.

---

# 12. Adaptive Presentation

Frontend controls how content is presented.

```text
Accessibility Profile
       ↓
Adaptive Presentation
       ↓
 ┌─────────────────────┐
 │ Standard Text       │
 │ Simplified Text     │
 │ Audio               │
 │ Captions            │
 │ Large Text          │
 │ High Contrast       │
 │ Reduced Motion      │
 │ Keyboard Navigation │
 └─────────────────────┘
```

The backend supplies content.

The frontend determines the presentation mode according to the student's settings.

---

# 13. Accessibility Architecture

The interface should support:

### Visual Accessibility

* High contrast
* Large text
* Clear typography
* Reduced visual clutter
* Accessible color contrast

### Auditory Accessibility

* Captions
* Text alternatives
* Audio controls

### Motor Accessibility

* Keyboard navigation
* Large interactive targets
* Reduced interaction complexity

### Cognitive Accessibility

* Simplified language
* Step-by-step explanations
* Consistent navigation
* Reduced distractions
* Clear feedback

---

# 14. Offline Architecture

AbleNova uses an offline-first approach.

```text
                 INTERNET
                    │
              ┌─────┴─────┐
              │           │
            ONLINE      OFFLINE
              │           │
              ↓           ↓
           FastAPI     IndexedDB
              │           │
              ↓           ↓
           Supabase    Pending Events
                          │
                          ↓
                       Internet
                          │
                          ↓
                        /sync
```

---

# 15. Offline Data

The frontend can cache selected:

```text
Lessons
Quiz questions
Learning resources
```

Offline events can include:

```text
Quiz attempts
Lesson completion
Learning activity events
```

When connectivity returns:

```text
IndexedDB
    ↓
POST /sync
    ↓
FastAPI
    ↓
Validation
    ↓
Duplicate detection
    ↓
Database
```

---

# 16. Synchronization

Every offline event contains:

```text
local_id
type
payload
created_at
sync_status
```

Example:

```text
local_001
quiz_attempt
{answers...}
2026-08-30T10:00:00Z
pending_sync
```

The backend must ensure that repeated synchronization does not create duplicate records.

---

# 17. Student Flow

```text
Login
 ↓
Student Dashboard
 ↓
View Learning Path
 ↓
Select Lesson
 ↓
Accessible Lesson Presentation
 ↓
Interactive Activity
 ↓
Quiz
 ↓
Submit
 ↓
Immediate Feedback
 ↓
Mastery Update
 ↓
Recommendation
 ↓
Next Learning Activity
```

---

# 18. Teacher Flow

```text
Teacher Login
      ↓
Teacher Dashboard
      ↓
Upload Educational Content
      ↓
Content Processing
      ↓
RAG Indexing
      ↓
View Students
      ↓
View Progress
      ↓
View Difficult Topics
      ↓
Learning Analytics
```

---

# 19. Caregiver Flow

```text
Caregiver Login
      ↓
Authorized Student
      ↓
Progress
      ↓
Strengths
      ↓
Areas for Practice
      ↓
Recommendations
```

---

# 20. User Roles

## Student

Can:

* Learn
* Take quizzes
* View progress
* Ask AI for help
* Follow recommendations
* Configure accessibility settings

## Teacher

Can:

* Upload learning resources
* View authorized students
* View progress
* View analytics

## Caregiver

Can:

* View authorized student progress
* View strengths
* View areas for practice
* View recommendations

---

# 21. Security Boundary

```text
                    CLIENT
                       │
                       ↓
                    FastAPI
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Supabase      Gemini      pgvector
```

Secrets must remain on the backend.

Never expose:

```text
GEMINI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

to the frontend.

---

# 22. API Boundary

The REST API is the official integration boundary.

```text
Developer 1
Frontend
    │
    │ REST API
    ↓
Developer 2
Backend
```

Frontend depends only on API contracts.

Backend implementation can change internally without requiring frontend changes, provided the API contract remains unchanged.

---

# 23. Mock API Development

Frontend development initially uses mock responses.

Example:

```text
GET /student/progress
```

Mock response:

```json
{
  "overall_progress": 0.68,
  "subjects": [],
  "recent_scores": [],
  "weak_topics": [],
  "strong_topics": [],
  "learning_time_minutes": 120
}
```

The frontend should be developed against this structure.

During integration:

```text
Mock API
    ↓
Replace
    ↓
Real FastAPI
```

The UI should not need major changes.

---

# 24. Development Ownership

## Developer 1 — Frontend

Owns:

```text
frontend/
```

Technologies:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
PWA
IndexedDB
Recharts
```

Responsibilities:

```text
Student UI
Teacher UI
Caregiver UI
Accessibility
Adaptive presentation
Offline interface
API client
Frontend testing
```

---

## Developer 2 — Backend + AI

Owns:

```text
backend/
```

Technologies:

```text
Python
FastAPI
PostgreSQL
Supabase
SQLAlchemy
pgvector
Gemini
RAG
LlamaIndex
Scikit-learn
```

Responsibilities:

```text
Authentication
Database
REST APIs
Quiz evaluation
Progress
Mastery
Recommendations
Learning path
RAG
Gemini
Content ingestion
Analytics
Synchronization
Backend testing
```

---

# 25. Shared Files

Both developers may read:

```text
docs/API_CONTRACT.md
docs/DATABASE_SCHEMA.md
docs/ARCHITECTURE.md
README.md
```

However, shared architecture changes must be discussed before implementation.

---

# 26. Integration Strategy

Development occurs independently.

```text
                    main
                     │
            ┌────────┴────────┐
            ↓                 ↓
       Frontend           Backend
        Branch              Branch
            │                 │
            ↓                 ↓
       Independent        Independent
       Development        Development
            │                 │
            └────────┬────────┘
                     ↓
                 Integration
                     ↓
                  Testing
                     ↓
                    main
```

---

# 27. Integration Sequence

Integration should follow:

```text
Authentication
      ↓
Student Profile
      ↓
Subjects
      ↓
Topics
      ↓
Lessons
      ↓
Quizzes
      ↓
Quiz Submission
      ↓
Progress
      ↓
Mastery
      ↓
Recommendations
      ↓
AI Explanation
      ↓
RAG
      ↓
Offline Synchronization
```

---

# 28. Testing Strategy

Test each layer independently.

### Frontend

Test:

```text
UI
Accessibility
Navigation
Offline mode
API handling
Responsive design
```

### Backend

Test:

```text
Authentication
Authorization
Database
API endpoints
Quiz evaluation
Mastery
Recommendations
AI services
RAG
Synchronization
```

### Integration

Test:

```text
Login
→ Lesson
→ Quiz
→ Result
→ Mastery
→ Recommendation
→ Next lesson
```

Then:

```text
Offline lesson
→ Offline quiz
→ Reconnect
→ Synchronization
→ Updated progress
```

---

# 29. Deployment Architecture

Target architecture:

```text
User Device
     ↓
Frontend Hosting
     ↓
Next.js
     ↓
FastAPI Backend
     ↓
Supabase
 ┌───────────────┐
 │ PostgreSQL    │
 │ Storage       │
 │ pgvector      │
 │ Authentication│
 └───────────────┘
     ↓
Gemini API
```

Hosting providers can be selected during deployment.

---

# 30. Core Design Principle

AbleNova has two separate intelligence layers.

## Adaptive Presentation

Owned by the frontend:

```text
How should this content be presented to this learner?
```

## Adaptive Learning Intelligence

Owned by the backend:

```text
What should this learner learn next?
```

This separation ensures clean development and minimizes frontend/backend integration conflicts.

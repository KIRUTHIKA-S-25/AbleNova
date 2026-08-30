# AbleNova — API Contract

**Project:** AbleNova
**Version:** 1.0
**API Version:** `/api/v1`

This document is the official communication contract between the AbleNova frontend and backend.

The frontend and backend developers must follow these endpoint names, request formats, response formats, field names, and responsibilities.

---

# 1. Base API

All backend APIs are exposed under:

```text
/api/v1
```

Local development:

```text
http://localhost:8000/api/v1
```

Frontend must access the backend through an environment variable:

```text
NEXT_PUBLIC_API_BASE_URL
```

The frontend must NEVER directly connect to:

* PostgreSQL
* pgvector
* Gemini API
* Supabase service-role APIs
* private backend services

All communication must go through FastAPI.

---

# 2. Authentication

Protected endpoints use:

```text
Authorization: Bearer <access_token>
```

---

## POST `/auth/register`

Creates a new account.

### Request

```json
{
  "name": "Student",
  "email": "student@example.com",
  "password": "password",
  "role": "student"
}
```

Allowed roles:

```text
student
teacher
caregiver
```

### Response

```json
{
  "access_token": "token",
  "token_type": "bearer",
  "user": {
    "id": "user_001",
    "name": "Student",
    "email": "student@example.com",
    "role": "student"
  }
}
```

---

## POST `/auth/login`

### Request

```json
{
  "email": "student@example.com",
  "password": "password"
}
```

### Response

```json
{
  "access_token": "token",
  "token_type": "bearer",
  "user": {
    "id": "user_001",
    "name": "Student",
    "email": "student@example.com",
    "role": "student"
  }
}
```

---

## GET `/me`

Returns the authenticated user.

### Response

```json
{
  "id": "user_001",
  "name": "Student",
  "email": "student@example.com",
  "role": "student"
}
```

---

# 3. Student Profile

## GET `/student/profile`

### Response

```json
{
  "student_id": "student_001",
  "name": "Student",
  "age": 12,
  "grade": 7,
  "preferred_language": "en",
  "accessibility": {
    "text_enabled": true,
    "audio_enabled": true,
    "captions_enabled": true,
    "simplified_content": true,
    "large_text": false,
    "high_contrast": false,
    "reduced_motion": false,
    "keyboard_navigation": true
  }
}
```

---

## PUT `/student/profile`

Updates the student's profile and accessibility preferences.

### Request

```json
{
  "preferred_language": "en",
  "accessibility": {
    "text_enabled": true,
    "audio_enabled": true,
    "captions_enabled": true,
    "simplified_content": true,
    "large_text": false,
    "high_contrast": false,
    "reduced_motion": false,
    "keyboard_navigation": true
  }
}
```

### Response

Returns the updated student profile using the same structure as:

```text
GET /student/profile
```

---

# 4. Subjects

## GET `/subjects`

### Response

```json
{
  "subjects": [
    {
      "id": "sub_001",
      "name": "Mathematics",
      "description": "Mathematics learning",
      "progress": 0.68
    }
  ]
}
```

---

# 5. Topics

## GET `/subjects/{subject_id}/topics`

Example:

```text
GET /subjects/sub_001/topics
```

### Response

```json
{
  "topics": [
    {
      "id": "topic_001",
      "subject_id": "sub_001",
      "name": "Fractions",
      "progress": 0.65,
      "mastery": 0.62,
      "difficulty": "intermediate"
    }
  ]
}
```

Difficulty values:

```text
beginner
intermediate
advanced
```

---

# 6. Lessons

## GET `/lessons/{lesson_id}`

### Response

```json
{
  "id": "lesson_001",
  "topic_id": "topic_001",
  "title": "Introduction to Fractions",
  "difficulty": "beginner",
  "language": "en",
  "estimated_minutes": 10,
  "content": {
    "standard": "Standard lesson content.",
    "simplified": "Simplified lesson content.",
    "audio_url": null,
    "caption_text": null
  }
}
```

The backend supplies the educational content.

The frontend determines how the content should be presented according to accessibility preferences.

---

# 7. Quizzes

## GET `/quizzes/{quiz_id}`

### Response

```json
{
  "id": "quiz_001",
  "lesson_id": "lesson_001",
  "title": "Fractions Quiz",
  "questions": [
    {
      "id": "question_001",
      "type": "multiple_choice",
      "question": "What is 1/2?",
      "options": [
        "A",
        "B",
        "C",
        "D"
      ],
      "difficulty": "beginner"
    }
  ]
}
```

### Security Rule

The response MUST NOT contain:

```text
correct_answer
```

The correct answer remains on the backend.

---

# 8. Submit Quiz

## POST `/quizzes/{quiz_id}/submit`

### Request

```json
{
  "answers": [
    {
      "question_id": "question_001",
      "answer": "B",
      "time_taken_seconds": 12
    }
  ]
}
```

The backend performs the official evaluation.

The frontend must NOT calculate or send the final score.

---

# 9. Quiz Result

### Response

```json
{
  "score": 7,
  "total": 10,
  "accuracy": 0.70,
  "time_taken_seconds": 180,
  "topic_results": [
    {
      "topic_id": "topic_001",
      "accuracy": 0.70
    }
  ],
  "feedback": "Good progress. Review equivalent fractions.",
  "recommendation_id": "rec_001"
}
```

---

# 10. Student Progress

## GET `/student/progress`

### Response

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

---

# 11. Recommendations

## GET `/student/recommendations`

### Response

```json
{
  "recommendations": [
    {
      "id": "rec_001",
      "lesson_id": "lesson_001",
      "title": "Fractions — Basic Practice",
      "reason": "Additional practice is recommended based on recent performance.",
      "difficulty": "beginner",
      "estimated_minutes": 10
    }
  ]
}
```

The backend generates recommendations.

The frontend displays them.

---

# 12. Personalized Learning Path

## GET `/student/learning-path`

### Response

```json
{
  "items": [
    {
      "lesson_id": "lesson_001",
      "order": 1,
      "reason": "Build foundational understanding.",
      "status": "recommended"
    }
  ]
}
```

The backend determines the recommended learning sequence.

---

# 13. AI Explanation

## POST `/ai/explanation`

The frontend sends a question to the backend.

### Request

```json
{
  "lesson_id": "lesson_001",
  "question": "Explain this simply",
  "mode": "simplified"
}
```

Allowed modes:

```text
standard
simplified
hint
example
summary
```

### Response

```json
{
  "response": "Plants use sunlight to make food.",
  "source_ids": [
    "chunk_001"
  ],
  "mode": "simplified"
}
```

The backend is responsible for Gemini/RAG processing.

---

# 14. Content Upload

## POST `/content/upload`

Content type:

```text
multipart/form-data
```

Fields:

```text
file
subject_id
topic_id
grade
language
difficulty
```

The backend performs:

```text
Upload
↓
Storage
↓
Text extraction
↓
Chunking
↓
Embedding
↓
Vector storage
```

The frontend only handles:

* File selection
* Upload
* Progress
* Processing status
* Error display

---

# 15. Teacher Students

## GET `/teacher/students`

### Response

```json
{
  "students": [
    {
      "student_id": "student_001",
      "name": "Student",
      "progress": 0.68,
      "mastery": 0.62,
      "engagement": 0.71,
      "last_active": "2026-08-30T10:00:00Z"
    }
  ]
}
```

---

# 16. Teacher Student Details

## GET `/teacher/students/{student_id}`

Returns detailed educational progress for an authorized student.

The backend must enforce authorization.

---

# 17. Teacher Analytics

## GET `/teacher/analytics`

Returns:

```text
Average progress
Difficult topics
Performance trends
Engagement trends
```

Example:

```json
{
  "average_progress": 0.64,
  "difficult_topics": [],
  "performance_trend": [],
  "engagement_trend": []
}
```

---

# 18. Caregiver Dashboard

## GET `/caregiver/student/{student_id}`

### Response

```json
{
  "progress": 0.68,
  "strengths": [],
  "areas_for_practice": [],
  "completed_lessons": 10,
  "recommendations": []
}
```

The backend must verify that the caregiver is authorized to access the student.

---

# 19. Offline Synchronization

## POST `/sync`

Used to synchronize offline learning events.

### Request

```json
{
  "events": [
    {
      "local_id": "local_001",
      "type": "quiz_attempt",
      "payload": {},
      "created_at": "2026-08-30T10:00:00Z"
    }
  ]
}
```

### Response

```json
{
  "synced": [
    "local_001"
  ],
  "failed": []
}
```

The backend MUST make synchronization idempotent.

The same `local_id` must not create duplicate records.

---

# 20. Standard Error Format

All errors must follow:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

Supported codes:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
AI_UNAVAILABLE
CONTENT_PROCESSING_ERROR
SYNC_ERROR
SERVER_ERROR
```

---

# 21. Frontend Responsibilities

Frontend owns:

* UI
* Accessibility presentation
* Navigation
* Local state
* API client
* Offline storage
* IndexedDB
* User interaction
* Loading states
* Error states
* Responsive design

---

# 22. Backend Responsibilities

Backend owns:

* Authentication
* Authorization
* Database
* Quiz evaluation
* Progress calculation
* Mastery calculation
* Recommendations
* Learning path
* AI
* RAG
* ML
* Analytics
* Content processing
* Synchronization

---

# 23. API Change Policy

Do not change endpoint names or response structures without agreement between both developers.

If a breaking change is required:

1. Update this document.
2. Update frontend TypeScript interfaces.
3. Update backend Pydantic models.
4. Test the API.
5. Notify the other developer.

---

# 24. Security Rules

Never expose the following to the frontend:

```text
GEMINI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

All secrets must remain in backend environment variables.

---

# 25. API Versioning

Current API:

```text
/api/v1
```

Breaking future changes should use:

```text
/api/v2
```

Do not silently break `/api/v1`.

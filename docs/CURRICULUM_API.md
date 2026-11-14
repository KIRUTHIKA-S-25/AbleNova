# AbleNova Backend — Curriculum & Topic Management APIs

## 1. Overview & Architecture

The Curriculum Management subsystem in AbleNova powers the educational foundation for accessible, personalized learning designed for children with diverse learning needs in remote and underserved areas.

The curriculum is structured hierarchically:
```
Subject  (e.g., Mathematics, Science, Reading)
  └── Topic  (e.g., Fractions, Ecosystems, Phonics)
        └── Lesson  (Standard & Simplified presentation tiers, audio, captions)
              ├── Learning Objectives (Specific measurable outcomes)
              └── Lesson Resources (Metadata references to media & worksheets)
```

The system integrates deterministic mastery and prerequisite progression guards:
- **Foundational Prerequisite Tracking**: Advanced topics can designate a `prerequisite_topic_id`. A learner is barred from accessing lessons in locked topics until achieving at least 70% (`0.70`) mastery on the prerequisite topic.
- **Personalized Student Curriculum**: Tailored directly to student grade, preferred language, current mastery scores, and accessibility preferences.
- **Disability-Friendly Learning Metadata**: Comprehensive descriptions of multimodal presentation channels (audio narration, captions, simplified text, screen-reader optimizations, high-contrast readiness, and reduced-motion compatibility) without collecting intrusive medical or diagnostic classifications.

---

## 2. Database Models & Schema Extensions

### `subjects` Table
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `UUID` (PK) | `uuid.uuid4()` | Subject unique identifier |
| `name` | `VARCHAR(255)` | - | Unique subject title |
| `description` | `TEXT` | `NULL` | Detailed description |
| `grade_level_min` | `INTEGER` | `1` | Lowest target grade |
| `grade_level_max` | `INTEGER` | `12` | Highest target grade |
| `is_active` | `BOOLEAN` | `TRUE` | Administrative availability toggle |
| `language` | `VARCHAR(10)` | `'en'` | Primary ISO language code |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `now()` | Timestamp |

### `topics` Table
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `UUID` (PK) | `uuid.uuid4()` | Topic unique identifier |
| `subject_id` | `UUID` (FK → `subjects.id`) | - | Parent subject association (CASCADE) |
| `name` | `VARCHAR(255)` | - | Topic title |
| `description` | `TEXT` | `NULL` | Topic scope description |
| `difficulty` | `VARCHAR(50)` | `'intermediate'` | beginner / intermediate / advanced |
| `order_index` | `INTEGER` | `0` | Sequence ordering within subject |
| `grade_level` | `INTEGER` | `5` | Target grade level |
| `is_active` | `BOOLEAN` | `TRUE` | Administrative toggle |
| `prerequisite_topic_id` | `UUID` (FK → `topics.id`) | `NULL` | Prerequisite topic required for progression |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `now()` | Timestamp |

### `lessons` Table Extensions
| Column | Type | Default | Description |
|---|---|---|---|
| `description` | `TEXT` | `NULL` | Lesson summary |
| `grade_level` | `INTEGER` | `5` | Target grade |
| `is_published` | `BOOLEAN` | `TRUE` | Publication state (draft vs active) |
| `accessibility_metadata` | `JSON` | `NULL` | Disability-friendly feature capabilities |
| `created_by_teacher_id` | `UUID` (FK → `teachers.id`) | `NULL` | Author teacher ownership identifier |

### `learning_objectives` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` (PK) | Objective identifier |
| `lesson_id` | `UUID` (FK → `lessons.id`) | Parent lesson (CASCADE) |
| `description` | `TEXT` | Specific learning goal |
| `order_index` | `INTEGER` | Display order |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Creation timestamp |

### `lesson_resources` Table (Metadata Only)
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` (PK) | Resource metadata identifier |
| `lesson_id` | `UUID` (FK → `lessons.id`) | Parent lesson (CASCADE) |
| `title` | `VARCHAR(255)` | Resource title |
| `resource_type` | `VARCHAR(50)` | document, image, audio, video, worksheet, link |
| `url` | `VARCHAR(1024)` | Secure external CDN or storage reference URL |
| `file_size_bytes` | `INTEGER` | Resource file size |
| `format` | `VARCHAR(50)` | pdf, mp3, mp4, png, webp |
| `accessibility_description` | `TEXT` | Alt-text, caption reference, or transcript |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Creation timestamp |

*Architectural Boundary: Large binary assets (PDFs, videos, audio) are never stored in PostgreSQL; only secure URL references and accessibility descriptions are recorded.*

---

## 3. Role-Based Authorization Matrix

| Endpoint | Method | Public / Guest | Student | Teacher (Owner) | Teacher (Other) | Caregiver | Admin |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `/subjects` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/subjects` | `POST` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `/subjects/{id}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/subjects/{id}` | `PUT` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `/subjects/{id}/topics` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/subjects/{id}/topics` | `POST` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `/topics/{id}` | `GET` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/topics/{id}` | `PUT` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `/topics/{id}/lessons` | `GET` | ✅ (pub) | ✅ (unlocked) | ✅ (all) | ✅ (all) | ✅ (pub) | ✅ (all) |
| `/lessons` | `GET` | ✅ (pub) | ✅ (pub) | ✅ (all) | ✅ (all) | ✅ (pub) | ✅ (all) |
| `/lessons/{id}` | `GET` | ✅ (pub) | ✅ (pub) | ✅ (all) | ✅ (all) | ✅ (pub) | ✅ (all) |
| `/lessons` | `POST` | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `/lessons/{id}` | `PUT` | ❌ | ❌ | ✅ | ❌ (403) | ❌ | ✅ |
| `/lessons/{id}/publish` | `POST` | ❌ | ❌ | ✅ | ❌ (403) | ❌ | ✅ |
| `/lessons/{id}/unpublish`| `POST` | ❌ | ❌ | ✅ | ❌ (403) | ❌ | ✅ |
| `/lessons/{id}/objectives` | `POST`/`DELETE` | ❌ | ❌ | ✅ | ❌ (403) | ❌ | ✅ |
| `/lessons/{id}/resources` | `POST`/`DELETE` | ❌ | ❌ | ✅ | ❌ (403) | ❌ | ✅ |
| `/student/curriculum` | `GET` | ❌ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| `/student/curriculum/next` | `GET` | ❌ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| `/students/{id}/curriculum` | `GET` | ❌ | ✅ (self) | ✅ (linked) | ❌ (403) | ✅ (linked) | ✅ |

---

## 4. API Endpoints Reference

### 4.1 Subject Listing & Filtering
```http
GET /api/v1/subjects?q=Math&grade=5&language=en&is_active=true
```

#### Response (200 OK)
```json
{
  "subjects": [
    {
      "id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
      "name": "Mathematics",
      "description": "Core mathematics curriculum",
      "progress": 0.68,
      "grade_level_min": 1,
      "grade_level_max": 8,
      "is_active": true,
      "language": "en"
    }
  ]
}
```

---

### 4.2 Subject Details with Child Topics
```http
GET /api/v1/subjects/{subject_id}
```

#### Response (200 OK)
```json
{
  "id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
  "name": "Mathematics",
  "description": "Core mathematics curriculum",
  "grade_level_min": 1,
  "grade_level_max": 8,
  "is_active": true,
  "language": "en",
  "progress": 0.65,
  "created_at": "2026-11-14T09:00:00Z",
  "topics": [
    {
      "id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
      "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
      "name": "Fractions",
      "description": "Understanding parts of wholes",
      "progress": 0.65,
      "mastery": 0.62,
      "difficulty": "intermediate",
      "order_index": 1,
      "grade_level": 5,
      "is_active": true,
      "prerequisite_topic_id": null,
      "is_locked": false,
      "is_completed": false
    }
  ]
}
```

---

### 4.3 Topics by Subject
```http
GET /api/v1/subjects/{subject_id}/topics
```

#### Response (200 OK)
```json
{
  "topics": [
    {
      "id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
      "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
      "name": "Fractions",
      "description": "Understanding parts of wholes",
      "progress": 0.85,
      "mastery": 0.85,
      "difficulty": "beginner",
      "order_index": 1,
      "grade_level": 5,
      "is_active": true,
      "prerequisite_topic_id": null,
      "is_locked": false,
      "is_completed": true
    },
    {
      "id": "8f12a34b-9e20-410a-b345-0d9124a91bce",
      "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
      "name": "Decimals and Percentages",
      "description": "Converting between fractions and decimals",
      "progress": 0.0,
      "mastery": 0.0,
      "difficulty": "intermediate",
      "order_index": 2,
      "grade_level": 5,
      "is_active": true,
      "prerequisite_topic_id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
      "is_locked": false,
      "is_completed": false
    }
  ]
}
```

---

### 4.4 Topic Details with Child Lessons
```http
GET /api/v1/topics/{topic_id}
```

#### Response (200 OK)
```json
{
  "id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
  "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
  "name": "Fractions",
  "description": "Understanding parts of wholes",
  "difficulty": "intermediate",
  "order_index": 1,
  "grade_level": 5,
  "is_active": true,
  "prerequisite_topic_id": null,
  "is_locked": false,
  "is_completed": false,
  "progress": 0.40,
  "mastery": 0.40,
  "created_at": "2026-11-14T09:00:00Z",
  "lessons": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "topic_id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
      "title": "Introduction to Fractions",
      "description": "Visualizing numerators and denominators",
      "difficulty": "beginner",
      "language": "en",
      "estimated_minutes": 10,
      "grade_level": 5,
      "is_published": true,
      "has_audio": true,
      "has_simplified": true
    }
  ]
}
```

---

### 4.5 Student Personalized Curriculum Overview
```http
GET /api/v1/student/curriculum
Authorization: Bearer <student_token>
```

#### Response (200 OK)
```json
{
  "student_id": "b3e94a82-62a1-4351-9e60-f8b1d9c3a011",
  "grade": 5,
  "preferred_language": "en",
  "accessibility_summary": {
    "text_enabled": true,
    "audio_enabled": true,
    "captions_enabled": true,
    "simplified_content": true,
    "large_text": false,
    "high_contrast": true,
    "reduced_motion": true,
    "keyboard_navigation": true
  },
  "overall_progress": 0.52,
  "completed_topics_count": 4,
  "total_topics_count": 8,
  "subjects": [
    {
      "id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
      "name": "Mathematics",
      "description": "Core mathematics curriculum",
      "progress": 0.65,
      "topics": [
        {
          "id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
          "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
          "name": "Fractions",
          "description": "Understanding parts of wholes",
          "order_index": 1,
          "difficulty": "beginner",
          "grade_level": 5,
          "mastery": 0.85,
          "progress": 0.85,
          "is_completed": true,
          "is_locked": false,
          "prerequisite_topic_id": null,
          "lesson_count": 3
        },
        {
          "id": "8f12a34b-9e20-410a-b345-0d9124a91bce",
          "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
          "name": "Decimals and Percentages",
          "description": "Converting fractions to decimals",
          "order_index": 2,
          "difficulty": "intermediate",
          "grade_level": 5,
          "mastery": 0.0,
          "progress": 0.0,
          "is_completed": false,
          "is_locked": false,
          "prerequisite_topic_id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
          "lesson_count": 2
        }
      ]
    }
  ]
}
```

---

### 4.6 Next Progression Step (Topic & Accessible Lesson Recommendation)
```http
GET /api/v1/student/curriculum/next
Authorization: Bearer <student_token>
```

#### Response (200 OK)
```json
{
  "student_id": "b3e94a82-62a1-4351-9e60-f8b1d9c3a011",
  "subject": {
    "id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
    "name": "Mathematics"
  },
  "topic": {
    "id": "8f12a34b-9e20-410a-b345-0d9124a91bce",
    "subject_id": "e4b2d184-7a13-4c91-9556-9a0d8c0b561e",
    "name": "Decimals and Percentages",
    "description": "Converting fractions to decimals",
    "order_index": 2,
    "difficulty": "intermediate",
    "grade_level": 5,
    "mastery": 0.0,
    "progress": 0.0,
    "is_completed": false,
    "is_locked": false,
    "prerequisite_topic_id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
    "lesson_count": 2
  },
  "next_lesson": {
    "id": "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    "topic_id": "8f12a34b-9e20-410a-b345-0d9124a91bce",
    "title": "Decimals Visualized",
    "difficulty": "beginner",
    "language": "en",
    "estimated_minutes": 10,
    "grade_level": 5,
    "is_published": true,
    "has_audio": true,
    "has_simplified": true,
    "accessibility_tags": [
      "accessible",
      "audio_narration",
      "captions",
      "simplified_text"
    ]
  },
  "recommendation_reason": "Prerequisite topic completed. Ready to progress to 'Decimals and Percentages'."
}
```

---

### 4.7 Lesson Detail (With Content Tiers & Accessibility Metadata)
```http
GET /api/v1/lessons/{lesson_id}
```

#### Response (200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "topic_id": "3cb49a71-6e3e-461d-91b6-71d37b12204c",
  "title": "Introduction to Fractions",
  "description": "Visualizing numerators and denominators",
  "difficulty": "beginner",
  "language": "en",
  "estimated_minutes": 10,
  "grade_level": 5,
  "is_published": true,
  "content": {
    "standard": "A fraction represents a numerical part of a whole quantity.",
    "simplified": "Fractions show parts of things, like slices of a pie.",
    "audio_url": "https://cdn.ablenova.org/audio/fractions_intro.mp3",
    "caption_text": "Fractions represent parts of a whole."
  },
  "accessibility": {
    "has_audio": true,
    "has_captions": true,
    "has_simplified": true,
    "text_alternatives": true,
    "keyboard_accessible": true,
    "high_contrast_ready": true,
    "screen_reader_optimized": true,
    "reduced_motion_compatible": true,
    "supported_languages": ["en"]
  },
  "objectives": [
    {
      "id": "f1e2d3c4-b5a6-7890-1234-56789abcdef0",
      "lesson_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "description": "Identify numerator and denominator in a proper fraction",
      "order_index": 1,
      "created_at": "2026-11-14T09:00:00Z"
    }
  ],
  "resources": [
    {
      "id": "e9f8d7c6-b5a4-3210-fedc-ba9876543210",
      "lesson_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Fraction Pie Chart Diagram",
      "resource_type": "image",
      "url": "https://cdn.ablenova.org/diagrams/fractions_pie.png",
      "file_size_bytes": 84520,
      "format": "png",
      "accessibility_description": "High contrast pie chart divided into 4 equal quadrants with 1 shaded.",
      "created_at": "2026-11-14T09:00:00Z"
    }
  ],
  "created_by_teacher_id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d"
}
```

---

## 5. Standard Error Responses

Adhering to Section 20 of `API_CONTRACT.md`:

### Locked Topic Restriction (403 Forbidden)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "This topic is locked until prerequisite topics are completed.",
    "status_code": 403
  }
}
```

### Unpublished Lesson Access Attempt (403 Forbidden)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "This lesson is not yet published.",
    "status_code": 403
  }
}
```

### Unauthorized Relationship Access (403 Forbidden)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to access this student's records",
    "status_code": 403
  }
}
```

### Non-Owner Teacher Edit Attempt (403 Forbidden)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only modify lessons you created.",
    "status_code": 403
  }
}
```

### Resource Not Found (404 NOT_FOUND)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Subject not found.",
    "status_code": 404
  }
}
```


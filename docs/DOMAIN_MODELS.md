# AbleNova — Domain Models & Pydantic Schemas Reference

**Project:** AbleNova  
**Version:** 1.0 (Phase 4 Implementation)  
**Branch:** `backend-development`  
**Database Platform:** Supabase PostgreSQL + pgvector  
**ORM:** SQLAlchemy 2.0  
**Validation:** Pydantic v2  
**Migrations:** Alembic  

---

## 1. Domain Architecture Overview

Phase 4 introduces 21 SQLAlchemy domain models and matching Pydantic schemas, implementing the exact schema defined in `docs/DATABASE_SCHEMA.md` and `docs/API_CONTRACT.md`.

```text
users (id, email, name, role, password_hash)
 ├── teachers (id, user_id)
 │     ├── teacher_students (teacher_id, student_id)
 │     └── content_documents (id, teacher_id, subject_id, topic_id, file_name, storage_path)
 │           └── content_chunks (id, document_id, content, embedding: vector(768))
 │
 ├── caregivers (id, user_id)
 │     └── caregiver_students (caregiver_id, student_id, relationship_type)
 │
 └── students (id, user_id, age, grade, preferred_language)
       ├── accessibility_profiles (student_id, text/audio/captions/contrast/motion/keys)
       ├── quiz_attempts (id, student_id, quiz_id, score, accuracy)
       │     └── question_attempts (id, attempt_id, question_id, student_answer, is_correct)
       ├── student_topic_mastery (student_id, topic_id, mastery_score, confidence)
       ├── learning_sessions (id, student_id, lesson_id, started_at, completed_at)
       ├── engagement_events (id, student_id, event_type, lesson_id, timestamp)
       ├── recommendations (id, student_id, lesson_id, reason, difficulty, status)
       └── learning_path_items (id, student_id, lesson_id, order_index, reason, status)

subjects (id, name, description)
 └── topics (id, subject_id, name, difficulty)
       └── lessons (id, topic_id, title, difficulty, standard/simplified content)
             └── quizzes (id, lesson_id, title)
                   └── questions (id, quiz_id, topic_id, question_text, options, correct_answer)
```

---

## 2. Implemented SQLAlchemy Models

### A. Core Accounts & Privacy (`app/db/models/user.py`, `student.py`)
1. **User (`users`)**:
   - `id`: UUID (Primary Key, default `uuid.uuid4`)
   - `email`: String(255) (Unique, Indexed, Nullable=False)
   - `name`: String(255)
   - `role`: String(50) (`student`, `teacher`, `caregiver`, `admin`)
   - `password_hash`: String(255) (Bcrypt hashed)
   - `created_at`, `updated_at`: DateTime(timezone=True)
2. **Student (`students`)**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key `users.id`, Unique, Cascade delete)
   - `age`: Integer (3 to 25)
   - `grade`: Integer (1 to 12)
   - `preferred_language`: String(10) (default `"en"`)
3. **Teacher (`teachers`)**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key `users.id`, Unique, Cascade delete)
4. **Caregiver (`caregivers`)**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key `users.id`, Unique, Cascade delete)
5. **TeacherStudent (`teacher_students`)**:
   - Explicit many-to-many relationship linking teachers to authorized students.
   - Primary Key: `(teacher_id, student_id)`
6. **CaregiverStudent (`caregiver_students`)**:
   - Explicit many-to-many relationship linking caregivers to authorized students.
   - Primary Key: `(caregiver_id, student_id)`
   - `relationship_type`: String(50) (e.g., `"parent"`, `"guardian"`)
7. **AccessibilityProfile (`accessibility_profiles`)**:
   - Primary Key & Foreign Key: `student_id` (`students.id`, Cascade delete)
   - **Privacy Boundary**: Contains zero medical diagnoses or psychological labels.
   - Fields: `text_enabled`, `audio_enabled`, `captions_enabled`, `simplified_content`, `large_text`, `high_contrast`, `reduced_motion`, `keyboard_navigation`.

### B. Curriculum & Learning Content (`app/db/models/curriculum.py`)
8. **Subject (`subjects`)**:
   - `id`: UUID (Primary Key)
   - `name`: String(255) (Unique, Indexed)
   - `description`: Text
   - `grade_level_min`: Integer (Default 1)
   - `grade_level_max`: Integer (Default 12)
   - `is_active`: Boolean (Default True, Indexed)
   - `language`: String(10) (Default `"en"`)
9. **Topic (`topics`)**:
   - `id`: UUID (Primary Key)
   - `subject_id`: UUID (Foreign Key `subjects.id`, Indexed, Cascade delete)
   - `name`: String(255)
   - `description`: Text
   - `difficulty`: String(50) (`beginner`, `intermediate`, `advanced`)
   - `order_index`: Integer
   - `grade_level`: Integer (Default 5)
   - `is_active`: Boolean (Default True, Indexed)
   - `prerequisite_topic_id`: UUID (Foreign Key `topics.id`, Set NULL on delete, Self-referential prerequisite tracking)
10. **Lesson (`lessons`)**:
    - `id`: UUID (Primary Key)
    - `topic_id`: UUID (Foreign Key `topics.id`, Indexed, Cascade delete)
    - `title`: String(255)
    - `description`: Text
    - `difficulty`: String(50)
    - `language`: String(10)
    - `estimated_minutes`: Integer
    - `grade_level`: Integer (Default 5)
    - `is_published`: Boolean (Default True, Indexed)
    - `standard_content`: Text (standard educational tier)
    - `simplified_content`: Text (cognitive accessibility tier)
    - `audio_url`: String(1024) (optional audio narration)
    - `caption_text`: Text (optional caption transcripts)
    - `accessibility_metadata`: JSON (disability-friendly learning metadata)
    - `created_by_teacher_id`: UUID (Foreign Key `teachers.id`, Set NULL on delete)
    - `source_document_id`: UUID (Foreign Key `content_documents.id`, Set NULL on delete)
11. **LearningObjective (`learning_objectives`)**:
    - `id`: UUID (Primary Key)
    - `lesson_id`: UUID (Foreign Key `lessons.id`, Indexed, Cascade delete)
    - `description`: Text (measurable learning goal)
    - `order_index`: Integer
    - `created_at`: DateTime(timezone=True)
12. **LessonResource (`lesson_resources`)**:
    - `id`: UUID (Primary Key)
    - `lesson_id`: UUID (Foreign Key `lessons.id`, Indexed, Cascade delete)
    - `title`: String(255)
    - `resource_type`: String(50) (e.g. `document`, `image`, `audio`, `video`, `worksheet`, `link`)
    - `url`: String(1024) (metadata reference to storage/CDN; no binary in DB)
    - `file_size_bytes`: Integer (optional)
    - `format`: String(50) (e.g. `pdf`, `mp3`, `mp4`, `png`)
    - `accessibility_description`: Text (alt-text, transcript, audio description)
    - `created_at`: DateTime(timezone=True)

### C. Quizzes & Question Evaluation (`app/db/models/quiz.py`)
11. **Quiz (`quizzes`)**:
    - `id`: UUID (Primary Key)
    - `lesson_id`: UUID (Foreign Key `lessons.id`, Indexed, Cascade delete)
    - `title`: String(255)
12. **Question (`questions`)**:
    - `id`: UUID (Primary Key)
    - `quiz_id`: UUID (Foreign Key `quizzes.id`, Indexed, Cascade delete)
    - `topic_id`: UUID (Foreign Key `topics.id`, Indexed, Cascade delete)
    - `question_text`: Text
    - `question_type`: String(50) (default `"multiple_choice"`)
    - `options`: JSON (list of choices)
    - `correct_answer`: String(255) (**Backend-only; never exposed via student API**)
    - `explanation`: Text
    - `difficulty`: String(50)
13. **QuizAttempt (`quiz_attempts`)**:
    - `id`: UUID (Primary Key)
    - `student_id`: UUID (Foreign Key `students.id`, Indexed, Cascade delete)
    - `quiz_id`: UUID (Foreign Key `quizzes.id`, Indexed, Cascade delete)
    - `score`: Integer
    - `total_questions`: Integer
    - `accuracy`: Float (0.0 to 1.0)
    - `time_taken_seconds`: Integer
14. **QuestionAttempt (`question_attempts`)**:
    - `id`: UUID (Primary Key)
    - `attempt_id`: UUID (Foreign Key `quiz_attempts.id`, Indexed, Cascade delete)
    - `question_id`: UUID (Foreign Key `questions.id`, Indexed, Cascade delete)
    - `student_answer`: String(255)
    - `is_correct`: Boolean
    - `time_taken_seconds`: Integer

### D. Progress, Mastery, & Recommendations (`app/db/models/progress.py`)
15. **StudentTopicMastery (`student_topic_mastery`)**:
    - Primary Key: `(student_id, topic_id)`
    - `mastery_score`: Float (0.0 to 1.0)
    - `confidence`: Float (0.0 to 1.0)
    - `updated_at`: DateTime(timezone=True)
16. **LearningSession (`learning_sessions`)**:
    - `id`: UUID (Primary Key)
    - `student_id`: UUID (Foreign Key `students.id`, Indexed, Cascade delete)
    - `lesson_id`: UUID (Foreign Key `lessons.id`, Indexed, Cascade delete)
    - `started_at`, `completed_at`, `duration_seconds`
17. **EngagementEvent (`engagement_events`)**:
    - Telemetry tracking (e.g. `"lesson_started"`, `"quiz_completed"`, `"ai_help_requested"`).
18. **Recommendation (`recommendations`)**:
    - `id`: UUID (Primary Key)
    - `student_id`, `lesson_id`, `reason`, `difficulty`, `estimated_minutes`, `status`
19. **LearningPathItem (`learning_path_items`)**:
    - `id`: UUID (Primary Key)
    - `student_id`, `lesson_id`, `order_index`, `reason`, `status`

### E. Content Ingestion & Vector Storage (`app/db/models/content.py`)
20. **ContentDocument (`content_documents`)**:
    - Stores metadata for files in Supabase Storage (`storage_path`).
    - `teacher_id`, `subject_id`, `topic_id`, `grade`, `language`, `status`.
21. **ContentChunk (`content_chunks`)**:
    - Text chunk extracted from educational document.
    - `embedding`: VectorType(768) (pgvector on PostgreSQL; JSON on SQLite fallback).

---

## 3. Pydantic Schema Organization (`app/schemas/`)

| Module | Core Schemas | Purpose & Contract Compliance |
|---|---|---|
| `common.py` | `BaseSchema`, `UserRole`, `DifficultyLevel`, `ContentStatus`, `RecommendationStatus` | Common enums and BaseSchema with `from_attributes=True`. |
| `user.py` | `UserCreate`, `UserUpdate`, `UserRead`, `TokenResponse`, `TeacherRead`, `CaregiverRead` | User account schemas. `UserRead` excludes `password_hash`. |
| `student.py` | `AccessibilityProfileBase`, `AccessibilityProfileUpdate`, `StudentCreate`, `StudentProfileResponse` | Profile schemas. Strictly assistive options, zero medical labels. Matches `GET /student/profile`. |
| `curriculum.py` | `SubjectItemResponse`, `TopicItemResponse`, `LessonContent`, `LessonDetailResponse` | Matches `GET /subjects`, `GET /subjects/{id}/topics`, and `GET /lessons/{id}`. |
| `quiz.py` | `QuestionRead`, `QuestionCreate`, `QuizRead`, `QuizSubmission`, `QuizResultResponse` | Security: `QuestionRead` omits `correct_answer`. Matches `GET /quizzes/{id}` and `POST /submit`. |
| `progress.py` | `StudentProgressResponse`, `RecommendationRead`, `LearningPathResponse`, `LearningSessionRead` | Matches `GET /student/progress`, `/recommendations`, `/learning-path`. |
| `content.py` | `ContentDocumentCreate`, `ContentDocumentRead`, `ContentChunkRead`, `AIExplanationResponse` | Ingestion metadata and `POST /ai/explanation` response schema. |
| `sync.py` | `SyncEventItem`, `SyncRequest`, `SyncResponse` | Offline synchronization payload adhering to Section 19. |

---

## 4. Alembic Migration History

- **`0001_setup_extensions`** (Phase 3): Enables `vector` (`pgvector`) and `uuid-ossp` on PostgreSQL.
- **`8c12c5387ad5_create_domain_models`** (Phase 4): Creates all 21 domain tables, indexes, constraints, and foreign key cascades.

To run migrations:
```powershell
# From backend directory
python -m alembic upgrade head
python -m alembic downgrade -1
```

# AbleNova — Database Schema

**Database:** PostgreSQL
**Platform:** Supabase
**Vector Search:** pgvector
**Version:** 1.0

---

# 1. Database Architecture

AbleNova uses three storage layers.

### PostgreSQL

Stores structured application data:

* Users
* Students
* Teachers
* Caregivers
* Subjects
* Topics
* Lessons
* Quizzes
* Questions
* Quiz attempts
* Progress
* Mastery
* Recommendations
* Engagement events

### Supabase Storage

Stores large files:

* PDFs
* DOCX
* Learning resources
* Audio files

### pgvector

Stores vector embeddings for:

* Educational document chunks
* Searchable learning content
* RAG retrieval

---

# 2. users

| Column     | Type      | Description               |
| ---------- | --------- | ------------------------- |
| id         | UUID      | Primary key               |
| email      | TEXT      | User email                |
| name       | TEXT      | Display name              |
| role       | TEXT      | student/teacher/caregiver |
| created_at | TIMESTAMP | Account creation          |

Roles:

```text
student
teacher
caregiver
```

---

# 3. students

| Column             | Type      | Description        |
| ------------------ | --------- | ------------------ |
| id                 | UUID      | Primary key        |
| user_id            | UUID      | FK → users         |
| age                | INTEGER   | Student age        |
| grade              | INTEGER   | Grade level        |
| preferred_language | TEXT      | Preferred language |
| created_at         | TIMESTAMP | Creation time      |

---

# 4. teachers

| Column     | Type      | Description   |
| ---------- | --------- | ------------- |
| id         | UUID      | Primary key   |
| user_id    | UUID      | FK → users    |
| created_at | TIMESTAMP | Creation time |

---

# 5. caregivers

| Column     | Type      | Description   |
| ---------- | --------- | ------------- |
| id         | UUID      | Primary key   |
| user_id    | UUID      | FK → users    |
| created_at | TIMESTAMP | Creation time |

---

# 6. accessibility_profiles

| Column              | Type    | Description        |
| ------------------- | ------- | ------------------ |
| student_id          | UUID    | Primary key / FK   |
| text_enabled        | BOOLEAN | Text presentation  |
| audio_enabled       | BOOLEAN | Audio support      |
| captions_enabled    | BOOLEAN | Caption support    |
| simplified_content  | BOOLEAN | Simplified content |
| large_text          | BOOLEAN | Large text         |
| high_contrast       | BOOLEAN | High contrast      |
| reduced_motion      | BOOLEAN | Reduce animations  |
| keyboard_navigation | BOOLEAN | Keyboard support   |

---

# 7. subjects

| Column      | Type | Description         |
| ----------- | ---- | ------------------- |
| id          | UUID | Primary key         |
| name        | TEXT | Subject name        |
| description | TEXT | Subject description |

Example:

```text
Mathematics
Science
English
Computer Science
```

---

# 8. topics

| Column      | Type | Description       |
| ----------- | ---- | ----------------- |
| id          | UUID | Primary key       |
| subject_id  | UUID | FK → subjects     |
| name        | TEXT | Topic name        |
| description | TEXT | Topic description |

Relationship:

```text
Subject
   ↓
Topic
```

---

# 9. lessons

| Column             | Type    | Description        |
| ------------------ | ------- | ------------------ |
| id                 | UUID    | Primary key        |
| topic_id           | UUID    | FK → topics        |
| title              | TEXT    | Lesson title       |
| difficulty         | TEXT    | Difficulty         |
| language           | TEXT    | Language           |
| estimated_minutes  | INTEGER | Estimated duration |
| standard_content   | TEXT    | Standard lesson    |
| simplified_content | TEXT    | Simplified lesson  |
| audio_url          | TEXT    | Optional audio     |
| caption_text       | TEXT    | Optional captions  |
| source_document_id | UUID    | Optional source    |

Difficulty:

```text
beginner
intermediate
advanced
```

---

# 10. quizzes

| Column      | Type | Description      |
| ----------- | ---- | ---------------- |
| id          | UUID | Primary key      |
| lesson_id   | UUID | FK → lessons     |
| title       | TEXT | Quiz title       |
| description | TEXT | Quiz description |

---

# 11. questions

| Column         | Type  | Description             |
| -------------- | ----- | ----------------------- |
| id             | UUID  | Primary key             |
| quiz_id        | UUID  | FK → quizzes            |
| topic_id       | UUID  | FK → topics             |
| question_text  | TEXT  | Question                |
| question_type  | TEXT  | Question type           |
| options        | JSONB | Multiple-choice options |
| correct_answer | TEXT  | Correct answer          |
| explanation    | TEXT  | Explanation             |
| difficulty     | TEXT  | Difficulty              |

### Security

`correct_answer` is backend-only.

It must never be returned by the public quiz endpoint.

---

# 12. quiz_attempts

| Column             | Type      | Description     |
| ------------------ | --------- | --------------- |
| id                 | UUID      | Primary key     |
| student_id         | UUID      | FK → students   |
| quiz_id            | UUID      | FK → quizzes    |
| score              | INTEGER   | Score           |
| total_questions    | INTEGER   | Total questions |
| accuracy           | FLOAT     | Accuracy        |
| time_taken_seconds | INTEGER   | Time            |
| created_at         | TIMESTAMP | Attempt time    |

---

# 13. question_attempts

| Column             | Type    | Description        |
| ------------------ | ------- | ------------------ |
| id                 | UUID    | Primary key        |
| attempt_id         | UUID    | FK → quiz_attempts |
| question_id        | UUID    | FK → questions     |
| student_answer     | TEXT    | Student answer     |
| is_correct         | BOOLEAN | Evaluation         |
| time_taken_seconds | INTEGER | Time               |

---

# 14. student_topic_mastery

| Column        | Type      | Description   |
| ------------- | --------- | ------------- |
| student_id    | UUID      | FK → students |
| topic_id      | UUID      | FK → topics   |
| mastery_score | FLOAT     | 0.0–1.0       |
| confidence    | FLOAT     | 0.0–1.0       |
| updated_at    | TIMESTAMP | Last update   |

Mastery is an educational estimate based on learning activity.

It must not be presented as a medical or psychological diagnosis.

---

# 15. learning_sessions

| Column           | Type      | Description   |
| ---------------- | --------- | ------------- |
| id               | UUID      | Primary key   |
| student_id       | UUID      | FK → students |
| lesson_id        | UUID      | FK → lessons  |
| started_at       | TIMESTAMP | Start         |
| completed_at     | TIMESTAMP | Completion    |
| duration_seconds | INTEGER   | Duration      |

---

# 16. engagement_events

| Column           | Type      | Description       |
| ---------------- | --------- | ----------------- |
| id               | UUID      | Primary key       |
| student_id       | UUID      | FK → students     |
| event_type       | TEXT      | Event             |
| lesson_id        | UUID      | Related lesson    |
| timestamp        | TIMESTAMP | Event time        |
| duration_seconds | INTEGER   | Optional duration |

Example events:

```text
lesson_started
lesson_completed
quiz_started
quiz_completed
ai_help_requested
```

Only collect educationally useful information.

Avoid unnecessary behavioral surveillance.

---

# 17. recommendations

| Column            | Type      | Description           |
| ----------------- | --------- | --------------------- |
| id                | UUID      | Primary key           |
| student_id        | UUID      | FK → students         |
| lesson_id         | UUID      | FK → lessons          |
| reason            | TEXT      | Why recommended       |
| difficulty        | TEXT      | Difficulty            |
| estimated_minutes | INTEGER   | Duration              |
| created_at        | TIMESTAMP | Creation              |
| status            | TEXT      | Recommendation status |

---

# 18. learning_path_items

| Column      | Type    | Description    |
| ----------- | ------- | -------------- |
| id          | UUID    | Primary key    |
| student_id  | UUID    | FK → students  |
| lesson_id   | UUID    | FK → lessons   |
| order_index | INTEGER | Learning order |
| reason      | TEXT    | Reason         |
| status      | TEXT    | Status         |

---

# 19. content_documents

| Column       | Type      | Description           |
| ------------ | --------- | --------------------- |
| id           | UUID      | Primary key           |
| teacher_id   | UUID      | FK → teachers         |
| file_name    | TEXT      | Original filename     |
| storage_path | TEXT      | Supabase Storage path |
| subject_id   | UUID      | Subject               |
| topic_id     | UUID      | Topic                 |
| grade        | INTEGER   | Grade                 |
| language     | TEXT      | Language              |
| difficulty   | TEXT      | Difficulty            |
| status       | TEXT      | Processing status     |
| created_at   | TIMESTAMP | Upload time           |

Status:

```text
uploaded
processing
processed
failed
```

---

# 20. content_chunks

| Column      | Type    | Description            |
| ----------- | ------- | ---------------------- |
| id          | UUID    | Primary key            |
| document_id | UUID    | FK → content_documents |
| content     | TEXT    | Text chunk             |
| embedding   | VECTOR  | Embedding              |
| page_number | INTEGER | Source page            |
| chunk_index | INTEGER | Chunk position         |
| metadata    | JSONB   | Additional metadata    |

The vector dimension must match the selected embedding model.

---

# 21. Why We Do Not Store Every Lesson in PostgreSQL

AbleNova does not require every educational document to be manually entered into database tables.

Instead:

```text
Teacher
   ↓
Uploads PDF/DOCX
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

PostgreSQL stores metadata and searchable chunks.

The original large file remains in Supabase Storage.

---

# 22. RAG Architecture

When a student asks:

```text
"What is photosynthesis?"
```

the backend performs:

```text
Student Question
      ↓
Embedding
      ↓
pgvector similarity search
      ↓
Relevant content chunks
      ↓
Grade/subject/topic filtering
      ↓
Gemini
      ↓
Personalized answer
```

The response should be grounded in the available educational content.

---

# 23. Core Relationships

```text
users
 │
 ├── students
 │      │
 │      ├── accessibility_profiles
 │      ├── quiz_attempts
 │      ├── mastery
 │      ├── learning_sessions
 │      ├── engagement_events
 │      ├── recommendations
 │      └── learning_path_items
 │
 ├── teachers
 │      │
 │      └── content_documents
 │
 └── caregivers


subjects
   │
   └── topics
          │
          └── lessons
                 │
                 └── quizzes
                        │
                        └── questions


content_documents
       │
       └── content_chunks
                 │
                 └── pgvector
```

---

# 24. Database Ownership

Backend developer owns:

* Database schema
* SQL migrations
* Seed data
* Relationships
* Database queries
* Row Level Security
* Vector storage

Frontend developer must not directly modify database schema.

---

# 25. Privacy

Store only educationally necessary information.

Do not unnecessarily store:

* Medical diagnoses
* Sensitive personal information
* Unnecessary behavioral data

Access to student data must be authorization-controlled.

Teachers and caregivers may only access students they are authorized to access.

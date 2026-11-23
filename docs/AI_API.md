# AbleNova — AI & Content Ingestion API Reference

This document serves as the complete endpoint reference for AbleNova's AI Learning Engine and RAG content ingestion services, adhering to `docs/API_CONTRACT.md`.

Base path: `/api/v1`

---

## 1. POST `/ai/explanation` (API_CONTRACT.md Section 13)

Generates a curriculum-grounded explanation tailored to a student's age, grade, and accessibility needs.

- **Authentication**: Bearer Token required (`student`, `teacher`, `caregiver`, `admin`).
- **Endpoint**: `POST /api/v1/ai/explanation`

### Request Body
```json
{
  "lesson_id": "e5b328a9-6e3d-42ef-83e7-2936a2979d34",
  "question": "How do green plants turn sunlight into energy?",
  "mode": "simplified",
  "student_id": "c1f71c48-b4cf-4fa8-bb36-92cb6ea31b81"
}
```

#### Allowed Modes:
- `standard`: Conversational, grade-level appropriate explanation.
- `simplified`: Shorter sentences, basic vocabulary, cognitive-friendly formatting.
- `hint`: Scaffolded clue without revealing the final answer.
- `example`: Concrete real-world demonstration.
- `summary`: High-level bulleted summary.
- `analogy`: Everyday metaphor explaining the concept.
- `vocabulary`: Term definitions with child-friendly phonetic cues.
- `visual_description`: Screen-reader accessible layout description.
- `step_by_step`: Sequential 1-2-3 guide with milestones.

### Response (200 OK)
```json
{
  "request_id": "8d3e9114-f5a0-424a-9b76-47b7463f82cb",
  "response": "Plants use green leaves to catch sunlight. They mix it with water and air to make their sweet plant food!",
  "source_ids": [
    "chunk_a1b2c3d4",
    "chunk_e5f6g7h8"
  ],
  "mode": "simplified",
  "suggested_followups": [
    "Can you show me an example?",
    "What is the next step?"
  ]
}
```

---

## 2. POST `/ai/ask`

Broad curriculum Q&A across entire subjects or topics.

- **Authentication**: Bearer Token required.
- **Endpoint**: `POST /api/v1/ai/ask`

### Request Body
```json
{
  "question": "What is the difference between an ocean and a sea?",
  "subject_id": "99c85117-640a-4a69-875f-2ff70c567bb5",
  "mode": "standard"
}
```

### Response (200 OK)
```json
{
  "request_id": "51f28b24-9ea8-4cf5-992a-360e22ea1322",
  "response": "Seas are smaller bodies of salt water that are usually partly enclosed by land, while oceans are vast and open.",
  "source_ids": ["chunk_ocean_01"],
  "mode": "standard",
  "sources": [
    {
      "chunk_id": "chunk_ocean_01",
      "document_id": "doc_geo_101",
      "document_title": "World Geography Grade 5",
      "page_number": 14,
      "snippet": "Seas are partially enclosed by land and generally shallower than open oceans...",
      "relevance_score": 0.92
    }
  ]
}
```

---

## 3. POST `/ai/simplify`

Rewrites complex text for students requiring cognitive accessibility or lower reading grade levels.

- **Authentication**: Bearer Token required.
- **Endpoint**: `POST /api/v1/ai/simplify`

### Request Body
```json
{
  "text": "Cellular respiration is a series of chemical reactions that break down glucose to produce ATP.",
  "target_grade": 4,
  "style": "plain_language"
}
```

### Response (200 OK)
```json
{
  "simplified_text": "Our cells use food like sugar to make the energy our bodies need to run and play.",
  "target_grade": 4,
  "key_points": [
    "Cells turn food into usable energy.",
    "This gives our muscles power."
  ],
  "vocabulary_glossary": {
    "glucose": "a natural kind of sugar from food"
  }
}
```

---

## 4. POST `/ai/translate`

Translates educational material into a student's preferred language.

- **Authentication**: Bearer Token required.
- **Endpoint**: `POST /api/v1/ai/translate`

### Request Body
```json
{
  "text": "The solar system includes the Sun and eight planets.",
  "target_language": "es"
}
```

### Response (200 OK)
```json
{
  "translated_text": "El sistema solar incluye el Sol y ocho planetas.",
  "target_language": "es",
  "source_language": "en"
}
```

---

## 5. POST `/ai/summarize`

Summarizes lengthy texts into concise bullet points.

- **Authentication**: Bearer Token required.
- **Endpoint**: `POST /api/v1/ai/summarize`

### Request Body
```json
{
  "text": "Full lesson narrative regarding the water cycle and weather patterns...",
  "bullet_count": 3,
  "max_words": 100
}
```

### Response (200 OK)
```json
{
  "summary": "Water evaporates into air, forms clouds, and returns as precipitation.",
  "bullets": [
    "• Water turns into invisible vapor through evaporation.",
    "• Vapor cools and forms clouds in the sky.",
    "• Water droplets fall as rain or snow."
  ],
  "word_count": 24
}
```

---

## 6. POST `/ai/hints`

Provides scaffolded learning clues that guide students toward self-discovery without spoiling answers.

- **Authentication**: Bearer Token required.
- **Endpoint**: `POST /api/v1/ai/hints`

### Request Body
```json
{
  "question": "What is 12 multiplied by 4?",
  "lesson_id": "lesson_mult_01",
  "hint_level": 1
}
```

### Response (200 OK)
```json
{
  "hint": "Hint 1: Think of 12 as 10 plus 2. Can you multiply 10 by 4 first?",
  "hint_level": 1,
  "has_more_hints": true,
  "encouragement": "You're getting closer! Give it another try!"
}
```

---

## 7. POST `/ai/visual-description`

Transforms graphics, diagrams, and illustrations into screen-reader and tactile accessible verbal narratives.

- **Authentication**: Bearer Token required.
- **Endpoint**: `POST /api/v1/ai/visual-description`

### Request Body
```json
{
  "diagram_type": "diagram",
  "context_text": "Cross-section diagram of plant leaf showing stomata and chloroplasts."
}
```

### Response (200 OK)
```json
{
  "description": "A cross-section illustration of a green leaf. The top layer is a protective waxy skin. Inside the middle layer are oval cells packed with tiny green circles called chloroplasts.",
  "tactile_guidance": "Start at the smooth upper leaf surface, move inward to feel the oval cells, and trace down to the tiny pores at the bottom.",
  "key_elements": [
    "Waxy upper cuticle",
    "Middle palisade cells with chloroplasts",
    "Lower stomata breathing pores"
  ]
}
```

---

## 8. GET `/ai/sources/{request_id}`

Retrieves exact chunk-level citations, document titles, page numbers, and relevance scores for an AI answer.

- **Authentication**: Bearer Token required.
- **Endpoint**: `GET /api/v1/ai/sources/{request_id}`

### Response (200 OK)
```json
{
  "request_id": "8d3e9114-f5a0-424a-9b76-47b7463f82cb",
  "sources": [
    {
      "chunk_id": "chunk_a1b2c3d4",
      "document_id": "doc_science_5",
      "document_title": "Primary Science Grade 5",
      "page_number": 22,
      "snippet": "Photosynthesis is the chemical process through which plants use sunlight...",
      "relevance_score": 0.89
    }
  ],
  "retrieval_strategy": "chromadb_semantic_vector"
}
```

---

## 9. POST `/content/upload` (API_CONTRACT.md Section 14)

Allows authorized teachers and administrators to upload learning documents for ingestion, cleaning, sliding-window chunking, and ChromaDB vector indexing.

- **Authentication**: Bearer Token required (`teacher`, `admin`).
- **Content-Type**: `multipart/form-data`
- **Endpoint**: `POST /api/v1/content/upload`

### Form Fields:
- `file`: Binary file (`.txt`, `.md`, text). Max 10 MB.
- `subject_id`: UUID of the parent Subject.
- `topic_id`: UUID of the parent Topic.
- `grade`: Integer between 1 and 12.
- `language`: ISO language code (default `"en"`).
- `difficulty`: String (`"beginner"`, `"intermediate"`, `"advanced"`).

### Response (201 Created)
```json
{
  "document_id": "84a1e941-bd56-4299-8cf9-19ec0477b738",
  "file_name": "photosynthesis_guide.txt",
  "status": "processed",
  "chunks_count": 6,
  "message": "Successfully processed 6 chunks into educational vector index"
}
```

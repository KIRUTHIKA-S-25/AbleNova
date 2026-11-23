# AbleNova — RAG Pipeline & Vector Search

This document outlines the Retrieval-Augmented Generation (RAG) architecture, text processing lifecycle, vector indexing strategies, and deduplication mechanisms used across AbleNova.

---

## 1. Pipeline Overview

```
 [Teacher / Admin Upload]
           │
           ▼
 [Text Extraction & Decoding] ──► Handles UTF-8 / Latin-1 text & markdown
           │
           ▼
 [Sanitization & Normalization] ──► Removes control chars, zero-width spaces, excess whitespace
           │
           ▼
 [Sentence-Boundary Chunking] ──► Sliding-window (500 chars target, 100 chars overlap)
           │
           ├───────────────────────────────┐
           ▼                               ▼
 [PostgreSQL Storage]             [Vector Embedding Generation]
 - ContentDocument (metadata)      - all-MiniLM-L6-v2 (384-d dense vectors)
 - ContentChunk (relational IDs)   - Fast deterministic offline fallback
           │                               │
           ▼                               ▼
 [Relational Linking]             [ChromaDB Vector Storage]
 - Lessons & Topics                - Deduplicated by SHA-256 hash
                                   - Indexed with metadata filters
```

---

## 2. Text Extraction & Cleaning

Educational materials uploaded by teachers can contain formatting anomalies, control characters, non-breaking spaces, or non-standard encodings. The `ContentService.clean_text` pipeline applies the following transformations:

1. **Non-Printable Character Removal**:
   Strips ASCII control characters in ranges `[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]` while preserving standard line breaks and tabs.
2. **Unicode Normalization**:
   Replaces zero-width spaces (`\u200b`) and non-breaking spaces (`\u00a0`) with standard spaces to ensure consistent tokenization.
3. **Whitespace Collapse**:
   Collapses consecutive horizontal spaces into single spaces and caps consecutive line breaks to at most two.

---

## 3. Sentence-Boundary Sliding-Window Chunking

Splitting documents purely on character count often breaks words or cuts sentences in half, producing confusing fragments for young learners.

AbleNova implements **sentence-boundary-aware chunking**:
- Text is split into complete grammatical sentences using terminal punctuation detection (`. `, `! `, `? `, or paragraph breaks).
- Sentences are accumulated into chunks until reaching the target threshold (~500 characters).
- When a chunk boundary is reached, an overlap window (~100 characters) is formed by retaining the trailing sentences of the completed chunk as the prefix for the next chunk.
- Every chunk is stamped with its sequential `chunk_index` and an approximate `page_number` for citation.

---

## 4. Embedding Generation

Dense vector embeddings represent curriculum chunks in semantic vector space:
- **Primary Model**: `all-MiniLM-L6-v2` via `sentence-transformers` (384-dimensional unit-normalized dense vectors).
- **Offline / Deterministic Fallback**: When operating offline or executing automated test suites, `EmbeddingGenerator` generates deterministic 384-dimensional vectors based on MD5 and SHA-256 term hashing. This ensures:
  - Exact determinism (identical text yields identical vectors).
  - Semantic overlap detection between related terms.
  - Sub-millisecond execution times without downloading external weights.

---

## 5. ChromaDB Vector Storage & Deduplication

### 5.1 Storage Separation
AbleNova maintains a clean boundary between storage systems:
- **Object Storage**: Large original binaries live in Supabase Storage.
- **PostgreSQL**: Stores relational models (`ContentDocument`, `ContentChunk`) with foreign keys, timestamps, and status flags.
- **ChromaDB**: Houses vector embeddings, chunk texts, and searchable metadata (`subject_id`, `topic_id`, `grade`, `language`, `difficulty`).

### 5.2 Duplicate Prevention
Prior to indexing into ChromaDB, a SHA-256 hash of the normalized chunk text is computed. Chunks with identical content hashes within a document or batch are automatically skipped, preventing redundant results from diluting retrieval precision.

### 5.3 Metadata-Filtered Retrieval
Retrieval queries apply multi-factor boolean filtering:
```python
# Example: Retrieve Grade 5 Science chunks in Spanish
rag_service.query_similar_chunks(
    query="¿Cómo hacen las plantas el oxígeno?",
    subject_id="subj-uuid",
    grade=5,
    language="es",
    limit=4,
)
```
Similarity scores are computed from vector distances and normalized to a clean range between `0.0` and `1.0`.

### 5.4 Document Deletion
When a teacher removes or updates curriculum material, `rag_service.delete_document_chunks(document_id)` cleans up all associated vectors in ChromaDB, preventing stale curriculum references.

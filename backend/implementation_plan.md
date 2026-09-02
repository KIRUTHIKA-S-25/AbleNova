# Implementation Plan for Completing AbleNova Integration

## Goal Description
Complete the pending backend integration for AbleNova according to the API contract and priorities:
- Integrate mastery and recommendation services with quiz attempt completion and the new `/quizzes/{quiz_id}/submit` endpoint.
- Add missing student‑profile, progress, recommendation, and learning‑path routes (aliases to existing logic).
- Wire the `/api/v1/sync` endpoint to the idempotent sync service.
- Add automated tests covering the new functionality.
- Run validation commands to ensure compilation, migrations, and OpenAPI generation succeed.

## User Review Required
[!IMPORTANT]
- The plan assumes the existing database schema **does not** contain explicit relationships linking caregivers or teachers to students. If such relationships are missing, the corresponding endpoints will return a 403 with an explanatory message rather than exposing unauthorized data.
- The new `/quizzes/{quiz_id}/submit` endpoint will coexist with the existing multi‑step flow and will return the same `QuizAttemptResponse` model defined in `app/schemas/quiz.py`.
- Recommendation generation will be triggered **after** mastery recalculation only for the authenticated student.

## Open Questions
- Do you want the `/quizzes/{quiz_id}/submit` endpoint to also return a list of newly generated recommendations in the response body? (Current contract does not specify this, so we will keep the response identical to `QuizAttemptResponse`.)
- Should the student‑profile `PUT` endpoint allow partial updates (patch‑style) or require the full profile schema? The contract uses a full `PUT`; we will implement full replacement.

## Proposed Changes
### 1. Mastery & Recommendation Integration
- **File:** `app/api/v1/quizzes.py`
  - Extend `complete_quiz_attempt` to call `mastery_service.recalculate_mastery_for_quiz` after scoring and commit.
  - After mastery recalculation, call `recommendation_service.generate_recommendations_for_student`.
  - Add new POST `/quizzes/{quiz_id}/submit` endpoint that:
    * Validates quiz existence.
    * Accepts a payload matching `QuizSubmitRequest` schema (to be added).
    * Creates a `QuizAttempt` and related `QuestionAttempt` rows.
    * Calculates official score & accuracy.
    * Persists the attempt.
    * Triggers mastery recalculation and recommendation generation.
    * Returns the `QuizAttemptResponse`.
- **File:** `app/schemas/quiz.py`
  - Add `QuizSubmitQuestion` and `QuizSubmitRequest` Pydantic models matching the contract.

### 2. Student Contract Endpoints
- **File:** `app/api/v1/students.py` (exists). Add the following routes if missing:
  - `GET /student/profile` → reuse existing `GET /students/me` (alias).
  - `PUT /student/profile` → reuse existing `PUT /students/me` (alias).
  - `GET /student/progress` → alias to `/progress/me`.
  - `GET /student/recommendations` → alias to `/recommendations/me`.
  - `GET /student/learning-path` → alias to `/learning_path/me`.
- Ensure each endpoint extracts `current_user` via `require_role('student')` and uses `get_current_student` helper.

### 3. Caregiver & Teacher Endpoints
- **File:** `app/api/v1/caregivers.py`
  - Add `GET /caregiver/student/{student_id}`.
  - Verify caregiver authentication (`require_role('caregiver')`).
  - Check if a relationship exists: currently `Caregiver` model has no explicit link to students. If absent, return `HTTP_403_FORBIDDEN` with detail "Caregiver access to student data not supported".
- **File:** `app/api/v1/teachers.py`
  - Add `GET /teacher/students/{student_id}` with similar logic (return 403 if no relationship).
  - Add `GET /teacher/analytics` that aggregates data (student count, average mastery, quiz performance) using existing models. No teacher‑student link required for aggregate.

### 4. Sync Idempotency Integration
- **File:** `app/api/v1/sync.py`
  - Replace placeholder logic with a call to `sync_service.process_sync_events`.
  - Extract `student_id` from `current_user` (require role 'student').
  - Pass the list of events from request body (`SyncRequest` schema).
  - Return `{"synced": [...], "failed": [...]}` matching contract.
- **File:** `app/schemas/sync.py`
  - Ensure request schema aligns with contract (`events` list containing `local_id`, `type`, `payload`, etc.).

### 5. Tests
Create new test modules under `tests/`:
- `test_quiz_flow.py` – covers start, answer, complete, submit, mastery update, recommendation generation, and unauthorized access.
- `test_student_routes.py` – validates alias endpoints return correct data for an authenticated student.
- `test_sync_idempotency.py` – posts the same `local_id` twice and asserts no duplicate rows are created.
- `test_authorization_caregiver_teacher.py` – asserts 403 for caregiver/student and teacher/student endpoints when relationships are missing.
- Update existing test suite to import new schemas if needed.

### 6. Validation
- Run `python -m compileall app`.
- Run `alembic current` and `alembic check` to ensure no pending migrations.
- Execute `pytest -q` and ensure all tests pass.
- Start FastAPI (`uvicorn app.main:app --reload`) and verify new paths appear in `/openapi.json`.

## Verification Plan
1. **Unit Tests:** All new tests must pass (`exit code 0`).
2. **Compilation:** `python -m compileall app` returns no errors.
3. **Alembic:** `alembic current` shows the latest revision (`11dfcd599f5b`). `alembic check` reports no pending migrations.
4. **OpenAPI:** The generated OpenAPI schema includes the newly added routes (`/quizzes/{quiz_id}/submit`, student aliases, caregiver/teacher endpoints, `/sync`).
5. **Manual Spot‑Check:** Verify that a quiz submit request calculates score correctly and that a subsequent call does not duplicate recommendations.

---
Please confirm you would like us to proceed with these modifications.

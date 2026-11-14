# AbleNova — Quiz Engine & Assessment API Reference

This document provides the complete API specification, grading mechanics, mastery integration formulas, and security safeguards for AbleNova's Quiz and Assessment Engine, adhering strictly to `docs/API_CONTRACT.md` Sections 7, 8, 9, and 20.

Base path: `/api/v1`

---

## 1. Architecture & Design Principles

The AbleNova Quiz Engine delivers accessible, transparent, and encouraging assessments designed specifically for children with diverse learning needs.

### Core Principles:
1. **Client-Side Answer Privacy**: Correct answers (`correct_answer`) and instructional explanations (`explanation`) are strictly withheld from student client responses prior to submission.
2. **Authoritative Backend Grading**: The frontend never computes, validates, or transmits final assessment scores. All objective evaluation occurs securely on the backend.
3. **Idempotent Submissions**: Replayed network requests or duplicate submissions bearing a `client_submission_id` return the existing evaluated attempt without inflating attempts, scores, or topic mastery.
4. **Adaptive Scaffolding & Feedback**: Passing results provide positive reinforcement; failing results trigger supportive feedback and automatically provision a curriculum review `Recommendation`.
5. **Continuous Mastery Tracking**: Each completed assessment synchronizes `StudentTopicMastery` using the documented 60/30/10 weighted formula.

---

## 2. API Endpoints

### 2.1 GET `/quizzes/{quiz_id}` (API_CONTRACT.md Section 7)
Retrieves a quiz for taking or administration.

- **Authentication**: Bearer Token required (`student`, `teacher`, `caregiver`, `admin`).
- **Access Rule**: Students may only retrieve published quizzes (`is_published == True`). Unpublished quizzes return `403 FORBIDDEN`.

#### Student Response (200 OK — Strict Privacy Mode):
```json
{
  "id": "e5b328a9-6e3d-42ef-83e7-2936a2979d34",
  "lesson_id": "8c12c538-7ad5-4e5f-6a7b-8c9d0e1f2a3b",
  "title": "Fractions Basics Quiz",
  "description": "Assess basic fractional understanding",
  "passing_threshold": 0.70,
  "questions": [
    {
      "id": "99c85117-640a-4a69-875f-2ff70c567bb5",
      "type": "multiple_choice",
      "question": "What is 1/2 of 10?",
      "options": ["3", "5", "7", "8"],
      "difficulty": "beginner",
      "marks": 1
    }
  ]
}
```
> [!IMPORTANT]
> In accordance with `API_CONTRACT.md` Section 7, the student response MUST NOT contain `correct_answer` or `explanation`.

#### Teacher / Admin Response (200 OK — Administrative Mode):
Includes `is_published`, `max_attempts`, and questions with `correct_answer`, `explanation`, and `topic_id`.

---

### 2.2 POST `/quizzes/{quiz_id}/submit` (API_CONTRACT.md Section 8 & 9)
Submits a student's completed quiz attempt for official backend evaluation.

- **Authentication**: Bearer Token required (`student`).
- **Endpoint**: `POST /api/v1/quizzes/{quiz_id}/submit`

#### Request Body:
```json
{
  "client_submission_id": "sub_client_001",
  "answers": [
    {
      "question_id": "99c85117-640a-4a69-875f-2ff70c567bb5",
      "answer": "5",
      "time_taken_seconds": 12
    }
  ]
}
```

#### Response (200 OK — API_CONTRACT.md Section 9):
```json
{
  "attempt_id": "3f4a9b1c-8e2d-45a7-9c1e-7b6a5d4e3f2a",
  "score": 1,
  "total": 1,
  "accuracy": 1.0,
  "is_passed": true,
  "time_taken_seconds": 12,
  "topic_results": [
    {
      "topic_id": "cae0e3ab-b35b-404f-8182-83af6d6b3e9a",
      "accuracy": 1.0
    }
  ],
  "feedback": "Outstanding work! You demonstrated complete mastery of this material.",
  "recommendation_id": null,
  "question_results": [
    {
      "question_id": "99c85117-640a-4a69-875f-2ff70c567bb5",
      "question_text": "What is 1/2 of 10?",
      "student_answer": "5",
      "correct_answer": "5",
      "is_correct": true,
      "marks_obtained": 1.0,
      "marks_possible": 1,
      "explanation": "Half of 10 is 10 divided by 2, which equals 5."
    }
  ]
}
```

---

### 2.3 Quiz Management Endpoints (Teacher / Admin)

| Method | Path | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/quizzes` | Create a new quiz assessment | Teacher, Admin |
| `PUT` | `/api/v1/quizzes/{quiz_id}` | Update quiz parameters | Teacher, Admin |
| `POST` | `/api/v1/quizzes/{quiz_id}/publish` | Publish quiz (requires >= 1 question) | Teacher, Admin |
| `POST` | `/api/v1/quizzes/{quiz_id}/unpublish` | Unpublish quiz | Teacher, Admin |
| `DELETE` | `/api/v1/quizzes/{quiz_id}` | Delete quiz and associated attempts | Teacher, Admin |
| `GET` | `/api/v1/quizzes` | List quizzes filtered by `lesson_id` or `topic_id` | All authenticated |
| `POST` | `/api/v1/quizzes/{quiz_id}/questions` | Add question item to quiz | Teacher, Admin |
| `PUT` | `/api/v1/quizzes/{quiz_id}/questions/{q_id}` | Update question text, answer, explanation | Teacher, Admin |
| `DELETE` | `/api/v1/quizzes/{quiz_id}/questions/{q_id}` | Remove question item from quiz | Teacher, Admin |

#### Quiz Creation Payload (`POST /api/v1/quizzes`):
```json
{
  "lesson_id": "8c12c538-7ad5-4e5f-6a7b-8c9d0e1f2a3b",
  "topic_id": "cae0e3ab-b35b-404f-8182-83af6d6b3e9a",
  "title": "Geometry Angles Quiz",
  "description": "Assess acute, right, and obtuse angles",
  "passing_threshold": 0.70,
  "max_attempts": 3,
  "is_published": false,
  "questions": [
    {
      "topic_id": "cae0e3ab-b35b-404f-8182-83af6d6b3e9a",
      "question_text": "A right angle is exactly 90 degrees.",
      "question_type": "true_false",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "By definition, right angles measure exactly 90 degrees.",
      "difficulty": "beginner",
      "marks": 1
    }
  ]
}
```

---

### 2.4 Attempt History & Review Endpoints

#### `GET /api/v1/quizzes/{quiz_id}/attempts`
Returns the list of past attempts for a quiz.
- Students view their own history.
- Teachers and caregivers supply `?student_id={student_uuid}` to inspect an authorized student's attempt records.

#### `GET /api/v1/quizzes/attempts/{attempt_id}`
Returns full attempt review with unlocked question explanations.
- Protected by `verify_student_access`: unauthorized students cannot access peer attempts.

---

## 3. Objective Grading Mechanics

The backend supports multiple objective question modalities:

1. **Multiple Choice (`multiple_choice`)**:
   Matches normalized string answers (case-insensitive, trimmed whitespace).
2. **True / False (`true_false`)**:
   Normalizes boolean variations (`"true"`, `"True"`, `"T"`, `"1"`, `"yes"` vs `"false"`, `"False"`, `"F"`, `"0"`, `"no"`).
3. **Multiple Select (`multiple_select`)**:
   Evaluates set equality for comma-separated or list-based selections (e.g. `"2,3"` matches `["3", "2"]`).

### Scoring Metrics:
$$\text{Accuracy} = \frac{\text{Score}}{\text{Total Questions}}$$
$$\text{Passed} = \text{Accuracy} \ge \text{Passing Threshold}$$

---

## 4. Mastery & Progress Integration

Upon submission, the engine updates `StudentTopicMastery` using `MasteryService.calculate_topic_mastery`:
$$\text{Mastery} = 0.60 \times \text{Recent Average} + 0.30 \times \text{Historical Accuracy} + 0.10 \times \min\left(1.0, \frac{\text{Attempt Count}}{5}\right)$$
$$\text{Confidence} = \min(1.0, 0.30 + 0.15 \times \text{Attempt Count})$$

---

## 5. Security & IDOR Safeguards

1. **Role Enforcement**: Only users with role `student` may submit quiz attempts.
2. **Teacher Authorization**: Teachers can only view attempts of students explicitly linked via `TeacherStudent`.
3. **Caregiver Authorization**: Caregivers can only view attempts of students linked via `CaregiverStudent`.
4. **IDOR Defense**: All student lookup paths validate record ownership. Attempting to access another student's attempt raises `403 FORBIDDEN`.
5. **Publication Guard**: Students cannot view or submit unpublished quizzes.
6. **Error Standards**: All errors follow `API_CONTRACT.md` Section 20:
   ```json
   {
     "error": {
       "code": "FORBIDDEN",
       "message": "This quiz is not currently published"
     }
   }
   ```

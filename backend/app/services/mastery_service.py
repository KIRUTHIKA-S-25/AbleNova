"""
Mastery Calculation Service — AbleNova
======================================

Verified database fields available for mastery calculation:
  QuizAttempt: student_id, quiz_id, score, total_questions, accuracy, time_taken_seconds, created_at
  QuestionAttempt: attempt_id, question_id, student_answer, is_correct, time_taken_seconds
  Question: quiz_id, topic_id, question_text, question_type, options, correct_answer, explanation, difficulty
  Quiz: id, lesson_id, title, description
  Lesson: id, topic_id, title, difficulty, language, estimated_minutes, ...
  StudentTopicMastery: student_id, topic_id, mastery_score, confidence, updated_at

MASTERY FORMULA
---------------
We have the following verified data per topic:

  - For each quiz attempt linked to this topic via: QuizAttempt → Quiz → Lesson → Topic
    OR via QuestionAttempt → Question → topic_id (direct, more granular)

  We use QuestionAttempt → Question.topic_id for per-topic accuracy because:
    - Questions have a direct `topic_id` foreign key
    - This allows granular per-topic performance even within mixed-topic quizzes

  Per-topic mastery score (range 0.0–1.0):
    mastery_score = weighted_average_accuracy

  Weights by recency (linear decay):
    Most recent attempt → weight = N (highest)
    Oldest attempt    → weight = 1 (lowest)
    where N = total number of attempts

  This naturally gives more weight to recent performance while
  still incorporating historical consistency.

  confidence (range 0.0–1.0):
    confidence = min(1.0, attempt_count / CONFIDENCE_MAX_ATTEMPTS)
    where CONFIDENCE_MAX_ATTEMPTS = 5

    Rationale: with 1 attempt the system has low confidence in the
    mastery estimate. Confidence saturates at 1.0 after 5 attempts.

  NOTE: question.difficulty (string: "beginner"/"intermediate"/"advanced")
  DOES exist in the schema. We map it to a numeric weight:
    beginner     → 0.8
    intermediate → 1.0
    advanced     → 1.2

  Per-question contribution:
    weighted_correct += difficulty_weight * is_correct
    weighted_total   += difficulty_weight

  Final per-topic mastery for a single attempt:
    attempt_accuracy = weighted_correct / weighted_total
    (if weighted_total == 0: attempt_accuracy = 0.0)

  Final mastery across multiple attempts (recency-weighted):
    mastery_score = sum(recency_weight[i] * attempt_accuracy[i]) / sum(recency_weight[i])

  Edge cases:
    - No attempts for topic → mastery_score = 0.0, confidence = 0.0
    - Single attempt → mastery_score = that attempt's accuracy, confidence = 0.2
    - Division by zero is guarded at every step

  This formula is deterministic, reproducible, database-driven, and
  avoids any external APIs or randomness.
"""

from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy.orm import Session

from app.db.models.mastery import StudentTopicMastery
from app.db.models.quiz_attempt import QuizAttempt
from app.db.models.question_attempt import QuestionAttempt
from app.db.models.question import Question
from app.db.models.quiz import Quiz
from app.db.models.lesson import Lesson


# ----------------------------------------------------------------
# Constants
# ----------------------------------------------------------------

# Confidence saturates at 1.0 after this many attempts per topic
CONFIDENCE_MAX_ATTEMPTS: int = 5

# Difficulty weights for question contribution
DIFFICULTY_WEIGHTS: dict[str, float] = {
    "beginner": 0.8,
    "intermediate": 1.0,
    "advanced": 1.2,
}
DEFAULT_DIFFICULTY_WEIGHT: float = 1.0


# ----------------------------------------------------------------
# Internal helpers
# ----------------------------------------------------------------

def _difficulty_weight(difficulty: str) -> float:
    """Return numeric weight for a question difficulty string."""
    return DIFFICULTY_WEIGHTS.get((difficulty or "").lower(), DEFAULT_DIFFICULTY_WEIGHT)


def _compute_attempt_accuracy(question_attempts: list[QuestionAttempt]) -> float:
    """
    Compute weighted accuracy for a single quiz attempt.

    Each question contributes its difficulty weight.
    Correct answers contribute the full weight; incorrect answers contribute 0.

    Returns a float in [0.0, 1.0]. Returns 0.0 if no questions were attempted.
    """
    weighted_correct: float = 0.0
    weighted_total: float = 0.0

    for qa in question_attempts:
        question: Optional[Question] = qa.question  # loaded via relationship
        if question is None:
            continue
        w = _difficulty_weight(question.difficulty)
        weighted_total += w
        if qa.is_correct:
            weighted_correct += w

    if weighted_total == 0.0:
        return 0.0
    return weighted_correct / weighted_total


# ----------------------------------------------------------------
# Public API
# ----------------------------------------------------------------

def calculate_topic_mastery(
    student_id: uuid.UUID,
    topic_id: uuid.UUID,
    db: Session,
) -> tuple[float, float]:
    """
    Calculate mastery_score and confidence for a (student, topic) pair.

    Returns (mastery_score, confidence), both in [0.0, 1.0].

    Algorithm:
    1. Find all QuizAttempts for this student where the quiz is linked to
       a lesson that belongs to the target topic (via Quiz.lesson → Lesson.topic_id).
    2. For each attempt, calculate difficulty-weighted accuracy from QuestionAttempts
       filtered to questions belonging to this topic.
    3. Weight each attempt's accuracy by recency (most recent = highest weight).
    4. Compute confidence based on total attempt count (capped at CONFIDENCE_MAX_ATTEMPTS).
    """

    # Step 1: Find all quiz IDs whose lesson's topic matches target topic
    topic_lesson_ids = (
        db.query(Lesson.id)
        .filter(Lesson.topic_id == topic_id)
        .all()
    )
    topic_lesson_ids = [row[0] for row in topic_lesson_ids]

    if not topic_lesson_ids:
        return 0.0, 0.0

    topic_quiz_ids = (
        db.query(Quiz.id)
        .filter(Quiz.lesson_id.in_(topic_lesson_ids))
        .all()
    )
    topic_quiz_ids = [row[0] for row in topic_quiz_ids]

    if not topic_quiz_ids:
        return 0.0, 0.0

    # Step 2: Get all quiz attempts for this student on topic quizzes,
    # ordered by creation time ascending (oldest first → recency weighting)
    attempts = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.student_id == student_id,
            QuizAttempt.quiz_id.in_(topic_quiz_ids),
        )
        .order_by(QuizAttempt.created_at.asc())
        .all()
    )

    # Also consider granular per-topic questions across any quiz attempt.
    # We use the question's direct topic_id to filter relevant question attempts.
    # We gather all question attempts for this student across all their quiz attempts,
    # restricted to questions belonging to this topic, then group by quiz attempt.

    # Get all quiz attempt IDs for this student (not just topic-filtered ones)
    # so we can find cross-topic questions
    all_attempt_ids = (
        db.query(QuizAttempt.id)
        .filter(QuizAttempt.student_id == student_id)
        .all()
    )
    all_attempt_ids = [row[0] for row in all_attempt_ids]

    if not all_attempt_ids:
        return 0.0, 0.0

    # Fetch question attempts for this topic's questions across all student attempts
    topic_question_attempts = (
        db.query(QuestionAttempt)
        .join(Question, QuestionAttempt.question_id == Question.id)
        .filter(
            QuestionAttempt.attempt_id.in_(all_attempt_ids),
            Question.topic_id == topic_id,
        )
        .all()
    )

    if not topic_question_attempts:
        return 0.0, 0.0

    # Group topic question attempts by attempt_id to process per quiz-attempt
    from collections import defaultdict
    attempt_qa_map: dict = defaultdict(list)
    for qa in topic_question_attempts:
        attempt_qa_map[qa.attempt_id].append(qa)

    # Get the quiz attempts that have topic questions, sorted by created_at ascending
    relevant_attempt_ids = list(attempt_qa_map.keys())
    relevant_attempts = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.id.in_(relevant_attempt_ids),
            QuizAttempt.student_id == student_id,
        )
        .order_by(QuizAttempt.created_at.asc())
        .all()
    )

    if not relevant_attempts:
        return 0.0, 0.0

    total_attempts = len(relevant_attempts)

    # Step 3: Compute recency-weighted average accuracy
    # Weight = position index (1-based), so oldest = 1, newest = total_attempts
    total_weight: float = 0.0
    weighted_accuracy_sum: float = 0.0

    for i, attempt in enumerate(relevant_attempts):
        recency_weight = float(i + 1)  # 1 for oldest, N for newest
        qas = attempt_qa_map.get(attempt.id, [])
        acc = _compute_attempt_accuracy(qas)
        weighted_accuracy_sum += recency_weight * acc
        total_weight += recency_weight

    if total_weight == 0.0:
        return 0.0, 0.0

    mastery_score = weighted_accuracy_sum / total_weight
    mastery_score = round(min(1.0, max(0.0, mastery_score)), 4)

    # Step 4: Confidence based on attempt count
    confidence = min(1.0, total_attempts / CONFIDENCE_MAX_ATTEMPTS)
    confidence = round(confidence, 4)

    return mastery_score, confidence


def update_topic_mastery_after_quiz(
    student_id: uuid.UUID,
    topic_id: uuid.UUID,
    db: Session,
) -> StudentTopicMastery:
    """
    Recalculate mastery for a (student, topic) pair and persist it.

    Creates a new StudentTopicMastery record if one does not exist.
    Updates the existing record if one does exist.

    Returns the persisted StudentTopicMastery instance.
    """
    mastery_score, confidence = calculate_topic_mastery(student_id, topic_id, db)

    mastery_record = (
        db.query(StudentTopicMastery)
        .filter(
            StudentTopicMastery.student_id == student_id,
            StudentTopicMastery.topic_id == topic_id,
        )
        .first()
    )

    now = datetime.now(timezone.utc)

    if mastery_record:
        mastery_record.mastery_score = mastery_score
        mastery_record.confidence = confidence
        mastery_record.updated_at = now
    else:
        mastery_record = StudentTopicMastery(
            student_id=student_id,
            topic_id=topic_id,
            mastery_score=mastery_score,
            confidence=confidence,
            updated_at=now,
        )
        db.add(mastery_record)

    db.flush()  # Flush to DB but let the caller commit
    return mastery_record


def get_topic_ids_for_quiz(quiz_id: uuid.UUID, db: Session) -> list[uuid.UUID]:
    """
    Return all unique topic_ids covered by the questions in a quiz.

    Used to trigger mastery recalculation for all affected topics
    when a quiz is completed.
    """
    topic_ids = (
        db.query(Question.topic_id)
        .filter(Question.quiz_id == quiz_id)
        .distinct()
        .all()
    )
    return [row[0] for row in topic_ids]


def recalculate_mastery_for_quiz(
    student_id: uuid.UUID,
    quiz_id: uuid.UUID,
    db: Session,
) -> list[StudentTopicMastery]:
    """
    After completing a quiz, recalculate mastery for all topics
    covered by that quiz's questions.

    Returns list of updated/created StudentTopicMastery records.
    """
    topic_ids = get_topic_ids_for_quiz(quiz_id, db)
    updated_records: list[StudentTopicMastery] = []

    for topic_id in topic_ids:
        record = update_topic_mastery_after_quiz(student_id, topic_id, db)
        updated_records.append(record)

    return updated_records

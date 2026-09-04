"""
Recommendation Service — AbleNova
===================================

Verified database fields available:
  Recommendation: student_id, lesson_id, reason, difficulty, estimated_minutes, created_at, status
  StudentTopicMastery: student_id, topic_id, mastery_score, confidence, updated_at
  Lesson: id, topic_id, title, difficulty, language, estimated_minutes, ...
  Topic: id, subject_id, name, description

This service generates rule-based recommendations by analysing
a student's current mastery records.

RECOMMENDATION LOGIC
---------------------
1. Identify topics where the student has low mastery (< LOW_MASTERY_THRESHOLD)
   or no mastery record at all.
2. For topics needing practice, find lessons in that topic.
3. Match lesson difficulty to mastery level:
   - mastery < 0.4  → prefer "beginner" lessons
   - mastery 0.4–0.7 → prefer "intermediate" lessons
   - mastery >= 0.7 → prefer "advanced" lessons
   - no mastery record → prefer "beginner" lessons
4. Skip lessons already recommended as "pending" or "active".
5. Create a Recommendation record for each selected lesson.

This is deterministic, database-driven, and requires no external APIs.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.db.models.lesson import Lesson
from app.db.models.mastery import StudentTopicMastery
from app.db.models.recommendation import Recommendation
from app.db.models.topic import Topic

# ----------------------------------------------------------------
# Constants
# ----------------------------------------------------------------

# Topics below this mastery threshold are considered for recommendation
LOW_MASTERY_THRESHOLD: float = 0.7

# Maximum new recommendations to generate per call
MAX_RECOMMENDATIONS: int = 5


# ----------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------

def _preferred_difficulty(mastery_score: float) -> str:
    """
    Map a mastery score to a preferred lesson difficulty string.

    mastery < 0.4  → beginner
    mastery 0.4–0.7 → intermediate
    mastery >= 0.7 → advanced
    """
    if mastery_score < 0.4:
        return "beginner"
    elif mastery_score < 0.7:
        return "intermediate"
    else:
        return "advanced"


def _reason_for_mastery(mastery_score: float, topic_name: str) -> str:
    """
    Generate a human-readable recommendation reason based on mastery score.
    """
    if mastery_score < 0.4:
        return (
            f"Your mastery of '{topic_name}' is still developing. "
            f"This beginner lesson will help build a solid foundation."
        )
    elif mastery_score < 0.7:
        return (
            f"You are making good progress on '{topic_name}'. "
            f"This lesson will help you deepen your understanding."
        )
    else:
        return (
            f"You have strong mastery of '{topic_name}'. "
            f"This advanced lesson will challenge and extend your skills."
        )


# ----------------------------------------------------------------
# Public API
# ----------------------------------------------------------------

def generate_recommendations_for_student(
    student_id: uuid.UUID,
    db: Session,
    max_recommendations: int = MAX_RECOMMENDATIONS,
) -> list[Recommendation]:
    """
    Analyse a student's topic mastery and generate recommendations.

    - Identifies weak topics (mastery below threshold).
    - Selects appropriate lessons based on mastery-to-difficulty mapping.
    - Skips topics/lessons already in "pending" or "active" status.
    - Creates Recommendation records and flushes them to the DB session.
    - The caller is responsible for committing the transaction.

    Returns a list of newly created Recommendation objects.
    """
    # Get all mastery records for this student
    mastery_records = (
        db.query(StudentTopicMastery)
        .filter(StudentTopicMastery.student_id == student_id)
        .all()
    )

    # Build a fast lookup: topic_id → mastery_score
    mastery_by_topic: dict[uuid.UUID, float] = {
        record.topic_id: record.mastery_score
        for record in mastery_records
    }

    # Get all topics needing recommendations (below threshold or unvisited)
    # We fetch all topics to find those without mastery records too
    all_topics = db.query(Topic).all()

    # Get lessons already recommended (pending/active) to avoid duplicates
    already_recommended_lesson_ids = set(
        row[0]
        for row in db.query(Recommendation.lesson_id)
        .filter(
            Recommendation.student_id == student_id,
            Recommendation.status.in_(["pending", "active"]),
        )
        .all()
    )

    created_recommendations: list[Recommendation] = []
    now = datetime.now(UTC)

    for topic in all_topics:
        if len(created_recommendations) >= max_recommendations:
            break

        mastery_score = mastery_by_topic.get(topic.id, 0.0)

        # Only recommend if mastery is below threshold
        if mastery_score >= LOW_MASTERY_THRESHOLD and topic.id in mastery_by_topic:
            continue

        preferred_diff = _preferred_difficulty(mastery_score)
        reason = _reason_for_mastery(mastery_score, topic.name)

        # Find a suitable lesson in this topic
        lesson = (
            db.query(Lesson)
            .filter(
                Lesson.topic_id == topic.id,
                Lesson.difficulty == preferred_diff,
                Lesson.id.notin_(already_recommended_lesson_ids),
            )
            .first()
        )

        # Fallback: if no lesson matches preferred difficulty, pick any available
        if not lesson:
            lesson = (
                db.query(Lesson)
                .filter(
                    Lesson.topic_id == topic.id,
                    Lesson.id.notin_(already_recommended_lesson_ids),
                )
                .first()
            )

        if not lesson:
            continue

        rec = Recommendation(
            student_id=student_id,
            lesson_id=lesson.id,
            reason=reason,
            difficulty=lesson.difficulty,
            estimated_minutes=lesson.estimated_minutes,
            status="pending",
            created_at=now,
        )
        db.add(rec)
        already_recommended_lesson_ids.add(lesson.id)
        created_recommendations.append(rec)

    if created_recommendations:
        db.flush()

    return created_recommendations

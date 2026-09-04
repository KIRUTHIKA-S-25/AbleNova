from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.db.models.learning_path import LearningPathItem
from app.db.models.learning_session import LearningSession
from app.db.models.lesson import Lesson
from app.db.models.mastery import StudentTopicMastery
from app.db.models.quiz_attempt import QuizAttempt
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.ai import AIExplanationRequest, AIExplanationResponse
from app.services.ai_service import generate_ai_explanation

router = APIRouter(
    prefix="/ai",
    tags=["AI Insights"],
)


# ============================================================
# EXPLANATION ENDPOINT (POST /ai/explanation)
# ============================================================
@router.post(
    "/explanation",
    response_model=AIExplanationResponse,
    summary="Get accessible AI-powered explanation matching API Contract Section 13",
)
def get_ai_explanation(
    request: AIExplanationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = generate_ai_explanation(
        question=request.question,
        lesson_id=request.lesson_id,
        mode=request.mode,
        db=db,
    )
    return AIExplanationResponse(
        response=result["response"],
        source_ids=result["source_ids"],
        mode=result["mode"],
    )



# ============================================================
# HELPERS
# ============================================================

def get_authenticated_student(
    current_user: User,
    db: Session,
) -> Student:
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )

    return student


# ============================================================
# REQUEST SCHEMAS (inline to keep file self-contained)
# ============================================================

class PerformanceAnalysisRequest(BaseModel):
    pass  # Uses authenticated student identity — no body needed


class RecommendationGenerateRequest(BaseModel):
    limit: int = 5


class LearningPathSuggestRequest(BaseModel):
    limit: int = 10


# ============================================================
# ANALYZE PERFORMANCE
# Deterministic backend logic — no external AI calls.
# Integration point: replace _compute_performance_summary()
# with an actual ML service call when available.
# ============================================================

@router.post(
    "/analyze-performance",
    summary="Analyze student learning performance (deterministic)",
)
def analyze_performance(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    mastery_records = (
        db.query(StudentTopicMastery)
        .filter(StudentTopicMastery.student_id == student.id)
        .all()
    )

    quiz_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .all()
    )

    sessions = (
        db.query(LearningSession)
        .filter(LearningSession.student_id == student.id)
        .all()
    )

    completed_sessions = [s for s in sessions if s.completed_at is not None]

    avg_mastery = (
        round(
            sum(r.mastery_score for r in mastery_records) / len(mastery_records),
            4,
        )
        if mastery_records
        else 0.0
    )

    avg_quiz_accuracy = (
        round(
            sum(a.accuracy for a in quiz_attempts) / len(quiz_attempts),
            2,
        )
        if quiz_attempts
        else 0.0
    )

    total_study_seconds = sum(s.duration_seconds or 0 for s in completed_sessions)

    weak_topics = [
        {
            "topic_id": r.topic_id,
            "mastery_score": r.mastery_score,
            "confidence": r.confidence,
        }
        for r in mastery_records
        if r.mastery_score < 0.6
    ]

    strong_topics = [
        {
            "topic_id": r.topic_id,
            "mastery_score": r.mastery_score,
            "confidence": r.confidence,
        }
        for r in mastery_records
        if r.mastery_score >= 0.8
    ]

    # Service-layer integration point:
    # Replace the block below with a real ML model prediction
    # when an AI backend is integrated.
    performance_level = "beginner"
    if avg_mastery >= 0.8 and avg_quiz_accuracy >= 80.0:
        performance_level = "advanced"
    elif avg_mastery >= 0.6 or avg_quiz_accuracy >= 60.0:
        performance_level = "intermediate"

    return {
        "student_id": student.id,
        "average_mastery_score": avg_mastery,
        "average_quiz_accuracy_percent": avg_quiz_accuracy,
        "total_quiz_attempts": len(quiz_attempts),
        "total_learning_sessions": len(sessions),
        "completed_learning_sessions": len(completed_sessions),
        "total_study_time_seconds": total_study_seconds,
        "topics_tracked": len(mastery_records),
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "performance_level": performance_level,
        "note": (
            "Performance analysis is currently computed using deterministic "
            "backend logic. AI model integration is available as a service "
            "layer when ready."
        ),
    }


# ============================================================
# GENERATE RECOMMENDATION REQUEST
# Deterministic: suggests lessons from weak topics.
# Integration point: swap _select_lessons_for_recommendation()
# with an AI ranking model when available.
# ============================================================

@router.post(
    "/recommendations/generate",
    summary="Generate recommendations based on mastery (deterministic)",
)
def generate_recommendations(
    request: RecommendationGenerateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    weak_mastery = (
        db.query(StudentTopicMastery)
        .filter(
            StudentTopicMastery.student_id == student.id,
            StudentTopicMastery.mastery_score < 0.7,
        )
        .order_by(StudentTopicMastery.mastery_score.asc())
        .limit(request.limit)
        .all()
    )

    # Collect weak topic IDs
    weak_topic_ids = [m.topic_id for m in weak_mastery]

    # For each weak topic, find available lessons
    # Integration point: AI ranking model could sort lessons by
    # predicted effectiveness for this specific student.
    suggested = []
    for topic_id in weak_topic_ids:
        lessons = (
            db.query(Lesson)
            .filter(Lesson.topic_id == topic_id)
            .limit(2)
            .all()
        )
        for lesson in lessons:
            suggested.append({
                "lesson_id": lesson.id,
                "lesson_title": lesson.title,
                "topic_id": topic_id,
                "difficulty": lesson.difficulty,
                "estimated_minutes": lesson.estimated_minutes,
                "reason": "Low mastery score for this topic",
            })

    # If no weak topics — suggest any lessons not yet attempted
    if not suggested:
        all_lessons = db.query(Lesson).limit(request.limit).all()
        for lesson in all_lessons:
            suggested.append({
                "lesson_id": lesson.id,
                "lesson_title": lesson.title,
                "topic_id": lesson.topic_id,
                "difficulty": lesson.difficulty,
                "estimated_minutes": lesson.estimated_minutes,
                "reason": "No mastery data yet — starting with available lessons",
            })

    return {
        "student_id": student.id,
        "suggested_lessons": suggested[: request.limit],
        "note": (
            "Recommendations are generated using deterministic mastery-based logic. "
            "Connect an AI ranking service for personalized ordering."
        ),
    }


# ============================================================
# SUGGEST LEARNING PATH
# Deterministic: ordered by topic and lesson.
# Integration point: replace _build_learning_path_suggestion()
# with an adaptive sequencing algorithm when available.
# ============================================================

@router.post(
    "/learning-path/suggest",
    summary="Suggest a learning path for current student (deterministic)",
)
def suggest_learning_path(
    request: LearningPathSuggestRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    existing_path = (
        db.query(LearningPathItem)
        .filter(LearningPathItem.student_id == student.id)
        .order_by(LearningPathItem.order_index.asc())
        .all()
    )

    existing_lesson_ids = {item.lesson_id for item in existing_path}

    # Suggest lessons not already in the student's learning path
    # Integration point: AI model could predict optimal ordering here.
    all_lessons = (
        db.query(Lesson)
        .limit(request.limit * 2)
        .all()
    )

    suggestions = []
    for idx, lesson in enumerate(all_lessons):
        if lesson.id not in existing_lesson_ids and len(suggestions) < request.limit:
            suggestions.append({
                "order_index": len(existing_path) + idx + 1,
                "lesson_id": lesson.id,
                "lesson_title": lesson.title,
                "topic_id": lesson.topic_id,
                "difficulty": lesson.difficulty,
                "estimated_minutes": lesson.estimated_minutes,
                "reason": "Suggested based on available curriculum content",
                "status": "pending",
            })

    return {
        "student_id": student.id,
        "current_path_length": len(existing_path),
        "suggested_additions": suggestions,
        "note": (
            "Learning path suggestions are generated deterministically from available "
            "content. Connect an adaptive sequencing AI model for personalized paths."
        ),
    }

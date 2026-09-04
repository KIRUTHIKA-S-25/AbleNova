from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.accessibility import AccessibilityProfile
from app.db.models.learning_path import LearningPathItem
from app.db.models.learning_session import LearningSession
from app.db.models.lesson import Lesson
from app.db.models.mastery import StudentTopicMastery
from app.db.models.quiz import Quiz
from app.db.models.quiz_attempt import QuizAttempt
from app.db.models.recommendation import Recommendation
from app.db.models.student import Student
from app.db.models.subject import Subject
from app.db.models.topic import Topic
from app.db.models.user import User
from app.schemas.student_contract import (
    AccessibilityPreferences,
    RecentScoreItem,
    StudentLearningPathItemResponse,
    StudentLearningPathResponse,
    StudentProfileResponse,
    StudentProfileUpdateRequest,
    StudentProgressResponse,
    StudentRecommendationItem,
    StudentRecommendationsResponse,
    SubjectProgressItem,
    TopicPerformanceItem,
)
from app.services.recommendation_service import generate_recommendations_for_student

router = APIRouter(
    prefix="/student",
    tags=["Student (Contract)"],
)


def get_authenticated_student(current_user: User, db: Session) -> Student:
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


def _get_or_create_accessibility(student_id: UUID, db: Session) -> AccessibilityProfile:
    profile = (
        db.query(AccessibilityProfile)
        .filter(AccessibilityProfile.student_id == student_id)
        .first()
    )
    if not profile:
        profile = AccessibilityProfile(
            student_id=student_id,
            text_enabled=True,
            audio_enabled=True,
            captions_enabled=True,
            simplified_content=True,
            large_text=False,
            high_contrast=False,
            reduced_motion=False,
            keyboard_navigation=True,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ============================================================
# GET /student/profile
# ============================================================
@router.get(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Get unified student profile and accessibility preferences",
)
def get_student_profile(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)
    acc = _get_or_create_accessibility(student.id, db)

    return StudentProfileResponse(
        student_id=student.id,
        name=current_user.name,
        age=student.age,
        grade=student.grade,
        preferred_language=student.preferred_language,
        accessibility=AccessibilityPreferences(
            text_enabled=acc.text_enabled,
            audio_enabled=acc.audio_enabled,
            captions_enabled=acc.captions_enabled,
            simplified_content=acc.simplified_content,
            large_text=acc.large_text,
            high_contrast=acc.high_contrast,
            reduced_motion=acc.reduced_motion,
            keyboard_navigation=acc.keyboard_navigation,
        ),
    )


# ============================================================
# PUT /student/profile
# ============================================================
@router.put(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Update student profile and accessibility preferences",
)
def update_student_profile(
    update_data: StudentProfileUpdateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)
    acc = _get_or_create_accessibility(student.id, db)

    if update_data.preferred_language is not None:
        student.preferred_language = update_data.preferred_language
    if update_data.age is not None:
        student.age = update_data.age
    if update_data.grade is not None:
        student.grade = update_data.grade

    if update_data.accessibility is not None:
        acc_dict = update_data.accessibility.model_dump()
        for field, val in acc_dict.items():
            if hasattr(acc, field):
                setattr(acc, field, val)

    db.commit()
    db.refresh(student)
    db.refresh(acc)

    return StudentProfileResponse(
        student_id=student.id,
        name=current_user.name,
        age=student.age,
        grade=student.grade,
        preferred_language=student.preferred_language,
        accessibility=AccessibilityPreferences(
            text_enabled=acc.text_enabled,
            audio_enabled=acc.audio_enabled,
            captions_enabled=acc.captions_enabled,
            simplified_content=acc.simplified_content,
            large_text=acc.large_text,
            high_contrast=acc.high_contrast,
            reduced_motion=acc.reduced_motion,
            keyboard_navigation=acc.keyboard_navigation,
        ),
    )


# ============================================================
# GET /student/progress
# ============================================================
@router.get(
    "/progress",
    response_model=StudentProgressResponse,
    summary="Get overall student progress overview matching API Contract",
)
def get_student_progress_contract(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    # Learning time in minutes
    sessions = (
        db.query(LearningSession)
        .filter(LearningSession.student_id == student.id)
        .all()
    )
    total_seconds = sum(s.duration_seconds or 0 for s in sessions)
    learning_time_minutes = total_seconds // 60

    # Topic masteries
    mastery_records = (
        db.query(StudentTopicMastery)
        .filter(StudentTopicMastery.student_id == student.id)
        .all()
    )

    weak_topics = []
    strong_topics = []
    mastery_by_topic = {}

    for m in mastery_records:
        mastery_by_topic[m.topic_id] = m.mastery_score
        topic = db.query(Topic).filter(Topic.id == m.topic_id).first()
        topic_name = topic.name if topic else "Unknown Topic"
        item = TopicPerformanceItem(
            topic_id=m.topic_id,
            topic_name=topic_name,
            mastery_score=m.mastery_score,
            confidence=m.confidence,
        )
        if m.mastery_score < 0.6:
            weak_topics.append(item)
        elif m.mastery_score >= 0.8:
            strong_topics.append(item)

    # Subject breakdown
    subjects = db.query(Subject).all()
    subject_progress_items = []
    subject_progress_values = []

    for sub in subjects:
        sub_topics = db.query(Topic).filter(Topic.subject_id == sub.id).all()
        if sub_topics:
            scores = [mastery_by_topic.get(t.id, 0.0) for t in sub_topics]
            sub_progress = round(sum(scores) / len(scores), 2)
        else:
            sub_progress = 0.0
        subject_progress_values.append(sub_progress)
        subject_progress_items.append(
            SubjectProgressItem(
                subject_id=sub.id,
                name=sub.name,
                progress=sub_progress,
            )
        )

    overall_progress = (
        round(sum(subject_progress_values) / len(subject_progress_values), 2)
        if subject_progress_values
        else 0.0
    )

    # Recent quiz scores
    recent_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .order_by(QuizAttempt.created_at.desc())
        .limit(5)
        .all()
    )
    recent_scores = []
    for att in recent_attempts:
        quiz = db.query(Quiz).filter(Quiz.id == att.quiz_id).first()
        quiz_title = quiz.title if quiz else "Quiz"
        recent_scores.append(
            RecentScoreItem(
                quiz_id=att.quiz_id,
                quiz_title=quiz_title,
                score=att.score,
                total=att.total_questions,
                accuracy=att.accuracy,
                created_at=att.created_at.isoformat() if att.created_at else "",
            )
        )

    return StudentProgressResponse(
        overall_progress=overall_progress,
        subjects=subject_progress_items,
        recent_scores=recent_scores,
        weak_topics=weak_topics,
        strong_topics=strong_topics,
        learning_time_minutes=learning_time_minutes,
    )


# ============================================================
# GET /student/recommendations
# ============================================================
@router.get(
    "/recommendations",
    response_model=StudentRecommendationsResponse,
    summary="Get active recommendations matching API Contract",
)
def get_student_recommendations_contract(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.student_id == student.id,
            Recommendation.status.in_(["pending", "active"]),
        )
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    if not recommendations:
        recommendations = generate_recommendations_for_student(student.id, db)
        db.commit()

    items = []
    for rec in recommendations:
        lesson = db.query(Lesson).filter(Lesson.id == rec.lesson_id).first()
        title = lesson.title if lesson else "Recommended Practice"
        items.append(
            StudentRecommendationItem(
                id=rec.id,
                lesson_id=rec.lesson_id,
                title=title,
                reason=rec.reason,
                difficulty=rec.difficulty,
                estimated_minutes=rec.estimated_minutes,
            )
        )

    return StudentRecommendationsResponse(recommendations=items)


# ============================================================
# GET /student/learning-path
# ============================================================
@router.get(
    "/learning-path",
    response_model=StudentLearningPathResponse,
    summary="Get student personalized learning path matching API Contract",
)
def get_student_learning_path_contract(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    student = get_authenticated_student(current_user, db)

    items = (
        db.query(LearningPathItem)
        .filter(LearningPathItem.student_id == student.id)
        .order_by(LearningPathItem.order_index.asc())
        .all()
    )

    # If student has no path items, populate default from available lessons
    if not items:
        all_lessons = db.query(Lesson).limit(10).all()
        created_items = []
        for idx, lesson in enumerate(all_lessons):
            path_item = LearningPathItem(
                student_id=student.id,
                lesson_id=lesson.id,
                order_index=idx + 1,
                reason="Build foundational understanding.",
                status="recommended",
            )
            db.add(path_item)
            created_items.append(path_item)
        if created_items:
            db.commit()
            items = created_items

    resp_items = [
        StudentLearningPathItemResponse(
            lesson_id=item.lesson_id,
            order=item.order_index,
            reason=item.reason,
            status=item.status,
        )
        for item in items
    ]

    return StudentLearningPathResponse(items=resp_items)

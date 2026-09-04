from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.database import get_db
from app.db.models.engagement import EngagementEvent
from app.db.models.learning_session import LearningSession
from app.db.models.lesson import Lesson
from app.db.models.mastery import StudentTopicMastery
from app.db.models.quiz import Quiz
from app.db.models.quiz_attempt import QuizAttempt
from app.db.models.student import Student
from app.db.models.subject import Subject
from app.db.models.teacher import Teacher
from app.db.models.topic import Topic
from app.db.models.user import User
from app.schemas.teacher import (
    TeacherAnalyticsResponse,
    TeacherResponse,
    TeacherStudentDetailResponse,
    TeacherStudentsListResponse,
    TeacherStudentSummaryItem,
)

router = APIRouter(
    prefix="/teacher",
    tags=["Teachers"],
)


def get_authenticated_teacher(current_user: User, db: Session) -> Teacher:
    teacher = (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .first()
    )
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found",
        )
    return teacher


@router.post(
    "",
    response_model=TeacherResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_teacher_profile(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    existing_teacher = (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.id)
        .first()
    )

    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Teacher profile already exists",
        )

    teacher = Teacher(
        user_id=current_user.id,
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return teacher


@router.get(
    "/me",
    response_model=TeacherResponse,
)
def get_my_teacher_profile(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    return get_authenticated_teacher(current_user, db)


@router.put(
    "/me",
    response_model=TeacherResponse,
)
def update_my_teacher_profile(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    teacher = get_authenticated_teacher(current_user, db)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get(
    "/me/content",
)
def get_teacher_content_overview(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    teacher = get_authenticated_teacher(current_user, db)

    subjects_count = db.query(Subject).count()
    topics_count = db.query(Topic).count()
    lessons_count = db.query(Lesson).count()

    return {
        "teacher_id": teacher.id,
        "subjects_count": subjects_count,
        "topics_count": topics_count,
        "lessons_count": lessons_count,
    }


# ============================================================
# GET /teacher/students (API Contract Section 15)
# ============================================================
@router.get(
    "/students",
    response_model=TeacherStudentsListResponse,
    summary="List all authorized students with educational performance metrics",
)
def get_teacher_students(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    get_authenticated_teacher(current_user, db)

    students = db.query(Student).all()
    student_items = []

    for s in students:
        student_user = db.query(User).filter(User.id == s.user_id).first()
        student_name = student_user.name if student_user else "Student"

        # Topic mastery average
        masteries = (
            db.query(StudentTopicMastery)
            .filter(StudentTopicMastery.student_id == s.id)
            .all()
        )
        avg_mastery = (
            round(sum(m.mastery_score for m in masteries) / len(masteries), 2)
            if masteries
            else 0.0
        )

        # Overall progress
        progress_val = avg_mastery

        # Engagement score (ratio of recent engagement events)
        engagement_count = (
            db.query(EngagementEvent)
            .filter(EngagementEvent.student_id == s.id)
            .count()
        )
        engagement_ratio = min(1.0, round(engagement_count / 10.0, 2)) if engagement_count else 0.5

        # Last active timestamp from sessions or events
        last_event = (
            db.query(EngagementEvent)
            .filter(EngagementEvent.student_id == s.id)
            .order_by(EngagementEvent.timestamp.desc())
            .first()
        )
        last_active = last_event.timestamp.isoformat() if last_event else None

        student_items.append(
            TeacherStudentSummaryItem(
                student_id=s.id,
                name=student_name,
                progress=progress_val,
                mastery=avg_mastery,
                engagement=engagement_ratio,
                last_active=last_active,
            )
        )

    return TeacherStudentsListResponse(students=student_items)


# ============================================================
# GET /teacher/students/{student_id} (API Contract Section 16)
# ============================================================
@router.get(
    "/students/{student_id}",
    response_model=TeacherStudentDetailResponse,
    summary="Get detailed educational progress for an authorized student",
)
def get_teacher_student_detail(
    student_id: UUID,
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    get_authenticated_teacher(current_user, db)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    student_user = db.query(User).filter(User.id == student.user_id).first()
    student_name = student_user.name if student_user else "Student"

    # Masteries
    masteries = (
        db.query(StudentTopicMastery)
        .filter(StudentTopicMastery.student_id == student.id)
        .all()
    )
    avg_mastery = (
        round(sum(m.mastery_score for m in masteries) / len(masteries), 2)
        if masteries
        else 0.0
    )
    mastery_by_topic = []
    for m in masteries:
        topic = db.query(Topic).filter(Topic.id == m.topic_id).first()
        mastery_by_topic.append({
            "topic_id": str(m.topic_id),
            "topic_name": topic.name if topic else "Topic",
            "mastery_score": m.mastery_score,
            "confidence": m.confidence,
        })

    # Sessions
    sessions = (
        db.query(LearningSession)
        .filter(LearningSession.student_id == student.id)
        .all()
    )
    completed_sessions = [s for s in sessions if s.completed_at is not None]
    total_study_minutes = sum(s.duration_seconds or 0 for s in sessions) // 60

    # Recent quiz attempts
    recent_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .order_by(QuizAttempt.created_at.desc())
        .limit(10)
        .all()
    )
    recent_quiz_attempts = []
    for att in recent_attempts:
        quiz = db.query(Quiz).filter(Quiz.id == att.quiz_id).first()
        recent_quiz_attempts.append({
            "quiz_id": str(att.quiz_id),
            "quiz_title": quiz.title if quiz else "Quiz",
            "score": att.score,
            "total_questions": att.total_questions,
            "accuracy": att.accuracy,
            "created_at": att.created_at.isoformat() if att.created_at else None,
        })

    return TeacherStudentDetailResponse(
        student_id=student.id,
        name=student_name,
        age=student.age,
        grade=student.grade,
        preferred_language=student.preferred_language,
        overall_progress=avg_mastery,
        average_mastery=avg_mastery,
        completed_sessions_count=len(completed_sessions),
        total_study_minutes=total_study_minutes,
        mastery_by_topic=mastery_by_topic,
        recent_quiz_attempts=recent_quiz_attempts,
    )


# ============================================================
# GET /teacher/analytics (API Contract Section 17)
# ============================================================
@router.get(
    "/analytics",
    response_model=TeacherAnalyticsResponse,
    summary="Get class-wide analytics including progress, difficult topics, and trends",
)
def get_teacher_analytics(
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db),
):
    get_authenticated_teacher(current_user, db)

    # Class-wide average progress from all mastery records
    all_masteries = db.query(StudentTopicMastery).all()
    avg_progress = (
        round(sum(m.mastery_score for m in all_masteries) / len(all_masteries), 2)
        if all_masteries
        else 0.0
    )

    # Difficult topics (topics where average mastery is lowest)
    topics = db.query(Topic).all()
    difficult_topics = []
    for topic in topics:
        t_masteries = [m for m in all_masteries if m.topic_id == topic.id]
        if t_masteries:
            t_avg = sum(m.mastery_score for m in t_masteries) / len(t_masteries)
            if t_avg < 0.7:
                difficult_topics.append({
                    "topic_id": str(topic.id),
                    "topic_name": topic.name,
                    "average_mastery": round(t_avg, 2),
                    "students_struggling": sum(1 for m in t_masteries if m.mastery_score < 0.6),
                })
    difficult_topics.sort(key=lambda x: x["average_mastery"])

    # Performance trend (recent 10 quiz attempts average accuracy)
    recent_attempts = (
        db.query(QuizAttempt)
        .order_by(QuizAttempt.created_at.desc())
        .limit(20)
        .all()
    )
    performance_trend = [
        {
            "attempt_id": str(a.id),
            "accuracy": a.accuracy,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in recent_attempts
    ]

    # Engagement trend (recent events count by day/type)
    recent_events = (
        db.query(EngagementEvent)
        .order_by(EngagementEvent.timestamp.desc())
        .limit(30)
        .all()
    )
    engagement_trend = [
        {
            "event_type": e.event_type,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "duration_seconds": e.duration_seconds,
        }
        for e in recent_events
    ]

    return TeacherAnalyticsResponse(
        average_progress=avg_progress,
        difficult_topics=difficult_topics[:5],
        performance_trend=performance_trend,
        engagement_trend=engagement_trend,
    )

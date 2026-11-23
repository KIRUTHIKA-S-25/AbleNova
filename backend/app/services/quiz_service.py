"""Quiz management, assessment grading, adaptive feedback,
and student topic mastery integration service.
"""
from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, List, Optional, Set
from uuid import UUID
import uuid
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.db.models.curriculum import Lesson, Topic
from app.db.models.progress import EngagementEvent, Recommendation, StudentTopicMastery
from app.db.models.quiz import Question, QuestionAttempt, Quiz, QuizAttempt
from app.db.models.student import Student
from app.db.models.user import User
from app.schemas.common import UserRole
from app.schemas.quiz import (
    QuestionCreate,
    QuestionRead,
    QuestionResultItem,
    QuestionUpdate,
    QuizCreate,
    QuizItemResponse,
    QuizRead,
    QuizResultResponse,
    QuizSubmission,
    QuizUpdate,
    TopicResultItem,
)
from app.services.mastery_service import mastery_service

logger = logging.getLogger("ablenova.quiz.service")


class QuizService:
    """Manages quiz authoring, client retrieval, objective evaluation,
    idempotent submission, and student mastery synchronization.
    """

    # ==========================================================================
    # 1. Quiz Authoring & Management
    # ==========================================================================

    def create_quiz(
        self,
        db: Session,
        payload: QuizCreate,
        current_user: User,
    ) -> Quiz:
        """Create a new quiz assessment associated with a lesson."""
        lesson = db.execute(select(Lesson).where(Lesson.id == payload.lesson_id)).scalar_one_or_none()
        if not lesson:
            raise AppException(
                code="NOT_FOUND",
                message=f"Lesson with id '{payload.lesson_id}' not found",
                status_code=404,
            )

        topic_id = payload.topic_id or lesson.topic_id
        quiz = Quiz(
            id=uuid.uuid4(),
            lesson_id=payload.lesson_id,
            topic_id=topic_id,
            title=payload.title,
            description=payload.description,
            is_published=payload.is_published,
            passing_threshold=payload.passing_threshold,
            max_attempts=payload.max_attempts,
        )
        db.add(quiz)
        db.flush()

        if payload.questions:
            for idx, q_data in enumerate(payload.questions):
                q = Question(
                    id=uuid.uuid4(),
                    quiz_id=quiz.id,
                    topic_id=q_data.topic_id or topic_id,
                    question_text=q_data.question_text,
                    question_type=q_data.question_type,
                    options=q_data.options,
                    correct_answer=q_data.correct_answer,
                    explanation=q_data.explanation,
                    difficulty=q_data.difficulty.value if hasattr(q_data.difficulty, "value") else str(q_data.difficulty),
                    order_index=q_data.order_index if q_data.order_index is not None else idx,
                    marks=q_data.marks,
                )
                db.add(q)

        db.commit()
        db.refresh(quiz)
        logger.info("Quiz '%s' (%s) created successfully", quiz.title, quiz.id)
        return quiz

    def get_quiz_by_id(
        self,
        db: Session,
        quiz_id: UUID,
        current_user: User,
    ) -> Dict[str, Any]:
        """Retrieve quiz details adhering to client role privacy rules.
        CRITICAL SECURITY RULE: Student responses MUST NOT contain correct_answer or explanation!
        """
        quiz = db.execute(
            select(Quiz).where(Quiz.id == quiz_id)
        ).scalar_one_or_none()

        if not quiz:
            raise AppException(
                code="NOT_FOUND",
                message="Quiz not found",
                status_code=404,
            )

        is_student = (current_user.role == UserRole.STUDENT.value)

        # Unpublished quizzes are hidden from students
        if is_student and not quiz.is_published:
            raise AppException(
                code="FORBIDDEN",
                message="This quiz is not currently published",
                status_code=403,
            )

        questions = sorted(quiz.questions, key=lambda q: q.order_index)

        if is_student:
            # Client-facing student view: strictly omit correct_answer and explanation
            client_questions = []
            for q in questions:
                client_questions.append({
                    "id": str(q.id),
                    "type": q.question_type,
                    "question": q.question_text,
                    "options": q.options,
                    "difficulty": q.difficulty,
                    "marks": q.marks,
                })
            return {
                "id": str(quiz.id),
                "lesson_id": str(quiz.lesson_id),
                "title": quiz.title,
                "description": quiz.description,
                "passing_threshold": quiz.passing_threshold,
                "questions": client_questions,
            }
        else:
            # Teacher / Admin view: include full metadata, correct answers, explanations
            admin_questions = []
            for q in questions:
                admin_questions.append({
                    "id": str(q.id),
                    "quiz_id": str(q.quiz_id),
                    "topic_id": str(q.topic_id),
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                    "difficulty": q.difficulty,
                    "order_index": q.order_index,
                    "marks": q.marks,
                    "created_at": q.created_at,
                })
            return {
                "id": str(quiz.id),
                "lesson_id": str(quiz.lesson_id),
                "topic_id": str(quiz.topic_id) if quiz.topic_id else None,
                "title": quiz.title,
                "description": quiz.description,
                "is_published": quiz.is_published,
                "passing_threshold": quiz.passing_threshold,
                "max_attempts": quiz.max_attempts,
                "created_at": quiz.created_at,
                "questions": admin_questions,
            }

    def update_quiz(
        self,
        db: Session,
        quiz_id: UUID,
        payload: QuizUpdate,
        current_user: User,
    ) -> Quiz:
        """Update quiz parameters (Teacher/Admin)."""
        quiz = db.execute(select(Quiz).where(Quiz.id == quiz_id)).scalar_one_or_none()
        if not quiz:
            raise AppException(code="NOT_FOUND", message="Quiz not found", status_code=404)

        if payload.title is not None:
            quiz.title = payload.title
        if payload.description is not None:
            quiz.description = payload.description
        if payload.is_published is not None:
            # If publishing, ensure quiz contains at least one question
            if payload.is_published and len(quiz.questions) == 0:
                raise AppException(
                    code="VALIDATION_ERROR",
                    message="Cannot publish a quiz with no questions",
                    status_code=422,
                )
            quiz.is_published = payload.is_published
        if payload.passing_threshold is not None:
            quiz.passing_threshold = payload.passing_threshold
        if payload.max_attempts is not None:
            quiz.max_attempts = payload.max_attempts
        if payload.topic_id is not None:
            quiz.topic_id = payload.topic_id

        db.commit()
        db.refresh(quiz)
        return quiz

    def publish_quiz(self, db: Session, quiz_id: UUID) -> Quiz:
        """Publish quiz, validating that it contains at least one question."""
        quiz = db.execute(select(Quiz).where(Quiz.id == quiz_id)).scalar_one_or_none()
        if not quiz:
            raise AppException(code="NOT_FOUND", message="Quiz not found", status_code=404)
        if len(quiz.questions) == 0:
            raise AppException(
                code="VALIDATION_ERROR",
                message="Cannot publish an empty quiz. Please add at least one question.",
                status_code=422,
            )
        quiz.is_published = True
        db.commit()
        db.refresh(quiz)
        return quiz

    def unpublish_quiz(self, db: Session, quiz_id: UUID) -> Quiz:
        """Unpublish quiz, hiding it from student discovery."""
        quiz = db.execute(select(Quiz).where(Quiz.id == quiz_id)).scalar_one_or_none()
        if not quiz:
            raise AppException(code="NOT_FOUND", message="Quiz not found", status_code=404)
        quiz.is_published = False
        db.commit()
        db.refresh(quiz)
        return quiz

    def delete_quiz(self, db: Session, quiz_id: UUID) -> None:
        """Permanently delete a quiz and associated questions/attempts."""
        quiz = db.execute(select(Quiz).where(Quiz.id == quiz_id)).scalar_one_or_none()
        if not quiz:
            raise AppException(code="NOT_FOUND", message="Quiz not found", status_code=404)
        db.delete(quiz)
        db.commit()

    def list_quizzes(
        self,
        db: Session,
        lesson_id: Optional[UUID] = None,
        topic_id: Optional[UUID] = None,
        is_student: bool = False,
    ) -> List[Dict[str, Any]]:
        """List quizzes filtered by lesson or topic."""
        query = select(Quiz)
        if lesson_id:
            query = query.where(Quiz.lesson_id == lesson_id)
        if topic_id:
            query = query.where(Quiz.topic_id == topic_id)
        if is_student:
            query = query.where(Quiz.is_published == True)

        quizzes = db.execute(query.order_by(Quiz.created_at.desc())).scalars().all()
        results = []
        for q in quizzes:
            results.append({
                "id": str(q.id),
                "lesson_id": str(q.lesson_id),
                "topic_id": str(q.topic_id) if q.topic_id else None,
                "title": q.title,
                "description": q.description,
                "is_published": q.is_published,
                "passing_threshold": q.passing_threshold,
                "max_attempts": q.max_attempts,
                "questions_count": len(q.questions),
                "created_at": q.created_at,
            })
        return results

    # ==========================================================================
    # 2. Question Management
    # ==========================================================================

    def create_question(
        self,
        db: Session,
        quiz_id: UUID,
        payload: QuestionCreate,
    ) -> Question:
        """Add a question to a quiz."""
        quiz = db.execute(select(Quiz).where(Quiz.id == quiz_id)).scalar_one_or_none()
        if not quiz:
            raise AppException(code="NOT_FOUND", message="Quiz not found", status_code=404)

        topic_id = payload.topic_id or quiz.topic_id
        q = Question(
            id=uuid.uuid4(),
            quiz_id=quiz.id,
            topic_id=topic_id,
            question_text=payload.question_text,
            question_type=payload.question_type,
            options=payload.options,
            correct_answer=payload.correct_answer,
            explanation=payload.explanation,
            difficulty=payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty),
            order_index=payload.order_index,
            marks=payload.marks,
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        return q

    def update_question(
        self,
        db: Session,
        question_id: UUID,
        payload: QuestionUpdate,
    ) -> Question:
        """Update question content, answer key, or explanation."""
        q = db.execute(select(Question).where(Question.id == question_id)).scalar_one_or_none()
        if not q:
            raise AppException(code="NOT_FOUND", message="Question not found", status_code=404)

        if payload.question_text is not None:
            q.question_text = payload.question_text
        if payload.question_type is not None:
            q.question_type = payload.question_type
        if payload.options is not None:
            q.options = payload.options
        if payload.correct_answer is not None:
            q.correct_answer = payload.correct_answer
        if payload.explanation is not None:
            q.explanation = payload.explanation
        if payload.difficulty is not None:
            q.difficulty = payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty)
        if payload.order_index is not None:
            q.order_index = payload.order_index
        if payload.marks is not None:
            q.marks = payload.marks
        if payload.topic_id is not None:
            q.topic_id = payload.topic_id

        db.commit()
        db.refresh(q)
        return q

    def delete_question(self, db: Session, question_id: UUID) -> None:
        """Delete an individual question."""
        q = db.execute(select(Question).where(Question.id == question_id)).scalar_one_or_none()
        if not q:
            raise AppException(code="NOT_FOUND", message="Question not found", status_code=404)
        db.delete(q)
        db.commit()

    # ==========================================================================
    # 3. Quiz Submission & Objective Grading Engine
    # ==========================================================================

    def _normalize_answer(self, val: Any) -> str:
        """Normalize answer strings and formats for robust comparison."""
        if val is None:
            return ""
        if isinstance(val, (list, set)):
            # Sorted comma-delimited representation for multiple_select
            return ",".join(sorted(str(x).strip().lower() for x in val if x is not None))
        s = str(val).strip().lower()
        # Normalize boolean representations
        if s in ["true", "t", "1", "yes"]:
            return "true"
        if s in ["false", "f", "0", "no"]:
            return "false"
        return s

    def _grade_question(
        self,
        question: Question,
        student_raw_answer: str,
    ) -> bool:
        """Determine whether student's answer is correct for multiple choice, multiple select, or true/false."""
        norm_student = self._normalize_answer(student_raw_answer)
        norm_correct = self._normalize_answer(question.correct_answer)

        # Direct string equality check
        if norm_student == norm_correct:
            return True

        # Multiple select check (handle comma-separated or JSON list formats)
        if question.question_type == "multiple_select":
            try:
                # If correct_answer was stored as JSON or comma string
                correct_set = set(self._normalize_answer(x) for x in question.correct_answer.split(","))
                student_set = set(self._normalize_answer(x) for x in student_raw_answer.split(","))
                return correct_set == student_set
            except Exception:
                pass

        return False

    def submit_quiz(
        self,
        db: Session,
        quiz_id: UUID,
        student: Student,
        payload: QuizSubmission,
    ) -> Dict[str, Any]:
        """Perform official backend quiz grading, score calculation, idempotent persistence,
        and student topic mastery synchronization.
        """
        quiz = db.execute(select(Quiz).where(Quiz.id == quiz_id)).scalar_one_or_none()
        if not quiz:
            raise AppException(code="NOT_FOUND", message="Quiz not found", status_code=404)

        if not quiz.is_published:
            raise AppException(
                code="FORBIDDEN",
                message="This quiz is not currently available for submission",
                status_code=403,
            )

        # Idempotency check: if client_submission_id was already evaluated, return stored result
        if payload.client_submission_id:
            existing_attempt = db.execute(
                select(QuizAttempt).where(
                    QuizAttempt.quiz_id == quiz.id,
                    QuizAttempt.student_id == student.id,
                    QuizAttempt.client_submission_id == payload.client_submission_id,
                )
            ).scalar_one_or_none()
            if existing_attempt:
                logger.info("Idempotent replay detected for submission %s", payload.client_submission_id)
                return self._format_attempt_result(existing_attempt)

        # Attempt limit check
        if quiz.max_attempts is not None and quiz.max_attempts > 0:
            prior_count = db.execute(
                select(func.count(QuizAttempt.id)).where(
                    QuizAttempt.quiz_id == quiz.id,
                    QuizAttempt.student_id == student.id,
                )
            ).scalar() or 0
            if prior_count >= quiz.max_attempts:
                raise AppException(
                    code="VALIDATION_ERROR",
                    message=f"Maximum attempt limit ({quiz.max_attempts}) reached for this quiz",
                    status_code=422,
                )

        questions = {str(q.id): q for q in quiz.questions}
        if not questions:
            raise AppException(
                code="VALIDATION_ERROR",
                message="Quiz contains no questions to evaluate",
                status_code=422,
            )

        # 1. Objective Grading
        total_possible = len(questions)
        earned_score = 0
        total_time_seconds = 0
        topic_stats: Dict[str, Dict[str, int]] = {}
        question_evaluations: List[Dict[str, Any]] = []

        # Index answers by question_id
        student_answers = {a.question_id: a for a in payload.answers}

        for q_id_str, q in questions.items():
            t_id = str(q.topic_id)
            if t_id not in topic_stats:
                topic_stats[t_id] = {"correct": 0, "total": 0}
            topic_stats[t_id]["total"] += 1

            sub = student_answers.get(q_id_str)
            raw_answer = sub.answer if sub else ""
            time_spent = sub.time_taken_seconds if sub else 0
            total_time_seconds += time_spent

            is_correct = self._grade_question(q, raw_answer)
            marks_got = float(q.marks) if is_correct else 0.0
            if is_correct:
                earned_score += 1
                topic_stats[t_id]["correct"] += 1

            question_evaluations.append({
                "question": q,
                "student_answer": raw_answer,
                "is_correct": is_correct,
                "marks_obtained": marks_got,
                "time_taken_seconds": time_spent,
            })

        # Calculate metrics
        accuracy = round(earned_score / total_possible, 2) if total_possible > 0 else 0.0
        is_passed = (accuracy >= quiz.passing_threshold)

        # Topic results
        topic_results: List[Dict[str, Any]] = []
        for t_id, stats in topic_stats.items():
            t_acc = round(stats["correct"] / stats["total"], 2) if stats["total"] > 0 else 0.0
            topic_results.append({
                "topic_id": t_id,
                "accuracy": t_acc,
            })

        # Adaptive feedback & recommendations
        recommendation_id = None
        if accuracy >= 0.90:
            feedback = "Outstanding work! You demonstrated complete mastery of this material."
        elif is_passed:
            feedback = "Great job! You passed the assessment. Keep up the consistent practice."
        else:
            feedback = "Good effort! Review the suggested lesson material and try again to improve your score."
            # Automatically provision an adaptive recommendation if student scored below threshold
            rec = Recommendation(
                id=uuid.uuid4(),
                student_id=student.id,
                lesson_id=quiz.lesson_id,
                reason="Review recommended following assessment score below passing threshold",
                status="recommended",
            )
            db.add(rec)
            db.flush()
            recommendation_id = rec.id

        # 2. Persist QuizAttempt & Item-Level QuestionAttempts
        attempt = QuizAttempt(
            id=uuid.uuid4(),
            student_id=student.id,
            quiz_id=quiz.id,
            score=earned_score,
            total_questions=total_possible,
            accuracy=accuracy,
            is_passed=is_passed,
            time_taken_seconds=total_time_seconds,
            client_submission_id=payload.client_submission_id,
            feedback=feedback,
            recommendation_id=recommendation_id,
        )
        db.add(attempt)
        db.flush()

        question_results_output: List[Dict[str, Any]] = []
        for ev in question_evaluations:
            q = ev["question"]
            qa = QuestionAttempt(
                id=uuid.uuid4(),
                attempt_id=attempt.id,
                question_id=q.id,
                student_answer=ev["student_answer"],
                is_correct=ev["is_correct"],
                marks_obtained=ev["marks_obtained"],
                time_taken_seconds=ev["time_taken_seconds"],
            )
            db.add(qa)

            # Unlocked feedback item (answers and explanations NOW available post-submission)
            question_results_output.append({
                "question_id": str(q.id),
                "question_text": q.question_text,
                "student_answer": ev["student_answer"],
                "correct_answer": q.correct_answer,
                "is_correct": ev["is_correct"],
                "marks_obtained": ev["marks_obtained"],
                "marks_possible": q.marks,
                "explanation": q.explanation,
            })

        # Telemetry Engagement Event
        engagement = EngagementEvent(
            id=uuid.uuid4(),
            student_id=student.id,
            event_type="quiz_completed",
            lesson_id=quiz.lesson_id,
            duration_seconds=total_time_seconds,
        )
        db.add(engagement)

        # 3. Synchronize Student Topic Mastery
        self._update_student_mastery_for_topics(
            db=db,
            student_id=student.id,
            topic_results=topic_results,
        )

        db.commit()
        db.refresh(attempt)

        return {
            "attempt_id": str(attempt.id),
            "score": earned_score,
            "total": total_possible,
            "accuracy": accuracy,
            "is_passed": is_passed,
            "time_taken_seconds": total_time_seconds,
            "topic_results": topic_results,
            "feedback": feedback,
            "recommendation_id": str(recommendation_id) if recommendation_id else None,
            "question_results": question_results_output,
        }

    def _update_student_mastery_for_topics(
        self,
        db: Session,
        student_id: UUID,
        topic_results: List[Dict[str, Any]],
    ) -> None:
        """Update student topic mastery scores using existing mastery service."""
        for tr in topic_results:
            try:
                t_uuid = UUID(tr["topic_id"])
            except (ValueError, TypeError):
                continue

            # Query historical topic attempts
            prior_attempts = db.execute(
                select(QuestionAttempt.is_correct)
                .join(Question, Question.id == QuestionAttempt.question_id)
                .join(QuizAttempt, QuizAttempt.id == QuestionAttempt.attempt_id)
                .where(
                    QuizAttempt.student_id == student_id,
                    Question.topic_id == t_uuid,
                )
            ).scalars().all()

            attempt_count = len(prior_attempts)
            recent_scores = [1.0 if x else 0.0 for x in prior_attempts[-5:]] if prior_attempts else [tr["accuracy"]]
            historical_accuracy = sum(1.0 if x else 0.0 for x in prior_attempts) / attempt_count if attempt_count > 0 else tr["accuracy"]

            mastery_calc = mastery_service.calculate_topic_mastery(
                recent_scores=recent_scores,
                historical_accuracy=historical_accuracy,
                attempt_count=attempt_count,
            )

            # Upsert into student_topic_mastery
            existing_mastery = db.execute(
                select(StudentTopicMastery).where(
                    StudentTopicMastery.student_id == student_id,
                    StudentTopicMastery.topic_id == t_uuid,
                )
            ).scalar_one_or_none()

            if existing_mastery:
                existing_mastery.mastery_score = mastery_calc["mastery_score"]
                existing_mastery.confidence = mastery_calc["confidence"]
                existing_mastery.updated_at = datetime.now(timezone.utc)
            else:
                new_mastery = StudentTopicMastery(
                    student_id=student_id,
                    topic_id=t_uuid,
                    mastery_score=mastery_calc["mastery_score"],
                    confidence=mastery_calc["confidence"],
                )
                db.add(new_mastery)

    def _format_attempt_result(self, attempt: QuizAttempt) -> Dict[str, Any]:
        """Format an existing QuizAttempt object into QuizResultResponse."""
        question_results = []
        topic_stats: Dict[str, Dict[str, int]] = {}

        for qa in attempt.question_attempts:
            q = qa.question
            t_id = str(q.topic_id)
            if t_id not in topic_stats:
                topic_stats[t_id] = {"correct": 0, "total": 0}
            topic_stats[t_id]["total"] += 1
            if qa.is_correct:
                topic_stats[t_id]["correct"] += 1

            question_results.append({
                "question_id": str(q.id),
                "question_text": q.question_text,
                "student_answer": qa.student_answer,
                "correct_answer": q.correct_answer,
                "is_correct": qa.is_correct,
                "marks_obtained": qa.marks_obtained,
                "marks_possible": q.marks,
                "explanation": q.explanation,
            })

        topic_results = []
        for t_id, stats in topic_stats.items():
            acc = round(stats["correct"] / stats["total"], 2) if stats["total"] > 0 else 0.0
            topic_results.append({
                "topic_id": t_id,
                "accuracy": acc,
            })

        return {
            "attempt_id": str(attempt.id),
            "score": attempt.score,
            "total": attempt.total_questions,
            "accuracy": attempt.accuracy,
            "is_passed": attempt.is_passed,
            "time_taken_seconds": attempt.time_taken_seconds,
            "topic_results": topic_results,
            "feedback": attempt.feedback or "Quiz completed.",
            "recommendation_id": str(attempt.recommendation_id) if attempt.recommendation_id else None,
            "question_results": question_results,
        }

    # ==========================================================================
    # 4. Attempt History & Assessment Reviews
    # ==========================================================================

    def get_student_attempts(
        self,
        db: Session,
        quiz_id: UUID,
        student_id: UUID,
    ) -> List[Dict[str, Any]]:
        """Retrieve historical attempts for a student on a specific quiz."""
        attempts = db.execute(
            select(QuizAttempt)
            .where(
                QuizAttempt.quiz_id == quiz_id,
                QuizAttempt.student_id == student_id,
            )
            .order_by(QuizAttempt.created_at.desc())
        ).scalars().all()

        results = []
        for a in attempts:
            results.append({
                "id": str(a.id),
                "quiz_id": str(a.quiz_id),
                "student_id": str(a.student_id),
                "score": a.score,
                "total_questions": a.total_questions,
                "accuracy": a.accuracy,
                "is_passed": a.is_passed,
                "time_taken_seconds": a.time_taken_seconds,
                "feedback": a.feedback,
                "created_at": a.created_at,
            })
        return results

    def get_attempt_by_id(
        self,
        db: Session,
        attempt_id: UUID,
    ) -> Dict[str, Any]:
        """Retrieve full details of a specific quiz attempt with unlocked explanations."""
        attempt = db.execute(
            select(QuizAttempt).where(QuizAttempt.id == attempt_id)
        ).scalar_one_or_none()

        if not attempt:
            raise AppException(code="NOT_FOUND", message="Quiz attempt not found", status_code=404)

        return self._format_attempt_result(attempt)


quiz_service = QuizService()

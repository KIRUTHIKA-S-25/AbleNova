import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import AppException
from app.db.models import (
    AccessibilityProfile,
    LearningObjective,
    Lesson,
    LessonResource,
    Student,
    StudentTopicMastery,
    Subject,
    Teacher,
    Topic,
    User,
)
from app.schemas.common import DifficultyLevel, UserRole
from app.schemas.curriculum import (
    LearningObjectiveCreate,
    LearningObjectiveRead,
    LessonAccessibilityMetadata,
    LessonContent,
    LessonCreate,
    LessonDetailResponse,
    LessonItemResponse,
    LessonResourceCreate,
    LessonResourceRead,
    LessonSearchResponse,
    LessonUpdate,
    NextLessonRecommendation,
    StudentCurriculumNextResponse,
    StudentCurriculumResponse,
    StudentSubjectStatus,
    StudentTopicStatus,
    SubjectCreate,
    SubjectDetailResponse,
    SubjectItemResponse,
    SubjectUpdate,
    TopicCreate,
    TopicDetailResponse,
    TopicItemResponse,
    TopicUpdate,
)

logger = logging.getLogger("ablenova.services.curriculum")

MASTERY_COMPLETION_THRESHOLD = 0.70


class CurriculumService:
    """Service layer managing educational subjects, topics, lessons, objectives, resources, and progression."""

    # ==========================================================================
    # Subject Operations
    # ==========================================================================

    @staticmethod
    def list_subjects(
        db: Session,
        q: Optional[str] = None,
        grade: Optional[int] = None,
        language: Optional[str] = None,
        is_active: Optional[bool] = None,
        current_user: Optional[User] = None,
    ) -> List[SubjectItemResponse]:
        """Lists educational subjects with search, grade, language, and active status filters."""
        stmt = select(Subject)

        # Non-teachers only see active subjects by default
        is_privileged = current_user and current_user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]
        if is_active is not None:
            stmt = stmt.where(Subject.is_active == is_active)
        elif not is_privileged:
            stmt = stmt.where(Subject.is_active.is_(True))

        if q:
            pattern = f"%{q.strip()}%"
            stmt = stmt.where(or_(Subject.name.ilike(pattern), Subject.description.ilike(pattern)))

        if grade is not None:
            stmt = stmt.where(Subject.grade_level_min <= grade, Subject.grade_level_max >= grade)

        if language:
            stmt = stmt.where(Subject.language == language.strip().lower())

        subjects = db.execute(stmt.order_by(Subject.name.asc())).scalars().all()
        result = []

        for subject in subjects:
            progress = 0.0
            if current_user and current_user.student:
                masteries = db.execute(
                    select(StudentTopicMastery.mastery_score)
                    .join(Topic, Topic.id == StudentTopicMastery.topic_id)
                    .where(
                        Topic.subject_id == subject.id,
                        StudentTopicMastery.student_id == current_user.student.id,
                    )
                ).scalars().all()
                if masteries:
                    progress = round(sum(masteries) / len(masteries), 2)

            result.append(
                SubjectItemResponse(
                    id=str(subject.id),
                    name=subject.name,
                    description=subject.description,
                    progress=progress,
                    grade_level_min=subject.grade_level_min,
                    grade_level_max=subject.grade_level_max,
                    is_active=subject.is_active,
                    language=subject.language,
                )
            )
        return result

    @staticmethod
    def get_subject_by_id(db: Session, subject_id: UUID) -> Subject:
        """Retrieves a single subject by UUID with eager loaded topics."""
        subject = db.execute(
            select(Subject)
            .options(selectinload(Subject.topics))
            .where(Subject.id == subject_id)
        ).scalar_one_or_none()
        if not subject:
            raise AppException(
                code="NOT_FOUND",
                message="Subject not found.",
                status_code=404,
            )
        return subject

    @staticmethod
    def create_subject(db: Session, payload: SubjectCreate, current_user: User) -> Subject:
        """Creates a new subject. Restricted to teachers and administrators."""
        existing = db.execute(select(Subject).where(Subject.name == payload.name)).scalar_one_or_none()
        if existing:
            raise AppException(
                code="VALIDATION_ERROR",
                message=f"Subject with name '{payload.name}' already exists.",
                status_code=400,
            )
        subject = Subject(
            id=uuid.uuid4(),
            name=payload.name,
            description=payload.description,
            grade_level_min=payload.grade_level_min,
            grade_level_max=payload.grade_level_max,
            is_active=payload.is_active,
            language=payload.language.lower().strip(),
        )
        db.add(subject)
        db.commit()
        db.refresh(subject)
        return subject

    @staticmethod
    def update_subject(db: Session, subject_id: UUID, payload: SubjectUpdate, current_user: User) -> Subject:
        """Updates subject details."""
        subject = CurriculumService.get_subject_by_id(db, subject_id)
        if payload.name and payload.name != subject.name:
            existing = db.execute(select(Subject).where(Subject.name == payload.name)).scalar_one_or_none()
            if existing:
                raise AppException(
                    code="VALIDATION_ERROR",
                    message=f"Subject with name '{payload.name}' already exists.",
                    status_code=400,
                )
            subject.name = payload.name
        if payload.description is not None:
            subject.description = payload.description
        if payload.grade_level_min is not None:
            subject.grade_level_min = payload.grade_level_min
        if payload.grade_level_max is not None:
            subject.grade_level_max = payload.grade_level_max
        if payload.is_active is not None:
            subject.is_active = payload.is_active
        if payload.language is not None:
            subject.language = payload.language.lower().strip()

        db.commit()
        db.refresh(subject)
        return subject

    @staticmethod
    def build_subject_detail_response(
        db: Session,
        subject: Subject,
        current_user: Optional[User] = None,
    ) -> SubjectDetailResponse:
        """Constructs detailed subject response including child topics."""
        topic_items = CurriculumService.list_topics_by_subject(db, subject.id, current_user)
        avg_progress = (
            round(sum(t.progress for t in topic_items) / len(topic_items), 2)
            if topic_items
            else 0.0
        )
        return SubjectDetailResponse(
            id=str(subject.id),
            name=subject.name,
            description=subject.description,
            grade_level_min=subject.grade_level_min,
            grade_level_max=subject.grade_level_max,
            is_active=subject.is_active,
            language=subject.language,
            progress=avg_progress,
            created_at=subject.created_at,
            topics=topic_items,
        )

    # ==========================================================================
    # Topic Operations
    # ==========================================================================

    @staticmethod
    def list_topics_by_subject(
        db: Session,
        subject_id: UUID,
        current_user: Optional[User] = None,
    ) -> List[TopicItemResponse]:
        """Lists all topics belonging to a subject, with prerequisite lock tracking."""
        # Ensure subject exists
        CurriculumService.get_subject_by_id(db, subject_id)

        stmt = select(Topic).where(Topic.subject_id == subject_id)
        is_privileged = current_user and current_user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]
        if not is_privileged:
            stmt = stmt.where(Topic.is_active.is_(True))

        topics = db.execute(stmt.order_by(Topic.order_index.asc(), Topic.name.asc())).scalars().all()

        # Build student mastery map if learner
        mastery_map: Dict[UUID, float] = {}
        student_id: Optional[UUID] = None
        if current_user and current_user.student:
            student_id = current_user.student.id
            stm_records = db.execute(
                select(StudentTopicMastery).where(StudentTopicMastery.student_id == student_id)
            ).scalars().all()
            mastery_map = {r.topic_id: r.mastery_score for r in stm_records}

        result = []
        for topic in topics:
            mastery = mastery_map.get(topic.id, 0.0)
            progress = mastery
            is_completed = mastery >= MASTERY_COMPLETION_THRESHOLD

            # Topic is locked if it has a prerequisite that is NOT completed by the student
            is_locked = False
            if not is_privileged and topic.prerequisite_topic_id:
                prereq_mastery = mastery_map.get(topic.prerequisite_topic_id, 0.0)
                is_locked = prereq_mastery < MASTERY_COMPLETION_THRESHOLD

            result.append(
                TopicItemResponse(
                    id=str(topic.id),
                    subject_id=str(topic.subject_id),
                    name=topic.name,
                    description=topic.description,
                    progress=round(progress, 2),
                    mastery=round(mastery, 2),
                    difficulty=topic.difficulty,
                    order_index=topic.order_index,
                    grade_level=topic.grade_level,
                    is_active=topic.is_active,
                    prerequisite_topic_id=str(topic.prerequisite_topic_id) if topic.prerequisite_topic_id else None,
                    is_locked=is_locked,
                    is_completed=is_completed,
                )
            )
        return result

    @staticmethod
    def get_topic_by_id(db: Session, topic_id: UUID) -> Topic:
        """Retrieves a single topic by UUID."""
        topic = db.execute(
            select(Topic)
            .options(
                selectinload(Topic.lessons),
                selectinload(Topic.prerequisite),
            )
            .where(Topic.id == topic_id)
        ).scalar_one_or_none()
        if not topic:
            raise AppException(
                code="NOT_FOUND",
                message="Topic not found.",
                status_code=404,
            )
        return topic

    @staticmethod
    def create_topic(db: Session, payload: TopicCreate, current_user: User) -> Topic:
        """Creates a new topic associated with a subject."""
        # Ensure parent subject exists
        CurriculumService.get_subject_by_id(db, payload.subject_id)

        # Validate prerequisite topic if supplied
        if payload.prerequisite_topic_id:
            CurriculumService.get_topic_by_id(db, payload.prerequisite_topic_id)

        topic = Topic(
            id=uuid.uuid4(),
            subject_id=payload.subject_id,
            name=payload.name,
            description=payload.description,
            difficulty=payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty),
            order_index=payload.order_index,
            grade_level=payload.grade_level,
            is_active=payload.is_active,
            prerequisite_topic_id=payload.prerequisite_topic_id,
        )
        db.add(topic)
        db.commit()
        db.refresh(topic)
        return topic

    @staticmethod
    def update_topic(db: Session, topic_id: UUID, payload: TopicUpdate, current_user: User) -> Topic:
        """Updates topic details."""
        topic = CurriculumService.get_topic_by_id(db, topic_id)
        if payload.name is not None:
            topic.name = payload.name
        if payload.description is not None:
            topic.description = payload.description
        if payload.difficulty is not None:
            topic.difficulty = payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty)
        if payload.order_index is not None:
            topic.order_index = payload.order_index
        if payload.grade_level is not None:
            topic.grade_level = payload.grade_level
        if payload.is_active is not None:
            topic.is_active = payload.is_active
        if payload.prerequisite_topic_id is not None:
            if payload.prerequisite_topic_id == topic.id:
                raise AppException(
                    code="VALIDATION_ERROR",
                    message="A topic cannot be its own prerequisite.",
                    status_code=400,
                )
            CurriculumService.get_topic_by_id(db, payload.prerequisite_topic_id)
            topic.prerequisite_topic_id = payload.prerequisite_topic_id

        db.commit()
        db.refresh(topic)
        return topic

    @staticmethod
    def build_topic_detail_response(
        db: Session,
        topic: Topic,
        current_user: Optional[User] = None,
    ) -> TopicDetailResponse:
        """Constructs detailed topic response including child lessons and prerequisite lock status."""
        lesson_items = CurriculumService.list_lessons_by_topic(db, topic.id, current_user)

        mastery = 0.0
        is_completed = False
        is_locked = False
        is_privileged = current_user and current_user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]

        if current_user and current_user.student:
            stm = db.execute(
                select(StudentTopicMastery).where(
                    StudentTopicMastery.student_id == current_user.student.id,
                    StudentTopicMastery.topic_id == topic.id,
                )
            ).scalar_one_or_none()
            if stm:
                mastery = stm.mastery_score
                is_completed = mastery >= MASTERY_COMPLETION_THRESHOLD

            if not is_privileged and topic.prerequisite_topic_id:
                prereq_stm = db.execute(
                    select(StudentTopicMastery).where(
                        StudentTopicMastery.student_id == current_user.student.id,
                        StudentTopicMastery.topic_id == topic.prerequisite_topic_id,
                    )
                ).scalar_one_or_none()
                prereq_mastery = prereq_stm.mastery_score if prereq_stm else 0.0
                is_locked = prereq_mastery < MASTERY_COMPLETION_THRESHOLD

        return TopicDetailResponse(
            id=str(topic.id),
            subject_id=str(topic.subject_id),
            name=topic.name,
            description=topic.description,
            difficulty=topic.difficulty,
            order_index=topic.order_index,
            grade_level=topic.grade_level,
            is_active=topic.is_active,
            prerequisite_topic_id=str(topic.prerequisite_topic_id) if topic.prerequisite_topic_id else None,
            is_locked=is_locked,
            is_completed=is_completed,
            progress=round(mastery, 2),
            mastery=round(mastery, 2),
            created_at=topic.created_at,
            lessons=lesson_items,
        )

    # ==========================================================================
    # Lesson Operations
    # ==========================================================================

    @staticmethod
    def list_lessons_by_topic(
        db: Session,
        topic_id: UUID,
        current_user: Optional[User] = None,
    ) -> List[LessonItemResponse]:
        """Lists all lessons belonging to a topic.
        
        Progression Guard:
        If caller is a student and the topic is locked by an unfulfilled prerequisite,
        access is barred with 403 Forbidden.
        """
        topic = CurriculumService.get_topic_by_id(db, topic_id)
        is_privileged = current_user and current_user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]

        # Enforce prerequisite locking for learners
        if not is_privileged and current_user and current_user.student and topic.prerequisite_topic_id:
            prereq_stm = db.execute(
                select(StudentTopicMastery).where(
                    StudentTopicMastery.student_id == current_user.student.id,
                    StudentTopicMastery.topic_id == topic.prerequisite_topic_id,
                )
            ).scalar_one_or_none()
            if not prereq_stm or prereq_stm.mastery_score < MASTERY_COMPLETION_THRESHOLD:
                raise AppException(
                    code="FORBIDDEN",
                    message="This topic is locked until prerequisite topics are completed.",
                    status_code=403,
                )

        stmt = select(Lesson).where(Lesson.topic_id == topic_id).order_by(Lesson.title.asc())

        # Learners only see published lessons
        if not is_privileged:
            stmt = stmt.where(Lesson.is_published.is_(True))

        lessons = db.execute(stmt).scalars().all()
        return [CurriculumService.serialize_lesson_item(lesson) for lesson in lessons]

    @staticmethod
    def get_lesson_by_id(
        db: Session,
        lesson_id: UUID,
        current_user: Optional[User] = None,
    ) -> Lesson:
        """Retrieves a single lesson by UUID.
        
        Authorization Rule:
        Students and unauthenticated users are strictly barred from viewing unpublished lessons (403 Forbidden).
        """
        lesson = db.execute(
            select(Lesson)
            .options(
                selectinload(Lesson.learning_objectives),
                selectinload(Lesson.resources),
            )
            .where(Lesson.id == lesson_id)
        ).scalar_one_or_none()

        if not lesson:
            raise AppException(
                code="NOT_FOUND",
                message="Lesson not found.",
                status_code=404,
            )

        is_privileged = current_user and current_user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]
        if not lesson.is_published and not is_privileged:
            raise AppException(
                code="FORBIDDEN",
                message="This lesson is not yet published.",
                status_code=403,
            )

        return lesson

    @staticmethod
    def _get_or_create_teacher(db: Session, user: User) -> Optional[Teacher]:
        """Retrieves or provisions the Teacher profile for teacher user accounts."""
        if user.teacher:
            return user.teacher
        if user.role == UserRole.TEACHER.value:
            teacher = db.execute(select(Teacher).where(Teacher.user_id == user.id)).scalar_one_or_none()
            if not teacher:
                teacher = Teacher(id=uuid.uuid4(), user_id=user.id)
                db.add(teacher)
                db.flush()
            return teacher
        return None

    @staticmethod
    def create_lesson(db: Session, payload: LessonCreate, current_user: User) -> Lesson:
        """Creates a new lesson under a topic. Teacher ownership is assigned."""
        # Ensure topic exists
        CurriculumService.get_topic_by_id(db, payload.topic_id)

        teacher = CurriculumService._get_or_create_teacher(db, current_user)
        teacher_id = teacher.id if teacher else None

        acc_metadata = (
            payload.accessibility_metadata.model_dump()
            if payload.accessibility_metadata
            else {
                "has_audio": bool(payload.audio_url),
                "has_captions": bool(payload.caption_text),
                "has_simplified": bool(payload.simplified_content),
                "text_alternatives": True,
                "keyboard_accessible": True,
                "high_contrast_ready": True,
                "screen_reader_optimized": True,
                "reduced_motion_compatible": True,
                "supported_languages": [payload.language],
            }
        )

        lesson = Lesson(
            id=uuid.uuid4(),
            topic_id=payload.topic_id,
            title=payload.title,
            description=payload.description,
            difficulty=payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty),
            language=payload.language,
            estimated_minutes=payload.estimated_minutes,
            grade_level=payload.grade_level,
            standard_content=payload.standard_content,
            simplified_content=payload.simplified_content,
            audio_url=payload.audio_url,
            caption_text=payload.caption_text,
            is_published=payload.is_published,
            accessibility_metadata=acc_metadata,
            created_by_teacher_id=teacher_id,
            source_document_id=payload.source_document_id,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson

    @staticmethod
    def _verify_lesson_ownership(lesson: Lesson, current_user: User) -> None:
        """Verifies that the teacher owns the lesson or that the user is an admin."""
        if current_user.role == UserRole.ADMIN.value:
            return
        if not current_user.teacher or lesson.created_by_teacher_id != current_user.teacher.id:
            raise AppException(
                code="FORBIDDEN",
                message="You can only modify lessons you created.",
                status_code=403,
            )

    @staticmethod
    def update_lesson(
        db: Session,
        lesson_id: UUID,
        payload: LessonUpdate,
        current_user: User,
    ) -> Lesson:
        """Updates a lesson. Enforces teacher ownership."""
        lesson = CurriculumService.get_lesson_by_id(db, lesson_id, current_user)
        CurriculumService._verify_lesson_ownership(lesson, current_user)

        if payload.title is not None:
            lesson.title = payload.title
        if payload.description is not None:
            lesson.description = payload.description
        if payload.difficulty is not None:
            lesson.difficulty = payload.difficulty.value if hasattr(payload.difficulty, "value") else str(payload.difficulty)
        if payload.language is not None:
            lesson.language = payload.language
        if payload.estimated_minutes is not None:
            lesson.estimated_minutes = payload.estimated_minutes
        if payload.grade_level is not None:
            lesson.grade_level = payload.grade_level
        if payload.standard_content is not None:
            lesson.standard_content = payload.standard_content
        if payload.simplified_content is not None:
            lesson.simplified_content = payload.simplified_content
        if payload.audio_url is not None:
            lesson.audio_url = payload.audio_url
        if payload.caption_text is not None:
            lesson.caption_text = payload.caption_text
        if payload.is_published is not None:
            lesson.is_published = payload.is_published
        if payload.accessibility_metadata is not None:
            lesson.accessibility_metadata = payload.accessibility_metadata.model_dump()

        db.commit()
        db.refresh(lesson)
        return lesson

    @staticmethod
    def set_publish_status(
        db: Session,
        lesson_id: UUID,
        is_published: bool,
        current_user: User,
    ) -> Lesson:
        """Publishes or unpublishes a lesson. Enforces teacher ownership."""
        lesson = CurriculumService.get_lesson_by_id(db, lesson_id, current_user)
        CurriculumService._verify_lesson_ownership(lesson, current_user)

        lesson.is_published = is_published
        db.commit()
        db.refresh(lesson)
        return lesson

    @staticmethod
    def search_lessons(
        db: Session,
        subject_id: Optional[UUID] = None,
        topic_id: Optional[UUID] = None,
        grade: Optional[int] = None,
        language: Optional[str] = None,
        difficulty: Optional[str] = None,
        has_audio: Optional[bool] = None,
        has_simplified: Optional[bool] = None,
        q: Optional[str] = None,
        page: int = 1,
        size: int = 20,
        current_user: Optional[User] = None,
    ) -> LessonSearchResponse:
        """Searches lessons with multi-attribute filtering and pagination."""
        stmt = select(Lesson)

        if subject_id:
            stmt = stmt.join(Topic, Topic.id == Lesson.topic_id).where(Topic.subject_id == subject_id)

        if topic_id:
            stmt = stmt.where(Lesson.topic_id == topic_id)

        if grade is not None:
            stmt = stmt.where(Lesson.grade_level == grade)

        if language:
            stmt = stmt.where(Lesson.language == language.strip().lower())

        if difficulty:
            stmt = stmt.where(Lesson.difficulty == difficulty.strip().lower())

        if has_audio is True:
            stmt = stmt.where(Lesson.audio_url.isnot(None), Lesson.audio_url != "")
        elif has_audio is False:
            stmt = stmt.where(or_(Lesson.audio_url.is_(None), Lesson.audio_url == ""))

        if has_simplified is True:
            stmt = stmt.where(Lesson.simplified_content.isnot(None), Lesson.simplified_content != "")

        if q:
            pattern = f"%{q.strip()}%"
            stmt = stmt.where(or_(Lesson.title.ilike(pattern), Lesson.description.ilike(pattern)))

        # Enforce published filtering for students and unauthenticated users
        is_privileged = current_user and current_user.role in [UserRole.TEACHER.value, UserRole.ADMIN.value]
        if not is_privileged:
            stmt = stmt.where(Lesson.is_published.is_(True))

        # Count total matching records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar() or 0

        # Apply ordering and pagination
        offset = (max(page, 1) - 1) * max(size, 1)
        paginated_stmt = stmt.order_by(Lesson.title.asc()).offset(offset).limit(size)
        lessons = db.execute(paginated_stmt).scalars().all()

        items = [CurriculumService.serialize_lesson_item(l) for l in lessons]
        return LessonSearchResponse(
            total=total,
            page=page,
            size=size,
            lessons=items,
        )

    # ==========================================================================
    # Learning Objectives CRUD
    # ==========================================================================

    @staticmethod
    def add_objective(
        db: Session,
        lesson_id: UUID,
        payload: LearningObjectiveCreate,
        current_user: User,
    ) -> LearningObjective:
        """Adds a learning objective to a lesson. Enforces teacher ownership."""
        lesson = CurriculumService.get_lesson_by_id(db, lesson_id, current_user)
        CurriculumService._verify_lesson_ownership(lesson, current_user)

        obj = LearningObjective(
            id=uuid.uuid4(),
            lesson_id=lesson_id,
            description=payload.description,
            order_index=payload.order_index,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def list_objectives(db: Session, lesson_id: UUID) -> List[LearningObjective]:
        """Lists all learning objectives for a lesson."""
        return db.execute(
            select(LearningObjective)
            .where(LearningObjective.lesson_id == lesson_id)
            .order_by(LearningObjective.order_index.asc())
        ).scalars().all()

    @staticmethod
    def delete_objective(
        db: Session,
        lesson_id: UUID,
        objective_id: UUID,
        current_user: User,
    ) -> None:
        """Deletes a learning objective. Enforces teacher ownership."""
        lesson = CurriculumService.get_lesson_by_id(db, lesson_id, current_user)
        CurriculumService._verify_lesson_ownership(lesson, current_user)

        obj = db.execute(
            select(LearningObjective).where(
                LearningObjective.id == objective_id,
                LearningObjective.lesson_id == lesson_id,
            )
        ).scalar_one_or_none()
        if not obj:
            raise AppException(
                code="NOT_FOUND",
                message="Learning objective not found.",
                status_code=404,
            )
        db.delete(obj)
        db.commit()

    # ==========================================================================
    # Lesson Resources CRUD
    # ==========================================================================

    @staticmethod
    def add_resource(
        db: Session,
        lesson_id: UUID,
        payload: LessonResourceCreate,
        current_user: User,
    ) -> LessonResource:
        """Attaches resource metadata to a lesson. Enforces teacher ownership."""
        lesson = CurriculumService.get_lesson_by_id(db, lesson_id, current_user)
        CurriculumService._verify_lesson_ownership(lesson, current_user)

        resource = LessonResource(
            id=uuid.uuid4(),
            lesson_id=lesson_id,
            title=payload.title,
            resource_type=payload.resource_type,
            url=payload.url,
            file_size_bytes=payload.file_size_bytes,
            format=payload.format,
            accessibility_description=payload.accessibility_description,
        )
        db.add(resource)
        db.commit()
        db.refresh(resource)
        return resource

    @staticmethod
    def list_resources(db: Session, lesson_id: UUID) -> List[LessonResource]:
        """Lists metadata for all resources attached to a lesson."""
        return db.execute(
            select(LessonResource)
            .where(LessonResource.lesson_id == lesson_id)
            .order_by(LessonResource.title.asc())
        ).scalars().all()

    @staticmethod
    def delete_resource(
        db: Session,
        lesson_id: UUID,
        resource_id: UUID,
        current_user: User,
    ) -> None:
        """Deletes attached resource metadata. Enforces teacher ownership."""
        lesson = CurriculumService.get_lesson_by_id(db, lesson_id, current_user)
        CurriculumService._verify_lesson_ownership(lesson, current_user)

        resource = db.execute(
            select(LessonResource).where(
                LessonResource.id == resource_id,
                LessonResource.lesson_id == lesson_id,
            )
        ).scalar_one_or_none()
        if not resource:
            raise AppException(
                code="NOT_FOUND",
                message="Lesson resource not found.",
                status_code=404,
            )
        db.delete(resource)
        db.commit()

    # ==========================================================================
    # Student-Specific Curriculum Progression
    # ==========================================================================

    @staticmethod
    def get_student_curriculum(db: Session, student_id: UUID) -> StudentCurriculumResponse:
        """Generates a personalized, disability-friendly curriculum representation for a student."""
        student = db.execute(
            select(Student)
            .options(joinedload(Student.accessibility_profile))
            .where(Student.id == student_id)
        ).scalar_one_or_none()

        if not student:
            raise AppException(
                code="NOT_FOUND",
                message="Student not found.",
                status_code=404,
            )

        # Accessibility profile summary
        acc = student.accessibility_profile
        accessibility_summary = {
            "text_enabled": acc.text_enabled if acc else True,
            "audio_enabled": acc.audio_enabled if acc else False,
            "captions_enabled": acc.captions_enabled if acc else False,
            "simplified_content": acc.simplified_content if acc else False,
            "large_text": acc.large_text if acc else False,
            "high_contrast": acc.high_contrast if acc else False,
            "reduced_motion": acc.reduced_motion if acc else False,
            "keyboard_navigation": acc.keyboard_navigation if acc else True,
        }

        # Query all student's topic masteries
        masteries = db.execute(
            select(StudentTopicMastery).where(StudentTopicMastery.student_id == student_id)
        ).scalars().all()
        mastery_map = {m.topic_id: m.mastery_score for m in masteries}

        # Query active subjects suitable for student's grade and preferred language
        stmt = (
            select(Subject)
            .options(selectinload(Subject.topics).selectinload(Topic.lessons))
            .where(
                Subject.is_active.is_(True),
                Subject.grade_level_min <= student.grade,
                Subject.grade_level_max >= student.grade,
            )
        )
        if student.preferred_language:
            stmt = stmt.where(Subject.language == student.preferred_language.strip().lower())

        subjects = db.execute(stmt.order_by(Subject.name.asc())).scalars().all()

        subject_statuses = []
        total_topics = 0
        completed_topics = 0
        all_masteries = []

        for subject in subjects:
            topic_statuses = []
            for topic in subject.topics:
                if not topic.is_active:
                    continue
                total_topics += 1
                topic_mastery = mastery_map.get(topic.id, 0.0)
                all_masteries.append(topic_mastery)
                is_comp = topic_mastery >= MASTERY_COMPLETION_THRESHOLD
                if is_comp:
                    completed_topics += 1

                # Prerequisite check
                is_lock = False
                if topic.prerequisite_topic_id:
                    prereq_score = mastery_map.get(topic.prerequisite_topic_id, 0.0)
                    is_lock = prereq_score < MASTERY_COMPLETION_THRESHOLD

                # Published lessons count
                pub_lessons_count = sum(1 for l in topic.lessons if l.is_published)

                topic_statuses.append(
                    StudentTopicStatus(
                        id=str(topic.id),
                        subject_id=str(topic.subject_id),
                        name=topic.name,
                        description=topic.description,
                        order_index=topic.order_index,
                        difficulty=topic.difficulty,
                        grade_level=topic.grade_level,
                        mastery=round(topic_mastery, 2),
                        progress=round(topic_mastery, 2),
                        is_completed=is_comp,
                        is_locked=is_lock,
                        prerequisite_topic_id=str(topic.prerequisite_topic_id) if topic.prerequisite_topic_id else None,
                        lesson_count=pub_lessons_count,
                    )
                )

            sub_prog = (
                round(sum(t.progress for t in topic_statuses) / len(topic_statuses), 2)
                if topic_statuses
                else 0.0
            )
            subject_statuses.append(
                StudentSubjectStatus(
                    id=str(subject.id),
                    name=subject.name,
                    description=subject.description,
                    progress=sub_prog,
                    topics=topic_statuses,
                )
            )

        overall_prog = (
            round(sum(all_masteries) / len(all_masteries), 2)
            if all_masteries
            else 0.0
        )

        return StudentCurriculumResponse(
            student_id=str(student.id),
            grade=student.grade,
            preferred_language=student.preferred_language,
            accessibility_summary=accessibility_summary,
            overall_progress=overall_prog,
            completed_topics_count=completed_topics,
            total_topics_count=total_topics,
            subjects=subject_statuses,
        )

    @staticmethod
    def get_student_curriculum_next(db: Session, student_id: UUID) -> StudentCurriculumNextResponse:
        """Determines the next unlocked topic and recommended lesson in the student's curriculum."""
        curr = CurriculumService.get_student_curriculum(db, student_id)

        candidate_with_lessons = None
        candidate_without_lessons = None

        # Prefer an unlocked, uncompleted topic that already has published lessons ready for the student
        for sub in curr.subjects:
            for top in sub.topics:
                if not top.is_completed and not top.is_locked:
                    lessons = db.execute(
                        select(Lesson)
                        .where(
                            Lesson.topic_id == UUID(top.id),
                            Lesson.is_published.is_(True),
                        )
                        .order_by(Lesson.title.asc())
                    ).scalars().all()

                    if lessons and not candidate_with_lessons:
                        candidate_with_lessons = (sub, top, lessons)
                        break
                    elif not candidate_without_lessons:
                        candidate_without_lessons = (sub, top, [])
            if candidate_with_lessons:
                break

        chosen = candidate_with_lessons or candidate_without_lessons
        if chosen:
            sub, top, lessons = chosen
            next_lesson_rec = None
            if lessons:
                # Prioritize lesson matching student's accessibility preferences
                student_acc = curr.accessibility_summary
                selected_lesson = lessons[0]
                if student_acc.get("audio_enabled"):
                    audio_lesson = next((l for l in lessons if l.audio_url), None)
                    if audio_lesson:
                        selected_lesson = audio_lesson

                tags = ["accessible"]
                if selected_lesson.audio_url:
                    tags.append("audio_narration")
                if selected_lesson.caption_text:
                    tags.append("captions")
                if selected_lesson.simplified_content:
                    tags.append("simplified_text")

                next_lesson_rec = NextLessonRecommendation(
                    id=str(selected_lesson.id),
                    topic_id=str(selected_lesson.topic_id),
                    title=selected_lesson.title,
                    difficulty=selected_lesson.difficulty,
                    language=selected_lesson.language,
                    estimated_minutes=selected_lesson.estimated_minutes,
                    grade_level=selected_lesson.grade_level,
                    is_published=selected_lesson.is_published,
                    has_audio=bool(selected_lesson.audio_url),
                    has_simplified=bool(selected_lesson.simplified_content),
                    accessibility_tags=tags,
                )

            reason = (
                f"Foundational topic '{top.name}' in {sub.name} is ready to explore."
                if not top.prerequisite_topic_id
                else f"Prerequisite topic completed. Ready to progress to '{top.name}'."
            )

            return StudentCurriculumNextResponse(
                student_id=str(student_id),
                subject={"id": sub.id, "name": sub.name},
                topic=top,
                next_lesson=next_lesson_rec,
                recommendation_reason=reason,
            )

        # All topics completed or none available
        return StudentCurriculumNextResponse(
            student_id=str(student_id),
            subject=None,
            topic=None,
            next_lesson=None,
            recommendation_reason="All current curriculum topics are completed! Great job!",
        )

    # ==========================================================================
    # Serialization Helpers
    # ==========================================================================

    @staticmethod
    def serialize_lesson_item(lesson: Lesson) -> LessonItemResponse:
        """Serializes lesson for list/search responses."""
        return LessonItemResponse(
            id=str(lesson.id),
            topic_id=str(lesson.topic_id),
            title=lesson.title,
            description=lesson.description,
            difficulty=lesson.difficulty,
            language=lesson.language,
            estimated_minutes=lesson.estimated_minutes,
            grade_level=lesson.grade_level,
            is_published=lesson.is_published,
            has_audio=bool(lesson.audio_url),
            has_simplified=bool(lesson.simplified_content),
        )

    @staticmethod
    def build_lesson_detail_response(lesson: Lesson) -> LessonDetailResponse:
        """Serializes complete lesson with objectives and resources for detail response."""
        content = LessonContent(
            standard=lesson.standard_content,
            simplified=lesson.simplified_content,
            audio_url=lesson.audio_url,
            caption_text=lesson.caption_text,
        )

        acc_data = lesson.accessibility_metadata or {}
        accessibility = LessonAccessibilityMetadata(
            has_audio=acc_data.get("has_audio", bool(lesson.audio_url)),
            has_captions=acc_data.get("has_captions", bool(lesson.caption_text)),
            has_simplified=acc_data.get("has_simplified", bool(lesson.simplified_content)),
            text_alternatives=acc_data.get("text_alternatives", True),
            keyboard_accessible=acc_data.get("keyboard_accessible", True),
            high_contrast_ready=acc_data.get("high_contrast_ready", True),
            screen_reader_optimized=acc_data.get("screen_reader_optimized", True),
            reduced_motion_compatible=acc_data.get("reduced_motion_compatible", True),
            supported_languages=acc_data.get("supported_languages", [lesson.language]),
        )

        objectives = [
            LearningObjectiveRead(
                id=o.id,
                lesson_id=o.lesson_id,
                description=o.description,
                order_index=o.order_index,
                created_at=o.created_at,
            )
            for o in (lesson.learning_objectives or [])
        ]

        resources = [
            LessonResourceRead(
                id=r.id,
                lesson_id=r.lesson_id,
                title=r.title,
                resource_type=r.resource_type,
                url=r.url,
                file_size_bytes=r.file_size_bytes,
                format=r.format,
                accessibility_description=r.accessibility_description,
                created_at=r.created_at,
            )
            for r in (lesson.resources or [])
        ]

        return LessonDetailResponse(
            id=str(lesson.id),
            topic_id=str(lesson.topic_id),
            title=lesson.title,
            description=lesson.description,
            difficulty=lesson.difficulty,
            language=lesson.language,
            estimated_minutes=lesson.estimated_minutes,
            grade_level=lesson.grade_level,
            is_published=lesson.is_published,
            content=content,
            accessibility=accessibility,
            objectives=objectives,
            resources=resources,
            created_by_teacher_id=str(lesson.created_by_teacher_id) if lesson.created_by_teacher_id else None,
        )

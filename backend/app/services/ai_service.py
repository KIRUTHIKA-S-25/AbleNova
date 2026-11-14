"""Adaptive and Accessible AI Learning Engine.
Integrates student accessibility profiles, curriculum context, RAG semantic retrieval,
and child-safe generative AI models.
"""
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.db.models.curriculum import Lesson
from app.db.models.student import Student
from app.services.ai_provider import BaseAIProvider, get_ai_provider
from app.services.rag_service import rag_service

logger = logging.getLogger("ablenova.ai.service")


class AIService:
    """Orchestrates accessible, curriculum-aligned, personalized AI learning experiences."""

    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self._provider = provider
        # In-memory source attribution cache keyed by request_id
        self._attribution_cache: Dict[str, Dict[str, Any]] = {}

    @property
    def provider(self) -> BaseAIProvider:
        if self._provider is None:
            self._provider = get_ai_provider()
        return self._provider

    def set_provider(self, provider: BaseAIProvider) -> None:
        """Allow setting or overriding provider for test isolation."""
        self._provider = provider

    def _resolve_student_profile(
        self,
        db: Session,
        student_id: Optional[UUID],
    ) -> Dict[str, Any]:
        """Extract grade, language, and accessibility preferences for student personalization."""
        if not student_id:
            return {
                "grade": 5,
                "age": 10,
                "preferred_language": "en",
                "accessibility": {},
            }

        student = db.execute(select(Student).where(Student.id == student_id)).scalar_one_or_none()
        if not student:
            return {
                "grade": 5,
                "age": 10,
                "preferred_language": "en",
                "accessibility": {},
            }

        accessibility_dict = {}
        if student.accessibility_profile:
            ap = student.accessibility_profile
            accessibility_dict = {
                "text_enabled": ap.text_enabled,
                "audio_enabled": ap.audio_enabled,
                "captions_enabled": ap.captions_enabled,
                "simplified_content": ap.simplified_content,
                "large_text": ap.large_text,
                "high_contrast": ap.high_contrast,
                "reduced_motion": ap.reduced_motion,
                "keyboard_navigation": ap.keyboard_navigation,
            }

        return {
            "grade": student.grade,
            "age": student.age,
            "preferred_language": student.preferred_language,
            "accessibility": accessibility_dict,
        }

    async def generate_explanation(
        self,
        question: str,
        lesson_id: str,
        mode: str = "simplified",
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Generate safe, curriculum-aligned, personalized educational explanation (API_CONTRACT.md Sec 13)."""
        request_id = str(uuid.uuid4())
        student_profile = {"grade": 5, "preferred_language": "en", "accessibility": {}}
        subject_id = None
        topic_id = None
        lesson_obj = None

        if db:
            student_profile = self._resolve_student_profile(db, student_id)
            # Adapt mode if student accessibility profile specifies simplified_content
            if student_profile.get("accessibility", {}).get("simplified_content") and mode == "standard":
                mode = "simplified"

            # Resolve lesson context if valid UUID or string
            try:
                lesson_uuid = UUID(lesson_id)
                lesson_obj = db.execute(select(Lesson).where(Lesson.id == lesson_uuid)).scalar_one_or_none()
                if lesson_obj:
                    topic_id = lesson_obj.topic_id
                    if lesson_obj.topic:
                        subject_id = lesson_obj.topic.subject_id
            except (ValueError, TypeError):
                # Lesson ID might be a demo string e.g. 'lesson_001'
                pass

        # 1. Retrieve relevant curriculum chunks via RAG
        context_chunks = rag_service.query_similar_chunks(
            query=question,
            subject_id=str(subject_id) if subject_id else None,
            topic_id=str(topic_id) if topic_id else None,
            grade=student_profile.get("grade"),
            language=student_profile.get("preferred_language"),
            limit=4,
        )

        # 2. Call AI Provider with strict boundary segregation
        ai_result = await self.provider.generate_explanation(
            prompt=question,
            context_chunks=context_chunks,
            mode=mode,
            student_profile=student_profile,
        )

        source_ids = ai_result.get("source_ids", [])
        if not source_ids and context_chunks:
            source_ids = [c["chunk_id"] for c in context_chunks]

        # 3. Store source attribution details in cache for /ai/sources/{request_id}
        source_items = []
        for c in context_chunks:
            source_items.append({
                "chunk_id": str(c.get("chunk_id") or c.get("id")),
                "document_id": str(c.get("document_id", "")),
                "document_title": c.get("metadata", {}).get("file_name") or f"Curriculum Lesson {lesson_id}",
                "page_number": c.get("page_number", 1),
                "snippet": (c.get("content", "")[:200] + "...") if len(c.get("content", "")) > 200 else c.get("content", ""),
                "relevance_score": c.get("similarity_score", 0.85),
            })

        self._attribution_cache[request_id] = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sources": source_items,
            "retrieval_strategy": "chromadb_semantic_vector",
        }

        return {
            "request_id": request_id,
            "response": ai_result.get("response", "Educational explanation ready."),
            "source_ids": [str(s) for s in source_ids],
            "mode": mode,
            "suggested_followups": ai_result.get("suggested_followups", []),
        }

    async def ask_question(
        self,
        question: str,
        subject_id: Optional[UUID] = None,
        topic_id: Optional[UUID] = None,
        lesson_id: Optional[UUID] = None,
        mode: str = "standard",
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Broader curriculum Q&A across subjects or topics."""
        request_id = str(uuid.uuid4())
        student_profile = {"grade": 5, "preferred_language": "en", "accessibility": {}}
        if db:
            student_profile = self._resolve_student_profile(db, student_id)
            if student_profile.get("accessibility", {}).get("simplified_content") and mode == "standard":
                mode = "simplified"

        context_chunks = rag_service.query_similar_chunks(
            query=question,
            subject_id=str(subject_id) if subject_id else None,
            topic_id=str(topic_id) if topic_id else None,
            grade=student_profile.get("grade"),
            language=student_profile.get("preferred_language"),
            limit=4,
        )

        ai_result = await self.provider.generate_explanation(
            prompt=question,
            context_chunks=context_chunks,
            mode=mode,
            student_profile=student_profile,
        )

        source_ids = [c["chunk_id"] for c in context_chunks]
        source_items = []
        for c in context_chunks:
            source_items.append({
                "chunk_id": str(c.get("chunk_id") or c.get("id")),
                "document_id": str(c.get("document_id", "")),
                "document_title": c.get("metadata", {}).get("file_name") or "Curriculum Material",
                "page_number": c.get("page_number", 1),
                "snippet": (c.get("content", "")[:200] + "...") if len(c.get("content", "")) > 200 else c.get("content", ""),
                "relevance_score": c.get("similarity_score", 0.85),
            })

        self._attribution_cache[request_id] = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sources": source_items,
            "retrieval_strategy": "chromadb_semantic_vector",
        }

        return {
            "request_id": request_id,
            "response": ai_result.get("response", ""),
            "source_ids": [str(s) for s in source_ids],
            "mode": mode,
            "sources": source_items,
        }

    async def simplify_content(
        self,
        text: str,
        target_grade: Optional[int] = None,
        style: str = "plain_language",
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Simplify curriculum text for students requiring accessible reading levels."""
        if not target_grade and db and student_id:
            profile = self._resolve_student_profile(db, student_id)
            target_grade = profile.get("grade", 4)
        return await self.provider.simplify_text(text=text, target_grade=target_grade, style=style)

    async def translate_content(
        self,
        text: str,
        target_language: str,
        source_language: str = "auto",
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Translate curriculum text to the student's preferred language."""
        if not target_language and db and student_id:
            profile = self._resolve_student_profile(db, student_id)
            target_language = profile.get("preferred_language", "es")
        return await self.provider.translate_text(
            text=text, target_language=target_language, source_language=source_language
        )

    async def summarize_content(
        self,
        text: str,
        bullet_count: int = 3,
        max_words: int = 150,
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Summarize lengthy educational material into bite-sized key takeaways."""
        return await self.provider.summarize_text(text=text, bullet_count=bullet_count, max_words=max_words)

    async def generate_hints(
        self,
        question: str,
        lesson_id: Optional[str] = None,
        hint_level: int = 1,
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Generate scaffolded clues without spoiling the solution."""
        lesson_context = None
        if db and lesson_id:
            try:
                l_uuid = UUID(lesson_id)
                lesson = db.execute(select(Lesson).where(Lesson.id == l_uuid)).scalar_one_or_none()
                if lesson:
                    lesson_context = f"{lesson.title}: {lesson.description or ''}"
            except (ValueError, TypeError):
                pass
        return await self.provider.generate_hints(
            question=question, lesson_context=lesson_context, hint_level=hint_level
        )

    async def generate_visual_description(
        self,
        diagram_type: str = "diagram",
        context_text: Optional[str] = None,
        image_url: Optional[str] = None,
        student_id: Optional[UUID] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Convert graphics, charts, and illustrations into screen-reader descriptions."""
        return await self.provider.generate_visual_description(
            diagram_type=diagram_type, context_text=context_text, image_url=image_url
        )

    def get_source_attribution(self, request_id: str) -> Dict[str, Any]:
        """Retrieve source citations and chunk attribution for a previous AI request."""
        attribution = self._attribution_cache.get(request_id)
        if not attribution:
            raise AppException(
                code="NOT_FOUND",
                message=f"No attribution found for request ID {request_id}",
                status_code=404,
            )
        return attribution


ai_service = AIService()

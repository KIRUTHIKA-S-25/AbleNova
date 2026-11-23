"""Pydantic schemas for AI Learning Engine and RAG endpoints.
Adheres to docs/API_CONTRACT.md Sections 13, 14, and 20.
"""
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import Field
from app.schemas.common import BaseSchema


class AIExplanationMode(str):
    STANDARD = "standard"
    SIMPLIFIED = "simplified"
    HINT = "hint"
    EXAMPLE = "example"
    SUMMARY = "summary"
    ANALOGY = "analogy"
    VOCABULARY = "vocabulary"
    VISUAL_DESCRIPTION = "visual_description"
    STEP_BY_STEP = "step_by_step"


# ==============================================================================
# 1. AI Explanation (API_CONTRACT.md Section 13)
# ==============================================================================

class AIExplanationRequest(BaseSchema):
    """Student question request adhering to API_CONTRACT.md Section 13."""
    lesson_id: str = Field(..., description="Lesson identifier or UUID string")
    question: str = Field(..., min_length=1, max_length=1000, description="Student question")
    mode: str = Field(
        default="simplified",
        description="standard, simplified, hint, example, summary, analogy, vocabulary, visual_description, step_by_step"
    )
    student_id: Optional[UUID] = Field(None, description="Optional target student ID for personalization")


class AIExplanationResponse(BaseSchema):
    """AI answer response adhering to API_CONTRACT.md Section 13."""
    request_id: str = Field(..., description="Unique tracking identifier for attribution lookup")
    response: str = Field(..., description="Personalized educational explanation")
    source_ids: List[str] = Field(default_factory=list, description="IDs of source chunks used for attribution")
    mode: str = Field(default="simplified", description="Explanation mode applied")
    suggested_followups: Optional[List[str]] = Field(default_factory=list, description="Child-friendly follow-up questions")


# ==============================================================================
# 2. General AI Ask / QA
# ==============================================================================

class AIAskRequest(BaseSchema):
    """Broad curriculum Q&A request across subjects or topics."""
    question: str = Field(..., min_length=1, max_length=1000, description="Student question")
    subject_id: Optional[UUID] = Field(None, description="Optional subject scope")
    topic_id: Optional[UUID] = Field(None, description="Optional topic scope")
    lesson_id: Optional[UUID] = Field(None, description="Optional lesson scope")
    mode: str = Field(default="standard", description="standard, simplified, hint, example, summary")
    student_id: Optional[UUID] = Field(None, description="Optional target student ID")


class AIAskResponse(BaseSchema):
    """Response for curriculum Q&A."""
    request_id: str
    response: str
    source_ids: List[str] = Field(default_factory=list)
    mode: str = "standard"
    sources: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


# ==============================================================================
# 3. Content Simplification
# ==============================================================================

class AISimplifyRequest(BaseSchema):
    """Request to rewrite educational text in plain, accessible language."""
    text: str = Field(..., min_length=1, max_length=5000, description="Original complex educational text")
    target_grade: Optional[int] = Field(None, ge=1, le=12, description="Target reading grade level")
    style: Optional[str] = Field(default="plain_language", description="plain_language, bullet_points, visual_cues")
    student_id: Optional[UUID] = Field(None, description="Optional student ID for accessibility profile lookup")


class AISimplifyResponse(BaseSchema):
    """Simplified educational text."""
    simplified_text: str
    target_grade: Optional[int] = None
    key_points: List[str] = Field(default_factory=list)
    vocabulary_glossary: Optional[Dict[str, str]] = Field(default_factory=dict)


# ==============================================================================
# 4. Content Translation
# ==============================================================================

class AITranslateRequest(BaseSchema):
    """Request to translate educational content while maintaining pedagogical tone."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    target_language: str = Field(..., min_length=2, max_length=10, description="Target ISO language code (e.g., es, ta, hi, fr)")
    source_language: Optional[str] = Field(default="auto", description="Source language code or 'auto'")
    student_id: Optional[UUID] = Field(None, description="Optional student ID")


class AITranslateResponse(BaseSchema):
    """Translated educational content."""
    translated_text: str
    target_language: str
    source_language: str


# ==============================================================================
# 5. Content Summarization
# ==============================================================================

class AISummarizeRequest(BaseSchema):
    """Request to summarize long-form educational text into bite-sized takeaways."""
    text: str = Field(..., min_length=1, max_length=10000, description="Text to summarize")
    bullet_count: Optional[int] = Field(default=3, ge=1, le=10, description="Number of bullet points")
    max_words: Optional[int] = Field(default=150, ge=20, le=500, description="Maximum word limit")
    student_id: Optional[UUID] = Field(None, description="Optional student ID")


class AISummarizeResponse(BaseSchema):
    """Summarized educational content."""
    summary: str
    bullets: List[str] = Field(default_factory=list)
    word_count: int


# ==============================================================================
# 6. Scaffolding Hints
# ==============================================================================

class AIHintsRequest(BaseSchema):
    """Request for progressive scaffolding hints."""
    question: str = Field(..., min_length=1, max_length=1000, description="Problem or question being solved")
    lesson_id: Optional[str] = Field(None, description="Lesson identifier")
    hint_level: int = Field(default=1, ge=1, le=5, description="Hint stage (1=nudge, 2=guiding clue, 3=partial step)")
    student_id: Optional[UUID] = Field(None, description="Optional student ID")


class AIHintsResponse(BaseSchema):
    """Incremental scaffolding hint."""
    hint: str
    hint_level: int
    has_more_hints: bool
    encouragement: str = "You can do it! Try applying this step."


# ==============================================================================
# 7. Visual Description for Accessibility
# ==============================================================================

class AIVisualDescriptionRequest(BaseSchema):
    """Request to convert diagrams, charts, or images into screen-reader descriptions."""
    diagram_type: Optional[str] = Field(default="diagram", description="chart, diagram, map, illustration, flow")
    context_text: Optional[str] = Field(None, max_length=2000, description="Accompanying caption or topic context")
    image_url: Optional[str] = Field(None, description="Optional image URL or storage path")
    student_id: Optional[UUID] = Field(None, description="Optional student ID")


class AIVisualDescriptionResponse(BaseSchema):
    """Screen-reader friendly descriptive narration."""
    description: str
    tactile_guidance: Optional[str] = None
    key_elements: List[str] = Field(default_factory=list)


# ==============================================================================
# 8. Source Attribution Lookup
# ==============================================================================

class AISourceItem(BaseSchema):
    """Individual attributed educational source chunk."""
    chunk_id: str
    document_id: str
    document_title: Optional[str] = None
    page_number: Optional[int] = None
    snippet: str
    relevance_score: Optional[float] = None


class AISourcesResponse(BaseSchema):
    """Attribution details for a specific AI request."""
    request_id: str
    sources: List[AISourceItem] = Field(default_factory=list)
    retrieval_strategy: str = "chromadb_semantic_vector"


# ==============================================================================
# 9. Content Ingestion / Upload Response (API_CONTRACT.md Section 14)
# ==============================================================================

class ContentUploadResponse(BaseSchema):
    """Response returned upon uploading and processing educational material."""
    document_id: str
    file_name: str
    status: str
    chunks_count: int
    message: str = "Content successfully ingested and indexed for semantic search"

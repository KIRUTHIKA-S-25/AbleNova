"""
RAG Service — AbleNova
=======================
Handles retrieval of relevant educational content chunks based on student queries
and filtering parameters (subject, topic, grade, difficulty).
"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.content_chunk import ContentChunk
from app.db.models.content_document import ContentDocument


def retrieve_relevant_chunks(
    query: str,
    subject_id: UUID | None = None,
    topic_id: UUID | None = None,
    db: Session = None,
    limit: int = 3,
) -> list[ContentChunk]:
    """
    Retrieve top relevant educational chunks for grounding answers.
    Supports topic/subject filtering with keyword and text relevance matching.
    """
    if db is None:
        return []

    q = db.query(ContentChunk).join(ContentDocument, ContentChunk.document_id == ContentDocument.id)

    if subject_id:
        q = q.filter(ContentDocument.subject_id == subject_id)
    if topic_id:
        q = q.filter(ContentDocument.topic_id == topic_id)

    all_chunks = q.limit(50).all()
    if not all_chunks:
        return []

    # Score chunks by word overlap with query
    query_words = set(query.lower().split())
    scored = []
    for chunk in all_chunks:
        chunk_words = set(chunk.content.lower().split())
        overlap = len(query_words.intersection(chunk_words))
        scored.append((overlap, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:limit]]

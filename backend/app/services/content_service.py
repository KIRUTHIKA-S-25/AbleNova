"""Educational content ingestion, text extraction, cleaning, chunking,
and vector indexing service.
"""
import logging
import re
import uuid
from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.db.models.content import ContentChunk, ContentDocument
from app.services.rag_service import rag_service

logger = logging.getLogger("ablenova.content.service")


class ContentService:
    """Manages document ingestion, text sanitization, sentence-boundary sliding-window
    chunking, and dual-layer persistence (PostgreSQL metadata + ChromaDB vectors).
    """

    def clean_text(self, raw_text: str) -> str:
        """Sanitize raw document text, removing non-printable artifacts and normalizing whitespace."""
        if not raw_text:
            return ""

        # Remove null and non-printable control characters (keep standard \n, \t)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", raw_text)
        # Normalize zero-width and non-breaking spaces
        text = text.replace("\u200b", "").replace("\u00a0", " ")
        # Normalize multiple spaces and tabs
        text = re.sub(r"[ \t]+", " ", text)
        # Normalize excessive newlines (max 2 consecutive)
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 500,
        overlap: int = 100,
    ) -> List[Dict[str, Any]]:
        """Perform sentence-boundary-aware sliding-window chunking.
        Avoids splitting words or cutting sentences mid-thought.
        """
        cleaned = self.clean_text(text)
        if not cleaned:
            return []

        # Split into sentences using punctuation boundaries
        sentence_end = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])|\n\n+")
        raw_sentences = [s.strip() for s in sentence_end.split(cleaned) if s.strip()]

        if not raw_sentences:
            return [{"chunk_index": 0, "content": cleaned, "page_number": 1}]

        chunks = []
        current_sentences: List[str] = []
        current_len = 0
        chunk_index = 0

        for sentence in raw_sentences:
            s_len = len(sentence)
            if current_len + s_len > chunk_size and current_sentences:
                # Flush current chunk
                chunk_str = " ".join(current_sentences)
                chunks.append({
                    "chunk_index": chunk_index,
                    "content": chunk_str,
                    "page_number": max(1, (chunk_index // 3) + 1),
                })
                chunk_index += 1

                # Calculate overlap: retain the trailing sentences until overlap size is satisfied
                overlap_sentences: List[str] = []
                overlap_len = 0
                for s in reversed(current_sentences):
                    if overlap_len + len(s) <= overlap:
                        overlap_sentences.insert(0, s)
                        overlap_len += len(s)
                    else:
                        break

                current_sentences = overlap_sentences
                current_len = sum(len(s) for s in current_sentences)

            current_sentences.append(sentence)
            current_len += s_len

        # Flush remaining sentences
        if current_sentences:
            chunk_str = " ".join(current_sentences)
            chunks.append({
                "chunk_index": chunk_index,
                "content": chunk_str,
                "page_number": max(1, (chunk_index // 3) + 1),
            })

        return chunks

    def extract_text_from_bytes(self, file_bytes: bytes, file_name: str) -> str:
        """Extract clean text from uploaded binary files (UTF-8, text, markdown)."""
        lower_name = file_name.lower()
        try:
            # First attempt standard UTF-8 decoding
            text = file_bytes.decode("utf-8")
            return text
        except UnicodeDecodeError:
            try:
                # Fallback to Latin-1
                return file_bytes.decode("latin-1")
            except Exception as e:
                logger.error("Failed to decode text from file %s: %s", file_name, str(e))
                raise AppException(
                    code="CONTENT_PROCESSING_ERROR",
                    message=f"Unsupported or corrupted text encoding in file {file_name}",
                    status_code=400,
                )

    def process_and_index_document(
        self,
        db: Session,
        teacher_id: UUID,
        file_name: str,
        file_bytes: bytes,
        subject_id: UUID,
        topic_id: UUID,
        grade: int,
        language: str = "en",
        difficulty: str = "beginner",
        storage_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ingest, clean, chunk, persist to database, and index in ChromaDB."""
        doc_id = uuid.uuid4()
        storage_path = storage_path or f"documents/{subject_id}/{topic_id}/{doc_id}_{file_name}"

        # 1. Create ContentDocument record in PostgreSQL with status 'processing'
        document = ContentDocument(
            id=doc_id,
            teacher_id=teacher_id,
            file_name=file_name,
            storage_path=storage_path,
            subject_id=subject_id,
            topic_id=topic_id,
            grade=grade,
            language=language,
            difficulty=difficulty,
            status="processing",
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        try:
            # 2. Extract and clean text
            raw_text = self.extract_text_from_bytes(file_bytes, file_name)
            if not raw_text.strip():
                raise AppException(
                    code="CONTENT_PROCESSING_ERROR",
                    message="Uploaded document contains no readable text",
                    status_code=400,
                )

            # 3. Sliding-window sentence-boundary chunking
            chunks_data = self.chunk_text(raw_text, chunk_size=500, overlap=100)

            # 4. Create database chunks & prepare ChromaDB records
            chroma_chunks = []
            for ch in chunks_data:
                chunk_id = uuid.uuid4()
                c_model = ContentChunk(
                    id=chunk_id,
                    document_id=doc_id,
                    content=ch["content"],
                    page_number=ch["page_number"],
                    chunk_index=ch["chunk_index"],
                    chunk_metadata={
                        "subject_id": str(subject_id),
                        "topic_id": str(topic_id),
                        "grade": grade,
                        "language": language,
                        "difficulty": difficulty,
                    },
                )
                db.add(c_model)

                chroma_chunks.append({
                    "id": str(chunk_id),
                    "document_id": str(doc_id),
                    "content": ch["content"],
                    "page_number": ch["page_number"],
                    "chunk_index": ch["chunk_index"],
                    "subject_id": str(subject_id),
                    "topic_id": str(topic_id),
                    "grade": grade,
                    "language": language,
                    "difficulty": difficulty,
                })

            db.commit()

            # 5. Index into ChromaDB vector store
            indexed_count = rag_service.add_chunks(chroma_chunks)

            # 6. Update document status to 'processed'
            document.status = "processed"
            db.commit()

            return {
                "document_id": str(doc_id),
                "file_name": file_name,
                "status": "processed",
                "chunks_count": indexed_count,
                "message": f"Successfully processed {len(chunks_data)} chunks into educational vector index",
            }

        except AppException:
            document.status = "failed"
            db.commit()
            raise
        except Exception as exc:
            logger.exception("Unexpected error during document ingestion: %s", str(exc))
            document.status = "failed"
            db.commit()
            raise AppException(
                code="CONTENT_PROCESSING_ERROR",
                message=f"Failed to process educational document: {str(exc)}",
                status_code=500,
            )


content_service = ContentService()

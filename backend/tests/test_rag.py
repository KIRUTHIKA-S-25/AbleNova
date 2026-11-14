"""Tests for RAG pipeline, text extraction, cleaning, sliding-window chunking,
embedding generation, and ChromaDB semantic retrieval.
"""
import uuid
import pytest
from app.db.models.curriculum import Subject, Topic
from app.db.models.user import Teacher, User
from app.schemas.common import UserRole
from app.services.content_service import ContentService
from app.services.rag_service import EmbeddingGenerator, RAGService


@pytest.fixture
def test_rag_service():
    """In-memory RAG service instance for test isolation."""
    service = RAGService(in_memory=True, prefer_offline_embeddings=True)
    yield service
    service.reset_collection("test_curriculum")


def test_clean_text_removes_artifacts():
    content_svc = ContentService()
    raw = "Hello\x00 World!\u200b\u00a0 This is a test.\n\n\n\nMultiple newlines."
    cleaned = content_svc.clean_text(raw)
    assert "\x00" not in cleaned
    assert "\u200b" not in cleaned
    assert "\u00a0" not in cleaned
    assert "Hello World!" in cleaned
    assert "\n\n\n" not in cleaned


def test_chunk_text_sentence_boundary_and_overlap():
    content_svc = ContentService()
    # Construct a multi-sentence educational text
    text = (
        "Photosynthesis is the process used by plants to convert light energy into chemical energy. "
        "During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds. "
        "It is crucially important for sustaining life on Earth. "
        "Almost all living organisms depend on it directly or indirectly for their sustenance. "
        "Chlorophyll is the green pigment inside plant cells that absorbs the light energy. "
        "Without plants and photosynthesis, there would be little to no oxygen in the atmosphere."
    )
    chunks = content_svc.chunk_text(text, chunk_size=200, overlap=60)
    assert len(chunks) > 1

    # Verify no sentences are cut in half awkwardly
    for ch in chunks:
        content = ch["content"]
        assert len(content) > 0
        assert ch["chunk_index"] >= 0
        assert ch["page_number"] >= 1
        # Chunks should end with proper punctuation
        assert content[-1] in ".!?"


def test_embedding_generator_deterministic_properties():
    generator = EmbeddingGenerator(prefer_offline=True)
    text1 = "Photosynthesis helps plants produce glucose using sunlight."
    text2 = "Photosynthesis helps plants produce glucose using sunlight."
    text3 = "Gravity is an invisible force that pulls objects toward each other."

    emb1 = generator.generate_embedding(text1)
    emb2 = generator.generate_embedding(text2)
    emb3 = generator.generate_embedding(text3)

    assert len(emb1) == 384
    # Determinism: exact same text produces exact same vector
    assert emb1 == emb2
    # Different text produces different vector
    assert emb1 != emb3

    # Check unit normalization (L2 norm should be ~1.0)
    norm = sum(x * x for x in emb1) ** 0.5
    assert abs(norm - 1.0) < 1e-4


def test_chromadb_add_and_query_chunks(test_rag_service):
    col_name = "test_col_basic"
    chunks = [
        {
            "id": "chunk_001",
            "document_id": "doc_001",
            "content": "Plants produce oxygen through the marvelous process of photosynthesis.",
            "subject_id": "subj_science",
            "topic_id": "top_plants",
            "grade": 5,
            "language": "en",
        },
        {
            "id": "chunk_002",
            "document_id": "doc_001",
            "content": "The solar system consists of the Sun and eight major orbiting planets.",
            "subject_id": "subj_science",
            "topic_id": "top_space",
            "grade": 5,
            "language": "en",
        },
    ]

    added = test_rag_service.add_chunks(chunks, collection_name=col_name)
    assert added == 2

    # Query about plants
    results = test_rag_service.query_similar_chunks(
        query="How do plants make oxygen?",
        collection_name=col_name,
        limit=2,
    )
    assert len(results) >= 1
    top_result = results[0]
    assert top_result["chunk_id"] in ["chunk_001", "chunk_002"]
    assert "similarity_score" in top_result
    assert 0.0 <= top_result["similarity_score"] <= 1.0


def test_chromadb_deduplication(test_rag_service):
    col_name = "test_col_dedup"
    duplicate_chunks = [
        {
            "id": "chunk_dup_1",
            "document_id": "doc_002",
            "content": "Water freezes into ice at zero degrees Celsius.",
        },
        {
            "id": "chunk_dup_2",
            "document_id": "doc_002",
            "content": "Water freezes into ice at zero degrees Celsius.",  # Exact duplicate
        },
    ]

    added = test_rag_service.add_chunks(duplicate_chunks, collection_name=col_name)
    # The duplicate should be rejected
    assert added == 1


def test_chromadb_metadata_filtering(test_rag_service):
    col_name = "test_col_filters"
    chunks = [
        {
            "id": "chunk_eng_5",
            "document_id": "doc_003",
            "content": "Fractions represent parts of a whole quantity.",
            "subject_id": "subj_math",
            "grade": 5,
            "language": "en",
        },
        {
            "id": "chunk_span_5",
            "document_id": "doc_004",
            "content": "Las fracciones representan partes de un total.",
            "subject_id": "subj_math",
            "grade": 5,
            "language": "es",
        },
        {
            "id": "chunk_eng_8",
            "document_id": "doc_005",
            "content": "Linear equations can be written in slope-intercept form.",
            "subject_id": "subj_math",
            "grade": 8,
            "language": "en",
        },
    ]

    test_rag_service.add_chunks(chunks, collection_name=col_name)

    # Query with grade 8 filter
    results = test_rag_service.query_similar_chunks(
        query="equations",
        grade=8,
        collection_name=col_name,
    )
    assert len(results) >= 1
    assert results[0]["chunk_id"] == "chunk_eng_8"


def test_chromadb_delete_document_chunks(test_rag_service):
    col_name = "test_col_delete"
    chunks = [
        {
            "id": "chunk_to_keep",
            "document_id": "doc_keep",
            "content": "Keep this important curriculum note.",
        },
        {
            "id": "chunk_to_remove",
            "document_id": "doc_delete",
            "content": "Remove this obsolete outdated text.",
        },
    ]
    test_rag_service.add_chunks(chunks, collection_name=col_name)
    test_rag_service.delete_document_chunks("doc_delete", collection_name=col_name)

    results = test_rag_service.query_similar_chunks("text", collection_name=col_name)
    remaining_ids = [r["chunk_id"] for r in results]
    assert "chunk_to_remove" not in remaining_ids


def test_content_service_full_ingestion(client, db_session):
    content_svc = ContentService()

    # Create dummy subject, topic, and teacher in DB
    user = User(
        email=f"teacher_rag_{uuid.uuid4().hex[:6]}@example.com",
        name="Science Teacher",
        password_hash="hashed_pw",
        role=UserRole.TEACHER.value,
    )
    db_session.add(user)
    db_session.commit()

    teacher = Teacher(user_id=user.id)
    db_session.add(teacher)
    db_session.commit()

    subject = Subject(name=f"Natural Science {uuid.uuid4().hex[:6]}", grade_level_min=1, grade_level_max=6)
    db_session.add(subject)
    db_session.commit()

    topic = Topic(subject_id=subject.id, name="Ecosystems", order_index=1)
    db_session.add(topic)
    db_session.commit()

    raw_text = """
    An ecosystem is a geographic area where plants, animals, and other organisms, as well as weather and landscape, work together to form a bubble of life.
    Ecosystems contain biotic or living parts, as well as abiotic factors, or nonliving parts.
    Biotic factors include plants, animals, and other organisms.
    Abiotic factors include rocks, temperature, and humidity.
    Every factor in an ecosystem depends on every other factor, either directly or indirectly.
    """
    file_bytes = raw_text.encode("utf-8")

    result = content_svc.process_and_index_document(
        db=db_session,
        teacher_id=teacher.id,
        file_name="ecosystems.txt",
        file_bytes=file_bytes,
        subject_id=subject.id,
        topic_id=topic.id,
        grade=5,
        language="en",
        difficulty="beginner",
    )

    assert result["status"] == "processed"
    assert result["chunks_count"] > 0
    assert "document_id" in result

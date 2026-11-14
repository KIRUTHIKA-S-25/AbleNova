import os
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from httpx import AsyncClient

from app.core.config import Settings
from app.db.database import (
    Base,
    engine,
    get_db,
    check_db_health,
    get_db_health,
    normalize_database_url,
    get_safe_url,
    build_engine_options,
)


def test_database_config_loading():
    """Verify database configuration settings and defaults."""
    custom_settings = Settings(
        DATABASE_URL="postgresql://user:secret123@db.supabase.co:5432/postgres",
        DB_POOL_SIZE=15,
        DB_MAX_OVERFLOW=7,
        DB_POOL_TIMEOUT=45,
        DB_POOL_RECYCLE=600,
        DB_ECHO=False,
        DB_SSL_REQUIRE=True,
    )
    assert custom_settings.DB_POOL_SIZE == 15
    assert custom_settings.DB_MAX_OVERFLOW == 7
    assert custom_settings.DB_POOL_TIMEOUT == 45
    assert custom_settings.DB_POOL_RECYCLE == 600
    assert custom_settings.DB_SSL_REQUIRE is True

    # Password must be masked in safe URL
    safe_url = custom_settings.get_safe_database_url()
    assert "secret123" not in safe_url
    assert "***" in safe_url or ":***@" in safe_url


def test_normalize_database_url():
    """Verify normalization of various Supabase connection string schemes."""
    # postgres:// to postgresql://
    legacy_url = "postgres://user:pass@host:5432/db"
    assert normalize_database_url(legacy_url).startswith("postgresql://")

    # postgresql+psycopg fallback when psycopg3 is not installed
    psycopg_url = "postgresql+psycopg://user:pass@host:5432/db"
    normalized = normalize_database_url(psycopg_url)
    assert normalized.startswith("postgresql+psycopg2://") or normalized.startswith("postgresql+psycopg://")

    # Safe url formatting
    masked = get_safe_url("postgresql://admin:super_secret_password@supabase.co:5432/production")
    assert "super_secret_password" not in masked
    assert "***" in masked


def test_build_engine_options_postgresql():
    """Verify PostgreSQL/Supabase engine options builder."""
    raw_url = "postgresql://user:pass@host:5432/db"
    norm_url, options = build_engine_options(raw_url)
    assert "pool_size" in options
    assert "max_overflow" in options
    assert "pool_timeout" in options
    assert "pool_recycle" in options
    assert options.get("pool_pre_ping") is True
    # SSL should be enforced if not present in query string
    assert options.get("connect_args", {}).get("sslmode") == "require"


def test_build_engine_options_sqlite():
    """Verify SQLite engine options builder for testing/local dev."""
    raw_url = "sqlite:///./test.db"
    norm_url, options = build_engine_options(raw_url)
    assert options.get("connect_args") == {"check_same_thread": False}
    assert "pool_size" not in options


def test_session_lifecycle():
    """Verify database session lifecycle: session provisioning, query execution, and closure."""
    gen = get_db()
    session = next(gen)
    try:
        result = session.execute(text("SELECT 1")).scalar()
        assert result == 1
    finally:
        # Finalize generator
        try:
            next(gen)
        except StopIteration:
            pass


def test_session_lifecycle_rollback_on_error():
    """Verify that an exception inside the session block triggers rollback."""
    gen = get_db()
    session = next(gen)
    mock_session = MagicMock()
    
    with patch("app.db.database.SessionLocal", return_value=mock_session):
        gen_err = get_db()
        sess = next(gen_err)
        with pytest.raises(RuntimeError):
            try:
                raise RuntimeError("Simulated transaction failure")
            except Exception:
                gen_err.throw(RuntimeError("Simulated transaction failure"))
        mock_session.rollback.assert_called_once()
        mock_session.close.assert_called_once()


def test_db_health_check_success():
    """Verify health check returns True on operational database."""
    assert check_db_health() is True
    details = get_db_health()
    assert details["connected"] is True
    assert details["dialect"] in ["sqlite", "postgresql"]
    assert details["latency_ms"] is not None
    assert details["latency_ms"] >= 0.0
    assert details["error"] is None


def test_db_health_check_failure():
    """Verify health check gracefully catches connection errors and hides credentials."""
    with patch.object(engine, "connect", side_effect=OperationalError("connection to server at 'db.supabase.co' (123.45.67.89), port 5432 failed: FATAL: password authentication failed for user 'postgres'", None, None)):
        is_healthy = check_db_health()
        assert is_healthy is False

        health_details = get_db_health()
        assert health_details["connected"] is False
        assert health_details["latency_ms"] is None
        assert "password" not in health_details["error"]


@pytest.mark.asyncio
async def test_api_health_endpoint_healthy(async_client: AsyncClient):
    """Verify FastAPI /health and /api/v1/health endpoints when database is connected."""
    res_root = await async_client.get("/health")
    assert res_root.status_code == 200
    data = res_root.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "database_details" in data
    assert "dialect" in data["database_details"]

    res_v1 = await async_client.get("/api/v1/health")
    assert res_v1.status_code == 200
    data_v1 = res_v1.json()
    assert data_v1["status"] == "healthy"
    assert data_v1["database"] == "connected"


@pytest.mark.asyncio
async def test_api_health_endpoint_database_degraded(async_client: AsyncClient):
    """Verify FastAPI /health endpoints return degraded status gracefully when DB is down."""
    mock_down = {
        "connected": False,
        "dialect": "postgresql",
        "latency_ms": None,
        "error": "Connection failed: OperationalError",
    }
    with patch("app.main.get_db_health", return_value=mock_down):
        res_root = await async_client.get("/health")
        assert res_root.status_code == 200
        data = res_root.json()
        assert data["status"] == "degraded"
        assert data["database"] == "disconnected"
        assert "error" in data["database_details"]

        res_v1 = await async_client.get("/api/v1/health")
        assert res_v1.status_code == 200
        data_v1 = res_v1.json()
        assert data_v1["status"] == "degraded"
        assert data_v1["database"] == "disconnected"


def test_alembic_configuration_and_revisions():
    """Verify Alembic configuration loads, binds to target metadata, and discovers revisions."""
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    alembic_ini_path = os.path.join(backend_dir, "alembic.ini")
    assert os.path.isfile(alembic_ini_path)

    alembic_cfg = Config(alembic_ini_path)
    script = ScriptDirectory.from_config(alembic_cfg)

    # Check that revisions can be walked and head exists
    heads = script.get_heads()
    assert len(heads) > 0
    revisions = [r.revision for r in script.walk_revisions()]
    assert "0001_setup_extensions" in revisions
    assert "8c12c5387ad5" in revisions
    assert "d4e5f6a7b8c9" in revisions
    assert heads[0] == "e5f6a7b8c9d0"

    # Check Base metadata exists for autogenerate
    assert hasattr(Base, "metadata")

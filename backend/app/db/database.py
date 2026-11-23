import logging
import time
from typing import Any, Dict, Generator, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.core.config import settings

logger = logging.getLogger("ablenova.database")


def normalize_database_url(url: str) -> str:
    """Normalize database URL for driver compatibility.
    
    Ensures standard Supabase PostgreSQL URLs (starting with postgres:// or postgresql://)
    work seamlessly with the installed PostgreSQL DBAPI driver.
    """
    clean_url = url.strip()
    if clean_url.startswith("postgres://"):
        clean_url = "postgresql://" + clean_url[len("postgres://"):]
    if clean_url.startswith("postgresql+psycopg://"):
        try:
            import psycopg  # noqa: F401
        except ImportError:
            clean_url = "postgresql+psycopg2://" + clean_url[len("postgresql+psycopg://"):]
    return clean_url


def get_safe_url(url_or_engine: Any) -> str:
    """Mask credentials in connection strings to prevent credential exposure in logs."""
    try:
        if isinstance(url_or_engine, Engine):
            return url_or_engine.url.render_as_string(hide_password=True)
        u = make_url(str(url_or_engine))
        return u.render_as_string(hide_password=True)
    except Exception:
        return "unparseable-url"


def build_engine_options(raw_url: str) -> Tuple[str, Dict[str, Any]]:
    """Constructs database engine arguments tailored for PostgreSQL/Supabase or SQLite."""
    normalized_url = normalize_database_url(raw_url)
    parsed_url = make_url(normalized_url)
    dialect_name = parsed_url.get_backend_name()

    kwargs: Dict[str, Any] = {
        "echo": settings.DB_ECHO,
        "pool_pre_ping": True,
    }

    if dialect_name == "postgresql":
        # Production connection pool parameters for Supabase PostgreSQL
        kwargs.update({
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
            "pool_recycle": settings.DB_POOL_RECYCLE,
        })
        connect_args: Dict[str, Any] = {}
        # Ensure SSL is enabled if required and not already specified in query parameters
        if settings.DB_SSL_REQUIRE and "sslmode" not in parsed_url.query:
            connect_args["sslmode"] = "require"
        if connect_args:
            kwargs["connect_args"] = connect_args
    elif dialect_name == "sqlite":
        # Local development / testing SQLite configuration
        kwargs["connect_args"] = {"check_same_thread": False}
        if ":memory:" in normalized_url or parsed_url.database == ":memory:":
            kwargs["poolclass"] = StaticPool

    return normalized_url, kwargs


# Initialize engine with safe logging
_db_url, _engine_kwargs = build_engine_options(settings.DATABASE_URL)
logger.info("Initializing database engine: %s", get_safe_url(_db_url))

engine = create_engine(_db_url, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session, guaranteeing transaction rollback on error
    and deterministic session closure.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def check_db_health(timeout_seconds: float = 3.0) -> bool:
    """Verifies actual database connectivity by executing a lightweight query.
    
    Never reports healthy unless the query completes successfully.
    Catches all connectivity exceptions without exposing database credentials.
    """
    try:
        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1"),
                execution_options={"timeout": timeout_seconds}
            )
        return True
    except (SQLAlchemyError, Exception) as exc:
        logger.warning(
            "Database health check failed for %s. Error: %s",
            get_safe_url(engine),
            type(exc).__name__
        )
        return False


def get_db_health(timeout_seconds: float = 3.0) -> Dict[str, Any]:
    """Returns structured connectivity health details without exposing sensitive credentials."""
    start_time = time.perf_counter()
    try:
        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1"),
                execution_options={"timeout": timeout_seconds}
            )
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {
            "connected": True,
            "dialect": engine.dialect.name,
            "latency_ms": round(elapsed_ms, 2),
            "error": None,
        }
    except Exception as exc:
        logger.warning("Database probe failed: %s", type(exc).__name__)
        return {
            "connected": False,
            "dialect": engine.dialect.name if hasattr(engine, "dialect") else "unknown",
            "latency_ms": None,
            "error": f"Connection failed: {type(exc).__name__}",
        }

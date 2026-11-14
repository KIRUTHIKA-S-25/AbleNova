import logging
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

logger = logging.getLogger("ablenova.config")


class Settings(BaseSettings):
    PROJECT_NAME: str = "AbleNova Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database connection parameters (Supabase PostgreSQL or SQLite)
    DATABASE_URL: str = "sqlite:///./test.db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 5
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 300
    DB_ECHO: bool = False
    DB_SSL_REQUIRE: bool = True

    # Supabase & External Integrations
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Security & Auth
    JWT_SECRET: str = "dev-secret-key-change-in-production-ablenova"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    def get_database_url(self) -> str:
        """Returns normalized database URL with proper DBAPI driver.
        
        Handles:
        - Mapping legacy 'postgres://' to standard 'postgresql://'
        - Resolving 'postgresql+psycopg://' fallback to 'postgresql+psycopg2://'
          if psycopg v3 is not available.
        """
        url = self.DATABASE_URL.strip()
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        if url.startswith("postgresql+psycopg://"):
            try:
                import psycopg  # noqa: F401
            except ImportError:
                url = "postgresql+psycopg2://" + url[len("postgresql+psycopg://"):]
        return url

    def get_safe_database_url(self) -> str:
        """Returns the database URL with the password masked to prevent accidental credential leakage in logs."""
        try:
            url = make_url(self.get_database_url())
            return url.render_as_string(hide_password=True)
        except Exception:
            return "unparseable-database-url"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

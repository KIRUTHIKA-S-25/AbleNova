from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.db.database import check_db_health
from app.api.v1.api import api_router


def create_application() -> FastAPI:
    """Initialize and configure the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="AbleNova — AI-Powered Accessible and Adaptive Learning Backend API",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom Exception Handlers adhering to docs/API_CONTRACT.md section 20
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # Root and Health check endpoints
    @app.get("/", tags=["General"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs_url": "/docs",
            "api_v1": settings.API_V1_STR,
        }

    @app.get("/health", tags=["Health"])
    async def health_check():
        db_alive = check_db_health()
        return {
            "status": "healthy" if db_alive else "degraded",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "database": "connected" if db_alive else "disconnected",
        }

    @app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
    async def api_v1_health():
        db_alive = check_db_health()
        return {
            "status": "healthy" if db_alive else "degraded",
            "api_version": "v1",
            "database": "connected" if db_alive else "disconnected",
        }

    # Include all v1 API endpoints
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()

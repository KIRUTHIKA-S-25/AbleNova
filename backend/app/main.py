from fastapi import FastAPI

from app.api.v1 import (
    accessibility,
    ai,
    auth,
    caregivers,
    content,
    learning_path,
    lessons,
    progress,
    quizzes,
    recommendations,
    student,
    students,
    subjects,
    sync,
    teachers,
    topics,
)

app = FastAPI(
    title="AbleNova API",
    version="1.0.0",
    description="Backend API for the AbleNova adaptive learning platform",
)


# ============================================================
# API v1 ROUTES — EXISTING (DO NOT REMOVE)
# ============================================================

app.include_router(
    subjects.router,
    prefix="/api/v1",
)

app.include_router(
    topics.router,
    prefix="/api/v1",
)

app.include_router(
    lessons.router,
    prefix="/api/v1",
)

app.include_router(
    auth.router,
    prefix="/api/v1",
)

app.include_router(
    student.router,
    prefix="/api/v1",
)

app.include_router(
    students.router,
    prefix="/api/v1",
)

app.include_router(
    accessibility.router,
    prefix="/api/v1",
)

app.include_router(
    progress.router,
    prefix="/api/v1",
)


# ============================================================
# API v1 ROUTES — NEWLY COMPLETED
# ============================================================

app.include_router(
    caregivers.router,
    prefix="/api/v1",
)

app.include_router(
    teachers.router,
    prefix="/api/v1",
)

app.include_router(
    quizzes.router,
    prefix="/api/v1",
)

app.include_router(
    recommendations.router,
    prefix="/api/v1",
)

app.include_router(
    learning_path.router,
    prefix="/api/v1",
)

app.include_router(
    content.router,
    prefix="/api/v1",
)

app.include_router(
    ai.router,
    prefix="/api/v1",
)

app.include_router(
    sync.router,
    prefix="/api/v1",
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "AbleNova backend is running",
        "status": "success",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }

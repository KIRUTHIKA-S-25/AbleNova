from fastapi import APIRouter
from app.api.v1 import (
    auth,
    students,
    subjects,
    lessons,
    quizzes,
    progress,
    recommendations,
    ai,
    content,
    teachers,
    caregivers,
    sync,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(subjects.router)
api_router.include_router(lessons.router)
api_router.include_router(quizzes.router)
api_router.include_router(progress.router)
api_router.include_router(recommendations.router)
api_router.include_router(ai.router)
api_router.include_router(content.router)
api_router.include_router(teachers.router)
api_router.include_router(caregivers.router)
api_router.include_router(sync.router)

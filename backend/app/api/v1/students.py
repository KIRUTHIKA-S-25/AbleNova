from fastapi import APIRouter

router = APIRouter(tags=["Student Profile & Learning Path"])


@router.get("/student/profile")
async def get_student_profile():
    return {"message": "Student profile endpoint ready"}


@router.put("/student/profile")
async def update_student_profile():
    return {"message": "Update student profile endpoint ready"}


@router.get("/student/learning-path")
async def get_learning_path():
    return {"message": "Personalized learning path endpoint ready"}

from fastapi import APIRouter

router = APIRouter(tags=["Authentication"])


@router.post("/auth/register")
async def register():
    return {"message": "Registration endpoint ready"}


@router.post("/auth/login")
async def login():
    return {"message": "Login endpoint ready"}


@router.get("/me")
async def get_me():
    return {"message": "Current user endpoint ready"}

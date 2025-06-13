from fastapi import APIRouter, Request,Depends
from lib.auth_dependency import verify_token
from controllers.user_controllers import register,login,get_user_by_token
from lib.models import LoginRequest

router = APIRouter()

@router.post("/register")
async def create_user(request:Request):
    return await register(request)


@router.post("/login")
async def login_user(request:LoginRequest):
    return await login(request)

@router.get("/get-user")
async def get_user(payload=Depends(verify_token)):
    return await get_user_by_token(payload)
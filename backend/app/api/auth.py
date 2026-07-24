"""
Authentication routes: signup, login, me, change-password.
No database session needed — Beanie handles queries directly.
"""
from fastapi import APIRouter, Depends, status

from ..core.security import get_current_user
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, ChangePasswordRequest
from ..services.auth_service import AuthService

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserCreate):
    """Register a new user and return an access token."""
    user = await AuthService.create_user(data)
    token = AuthService.generate_token(user)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Authenticate user and return an access token."""
    user = await AuthService.authenticate_user(data.email, data.password)
    token = AuthService.generate_token(user)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserResponse.model_validate(current_user)


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    """Change the authenticated user's password."""
    await AuthService.change_password(current_user, data.current_password, data.new_password)
    return {"message": "Password changed successfully"}

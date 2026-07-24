"""
Authentication service using Beanie (MongoDB).
No SQLAlchemy sessions — queries go directly through Beanie document methods.
"""
from typing import Optional
from fastapi import HTTPException, status
from beanie import PydanticObjectId

from ..models.user import User
from ..schemas.user import UserCreate
from ..core.security import hash_password, verify_password, create_access_token


class AuthService:

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        try:
            return await User.get(PydanticObjectId(user_id))
        except Exception:
            return None

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        return await User.find_one(User.email == email)

    @staticmethod
    async def get_user_by_username(username: str) -> Optional[User]:
        return await User.find_one(User.username == username)

    @staticmethod
    async def create_user(data: UserCreate) -> User:
        if await AuthService.get_user_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        if await AuthService.get_user_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        await user.insert()
        return user

    @staticmethod
    async def authenticate_user(email: str, password: str) -> User:
        user = await AuthService.get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled",
            )
        return user

    @staticmethod
    def generate_token(user: User) -> str:
        return create_access_token({"sub": str(user.id), "email": user.email})

    @staticmethod
    async def change_password(user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        user.hashed_password = hash_password(new_password)
        await user.save()

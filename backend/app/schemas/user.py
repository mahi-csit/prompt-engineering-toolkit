"""
Pydantic schemas for User authentication and management.
IDs are strings (MongoDB ObjectId serialised as str).
"""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("Username must be at most 50 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    username_or_email: str = ""
    password: str

    @model_validator(mode="before")
    @classmethod
    def check_username_or_email(cls, values: Any) -> Any:
        if isinstance(values, dict):
            identifier = values.get("username_or_email") or values.get("email") or values.get("username")
            if identifier:
                values["username_or_email"] = str(identifier).strip()
        return values


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    # Beanie stores _id as PydanticObjectId; serialise to str
    model_config = {"from_attributes": True, "populate_by_name": True}

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        if hasattr(obj, "id"):
            return cls(
                id=str(obj.id),
                username=obj.username,
                email=str(obj.email),
                full_name=obj.full_name,
                is_active=obj.is_active,
                created_at=obj.created_at,
            )
        return super().model_validate(obj, *args, **kwargs)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters")
        return v

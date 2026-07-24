"""
User Beanie Document model for MongoDB.
"""
from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import EmailStr, Field


class User(Document):
    username: str
    email: str
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            [("username", 1)],
            [("email", 1)],
        ]

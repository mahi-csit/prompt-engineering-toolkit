"""
Security utilities: JWT token creation/verification and password hashing.
Uses bcrypt directly (passlib is incompatible with Python 3.14).
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme)):
    """Return current user if token valid, else None. No exception raised."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    from ..services.auth_service import AuthService
    user_id = payload.get("sub")
    if not user_id:
        return None
    return await AuthService.get_user_by_id(user_id)


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    """Return current user or raise 401."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
    from ..services.auth_service import AuthService
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    user = await AuthService.get_user_by_id(user_id)
    if not user:
        raise credentials_exception
    return user

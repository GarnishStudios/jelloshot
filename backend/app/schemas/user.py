"""
User schemas using FastAPI-Users base schemas.
Extends base schemas with custom fields (username, full_name).
"""

from fastapi_users import schemas
from pydantic import Field
from typing import Optional
import uuid


class UserRead(schemas.BaseUser[uuid.UUID]):
    """Schema for reading user data (responses)"""

    username: str
    full_name: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    """Schema for creating new users (registration)"""

    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    """Schema for updating user data"""

    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = None

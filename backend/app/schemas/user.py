from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class User(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None

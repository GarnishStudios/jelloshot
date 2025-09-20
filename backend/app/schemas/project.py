from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class ProjectStatus(str, Enum):
    PRE_PRODUCTION = "pre_production"
    PRODUCTION = "production"
    POST_PRODUCTION = "post_production"
    COMPLETED = "completed"

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    production_company: Optional[str] = None
    director: Optional[str] = None
    producer: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PRE_PRODUCTION

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    production_company: Optional[str] = None
    director: Optional[str] = None
    producer: Optional[str] = None
    status: Optional[ProjectStatus] = None

class ProjectInDB(ProjectBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectInDB):
    pass

class ProjectWithShotlists(Project):
    shotlists: List["Shotlist"] = []

from app.schemas.shotlist import Shotlist
ProjectWithShotlists.model_rebuild()
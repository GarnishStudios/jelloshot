from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from uuid import UUID

class ShotlistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    shooting_date: Optional[date] = None
    call_time: Optional[time] = None
    wrap_time: Optional[time] = None
    location: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None

class ShotlistCreate(ShotlistBase):
    pass

class ShotlistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    shooting_date: Optional[date] = None
    call_time: Optional[time] = None
    wrap_time: Optional[time] = None
    location: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None

class ShotlistInDB(ShotlistBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Shotlist(ShotlistInDB):
    pass

class ShotlistWithItems(Shotlist):
    items: List["ShotlistItem"] = []

from app.schemas.shotlist_item import ShotlistItem
ShotlistWithItems.model_rebuild()
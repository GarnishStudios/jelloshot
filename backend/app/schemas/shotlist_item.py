from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time
from uuid import UUID

class ShotlistItemBase(BaseModel):
    shot_name: str = Field(..., min_length=1, max_length=100)
    shot_details: Optional[str] = None
    time_of_day: Optional[str] = Field(None, pattern="^(dawn|morning|afternoon|evening|night)$")
    shot_duration: Optional[int] = Field(None, ge=1, le=1440)  # 1 minute to 24 hours
    start_time: Optional[time] = None
    notes: Optional[str] = None
    shot_reference_image: Optional[str] = None
    order_index: int = Field(..., ge=0)

class ShotlistItemCreate(BaseModel):
    shot_name: str = Field(..., min_length=1, max_length=100)
    shot_details: Optional[str] = None
    time_of_day: Optional[str] = Field(None, pattern="^(dawn|morning|afternoon|evening|night)$")
    shot_duration: Optional[int] = Field(None, ge=1, le=1440)
    notes: Optional[str] = None

class ShotlistItemUpdate(BaseModel):
    shot_name: Optional[str] = Field(None, min_length=1, max_length=100)
    shot_details: Optional[str] = None
    time_of_day: Optional[str] = Field(None, pattern="^(dawn|morning|afternoon|evening|night)$")
    shot_duration: Optional[int] = Field(None, ge=1, le=1440)
    start_time: Optional[time] = None
    notes: Optional[str] = None
    shot_reference_image: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)

class ShotlistItemInDB(ShotlistItemBase):
    id: UUID
    shotlist_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ShotlistItem(ShotlistItemInDB):
    pass

class ShotlistItemReorder(BaseModel):
    item_id: UUID
    new_index: int = Field(..., ge=0)

class ReorderRequest(BaseModel):
    items: List[ShotlistItemReorder]
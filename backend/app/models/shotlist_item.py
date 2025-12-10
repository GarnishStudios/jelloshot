from sqlalchemy import (
    Column,
    String,
    Text,
    ForeignKey,
    DateTime,
    Integer,
    Time,
    JSON,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class ShotlistItem(Base):
    __tablename__ = "shotlist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shotlist_id = Column(UUID(as_uuid=True), ForeignKey("shotlists.id"), nullable=False)
    shot_name = Column(String(100), nullable=False)
    shot_type = Column(String(50), default="Standard")  # Standard, Lunch, Break
    shot_description = Column(Text)  # Match actual database column name
    time_of_day = Column(String(50))  # dawn, morning, afternoon, evening, night
    shot_duration = Column(Integer)  # in minutes
    start_time = Column(Time)
    notes = Column(Text)
    shot_reference_image = Column(String(500))  # file path or URL
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Additional columns that exist in database
    camera_angle = Column(String(100))
    aspect_ratio = Column(String(20))
    fps = Column(Integer)
    scheduled_time = Column(Time)
    custom_properties = Column(JSON)
    is_completed = Column(Boolean, default=False, nullable=False)
    duration_locked = Column(Boolean, default=False, nullable=False)

    shotlist = relationship("Shotlist", back_populates="items")

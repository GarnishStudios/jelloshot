from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Integer, Time
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
    shot_details = Column(Text)
    time_of_day = Column(String(50))  # dawn, morning, afternoon, evening, night
    shot_duration = Column(Integer)  # in minutes
    start_time = Column(Time)
    notes = Column(Text)
    shot_reference_image = Column(String(500))  # file path or URL
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    shotlist = relationship("Shotlist", back_populates="items")
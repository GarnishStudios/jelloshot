from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base

class Shotlist(Base):
    __tablename__ = "shotlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    shooting_date = Column(Date)
    call_time = Column(Time)
    wrap_time = Column(Time)
    location = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="shotlists")
    items = relationship("ShotlistItem", back_populates="shotlist", cascade="all, delete-orphan", order_by="ShotlistItem.order_index")
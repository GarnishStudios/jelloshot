from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base

class ProjectStatus(str, enum.Enum):
    PRE_PRODUCTION = "pre_production"
    PRODUCTION = "production"
    POST_PRODUCTION = "post_production"
    COMPLETED = "completed"

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    production_company = Column(String(255))
    director = Column(String(255))
    producer = Column(String(255))
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PRE_PRODUCTION)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    shotlists = relationship("Shotlist", back_populates="project", cascade="all, delete-orphan")
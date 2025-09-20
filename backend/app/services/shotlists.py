from sqlalchemy.orm import Session
from uuid import UUID
from app.models.shotlist import Shotlist
from app.schemas.shotlist import ShotlistCreate, ShotlistUpdate

def get_shotlist(db: Session, shotlist_id: UUID):
    return db.query(Shotlist).filter(Shotlist.id == shotlist_id).first()

def get_project_shotlists(db: Session, project_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(Shotlist).filter(Shotlist.project_id == project_id).offset(skip).limit(limit).all()

def create_shotlist(db: Session, shotlist: ShotlistCreate, project_id: UUID):
    db_shotlist = Shotlist(
        **shotlist.dict(),
        project_id=project_id
    )
    db.add(db_shotlist)
    db.commit()
    db.refresh(db_shotlist)
    return db_shotlist

def update_shotlist(db: Session, shotlist_id: UUID, shotlist: ShotlistUpdate):
    db_shotlist = db.query(Shotlist).filter(Shotlist.id == shotlist_id).first()
    if db_shotlist:
        update_data = shotlist.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_shotlist, field, value)
        db.commit()
        db.refresh(db_shotlist)
    return db_shotlist

def delete_shotlist(db: Session, shotlist_id: UUID):
    db_shotlist = db.query(Shotlist).filter(Shotlist.id == shotlist_id).first()
    if db_shotlist:
        db.delete(db_shotlist)
        db.commit()
    return db_shotlist
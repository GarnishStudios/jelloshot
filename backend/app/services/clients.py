from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate

def get_user_clients(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Client]:
    return db.query(Client).filter(Client.user_id == user_id).offset(skip).limit(limit).all()

def get_client(db: Session, client_id: UUID) -> Optional[Client]:
    return db.query(Client).filter(Client.id == client_id).first()

def create_client(db: Session, client: ClientCreate, user_id: UUID) -> Client:
    db_client = Client(**client.model_dump(), user_id=user_id)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: UUID, client: ClientUpdate) -> Client:
    db_client = get_client(db, client_id)
    if db_client is None:
        return None
    update_data = client.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: UUID) -> bool:
    db_client = get_client(db, client_id)
    if db_client is None:
        return False
    db.delete(db_client)
    db.commit()
    return True



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.schemas.client import Client, ClientCreate, ClientUpdate, ClientWithProjects
from app.models.user import User
from app.api.endpoints.auth import get_current_user
from app.services import clients as client_service

router = APIRouter()

@router.get("/", response_model=List[Client])
def read_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clients = client_service.get_user_clients(db, user_id=current_user.id, skip=skip, limit=limit)
    return clients

@router.post("/", response_model=Client)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return client_service.create_client(db=db, client=client, user_id=current_user.id)

@router.get("/{client_id}", response_model=ClientWithProjects)
def read_client(
    client_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_client = client_service.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    if db_client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this client")
    return db_client

@router.put("/{client_id}", response_model=Client)
def update_client(
    client_id: UUID,
    client: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_client = client_service.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    if db_client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this client")
    return client_service.update_client(db=db, client_id=client_id, client=client)

@router.delete("/{client_id}")
def delete_client(
    client_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_client = client_service.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    if db_client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this client")
    client_service.delete_client(db=db, client_id=client_id)
    return {"detail": "Client deleted successfully"}



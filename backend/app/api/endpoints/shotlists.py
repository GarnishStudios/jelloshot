from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.schemas.shotlist import (
    Shotlist,
    ShotlistCreate,
    ShotlistUpdate,
    ShotlistWithItems,
)
from app.models.user import User
from app.api.endpoints.auth import get_current_user
from app.services import shotlists as shotlist_service
from app.services import projects as project_service

router = APIRouter()


@router.get("/projects/{project_id}/shotlists", response_model=List[Shotlist])
def read_shotlists(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = project_service.get_project(
        db, project_id=project_id, user_id=current_user.id
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    shotlists = shotlist_service.get_project_shotlists(
        db, project_id=project_id, skip=skip, limit=limit
    )
    return shotlists


@router.post("/projects/{project_id}/shotlists", response_model=Shotlist)
def create_shotlist(
    project_id: UUID,
    shotlist: ShotlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = project_service.get_project(
        db, project_id=project_id, user_id=current_user.id
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return shotlist_service.create_shotlist(
        db=db, shotlist=shotlist, project_id=project_id
    )


@router.get("/shotlists/{shotlist_id}", response_model=ShotlistWithItems)
def read_shotlist(
    shotlist_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_shotlist = shotlist_service.get_shotlist(
        db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    return db_shotlist


@router.put("/shotlists/{shotlist_id}", response_model=Shotlist)
def update_shotlist(
    shotlist_id: UUID,
    shotlist: ShotlistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_shotlist = shotlist_service.get_shotlist(
        db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    return shotlist_service.update_shotlist(
        db=db, shotlist_id=shotlist_id, shotlist=shotlist, user_id=current_user.id
    )


@router.delete("/shotlists/{shotlist_id}")
def delete_shotlist(
    shotlist_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_shotlist = shotlist_service.get_shotlist(
        db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    shotlist_service.delete_shotlist(
        db=db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    return {"detail": "Shotlist deleted successfully"}

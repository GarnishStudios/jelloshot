from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import time, datetime, timedelta
from app.db.database import get_db
from app.schemas.shotlist_item import ShotlistItem, ShotlistItemCreate, ShotlistItemUpdate, ReorderRequest
from app.schemas.user import User
from app.services import auth as auth_service
from app.services import shotlist_items as item_service
from app.services import shotlists as shotlist_service
from app.services import projects as project_service

router = APIRouter()

@router.get("/shotlists/{shotlist_id}/items", response_model=List[ShotlistItem])
def read_shotlist_items(
    shotlist_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=shotlist_id)
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this shotlist")

    items = item_service.get_shotlist_items(db, shotlist_id=shotlist_id)
    return items

@router.post("/shotlists/{shotlist_id}/items", response_model=ShotlistItem)
def create_shotlist_item(
    shotlist_id: UUID,
    item: ShotlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=shotlist_id)
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this shotlist")

    return item_service.create_shotlist_item(db=db, item=item, shotlist_id=shotlist_id)

@router.get("/shotlist-items/{item_id}", response_model=ShotlistItem)
def read_shotlist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_item = item_service.get_shotlist_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=db_item.shotlist_id)
    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this item")

    return db_item

@router.put("/shotlist-items/{item_id}", response_model=ShotlistItem)
def update_shotlist_item(
    item_id: UUID,
    item: ShotlistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_item = item_service.get_shotlist_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=db_item.shotlist_id)
    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")

    return item_service.update_shotlist_item(db=db, item_id=item_id, item=item)

@router.delete("/shotlist-items/{item_id}")
def delete_shotlist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_item = item_service.get_shotlist_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=db_item.shotlist_id)
    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")

    item_service.delete_shotlist_item(db=db, item_id=item_id)
    return {"detail": "Item deleted successfully"}

@router.put("/shotlists/{shotlist_id}/items/reorder", response_model=List[ShotlistItem])
def reorder_shotlist_items(
    shotlist_id: UUID,
    reorder_request: ReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=shotlist_id)
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reorder items in this shotlist")

    items = item_service.reorder_shotlist_items(
        db=db,
        shotlist_id=shotlist_id,
        reorder_request=reorder_request,
        call_time=db_shotlist.call_time
    )
    return items
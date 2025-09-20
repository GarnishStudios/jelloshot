from sqlalchemy.orm import Session
from uuid import UUID
from datetime import time, datetime, timedelta
from typing import Optional
from app.models.shotlist_item import ShotlistItem
from app.schemas.shotlist_item import ShotlistItemCreate, ShotlistItemUpdate, ReorderRequest

def get_shotlist_item(db: Session, item_id: UUID):
    return db.query(ShotlistItem).filter(ShotlistItem.id == item_id).first()

def get_shotlist_items(db: Session, shotlist_id: UUID):
    return db.query(ShotlistItem).filter(
        ShotlistItem.shotlist_id == shotlist_id
    ).order_by(ShotlistItem.order_index).all()

def create_shotlist_item(db: Session, item: ShotlistItemCreate, shotlist_id: UUID):
    # Get the max order index for this shotlist
    max_order = db.query(ShotlistItem).filter(
        ShotlistItem.shotlist_id == shotlist_id
    ).count()

    db_item = ShotlistItem(
        **item.dict(),
        shotlist_id=shotlist_id,
        order_index=max_order
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_shotlist_item(db: Session, item_id: UUID, item: ShotlistItemUpdate):
    db_item = db.query(ShotlistItem).filter(ShotlistItem.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_shotlist_item(db: Session, item_id: UUID):
    db_item = db.query(ShotlistItem).filter(ShotlistItem.id == item_id).first()
    if db_item:
        shotlist_id = db_item.shotlist_id
        order_index = db_item.order_index

        # Delete the item
        db.delete(db_item)

        # Update order indices for remaining items
        remaining_items = db.query(ShotlistItem).filter(
            ShotlistItem.shotlist_id == shotlist_id,
            ShotlistItem.order_index > order_index
        ).all()

        for item in remaining_items:
            item.order_index -= 1

        db.commit()
    return db_item

def reorder_shotlist_items(db: Session, shotlist_id: UUID, reorder_request: ReorderRequest, call_time: Optional[time] = None):
    # Update order indices based on the reorder request
    for item_reorder in reorder_request.items:
        db_item = db.query(ShotlistItem).filter(
            ShotlistItem.id == item_reorder.item_id,
            ShotlistItem.shotlist_id == shotlist_id
        ).first()
        if db_item:
            db_item.order_index = item_reorder.new_index

    db.commit()

    # Get all items in new order
    items = db.query(ShotlistItem).filter(
        ShotlistItem.shotlist_id == shotlist_id
    ).order_by(ShotlistItem.order_index).all()

    # Recalculate start times if call_time is provided
    if call_time:
        current_time = datetime.combine(datetime.today(), call_time)
        for item in items:
            if item.shot_duration:
                item.start_time = current_time.time()
                current_time += timedelta(minutes=item.shot_duration)
        db.commit()

    return items
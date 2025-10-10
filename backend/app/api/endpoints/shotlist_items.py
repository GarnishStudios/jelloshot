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

@router.post("/shotlist-items/{item_id}/upload-image")
async def upload_image(
    item_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    import os
    import uuid
    from PIL import Image
    import io

    db_item = item_service.get_shotlist_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    db_shotlist = shotlist_service.get_shotlist(db, shotlist_id=db_item.shotlist_id)
    db_project = project_service.get_project(db, project_id=db_shotlist.project_id)
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload image for this item")

    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read the uploaded file
    contents = await file.read()

    # Process the image with PIL
    try:
        image = Image.open(io.BytesIO(contents))

        # Convert to RGB if necessary (handles PNG with transparency, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Determine target size based on original image aspect ratio
        original_width, original_height = image.size
        aspect_ratio = original_width / original_height

        # Choose target format based on aspect ratio
        if aspect_ratio > 1.5:  # Wide image -> 16:9
            target_size = (1920, 1080)
        elif aspect_ratio < 0.75:  # Tall image -> 9:16
            target_size = (1080, 1920)
        else:  # Square-ish image -> 1:1
            target_size = (1080, 1080)

        # Calculate resize dimensions to fit within target while maintaining aspect ratio
        image.thumbnail(target_size, Image.Resampling.LANCZOS)

        # Create a new image with target size and white background
        new_image = Image.new('RGB', target_size, (255, 255, 255))

        # Calculate position to center the resized image
        x = (target_size[0] - image.size[0]) // 2
        y = (target_size[1] - image.size[1]) // 2

        # Paste the resized image onto the center of the new image
        new_image.paste(image, (x, y))

        # Generate unique filename
        file_extension = '.jpg'  # Always save as JPG for consistency
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Ensure uploads directory exists
        uploads_dir = "static/uploads"
        os.makedirs(uploads_dir, exist_ok=True)

        # Save the processed image
        file_path = os.path.join(uploads_dir, unique_filename)
        new_image.save(file_path, "JPEG", quality=85, optimize=True)

        # Create URL for the image
        image_url = f"/static/uploads/{unique_filename}"

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

    # Update the item with the image URL
    from app.schemas.shotlist_item import ShotlistItemUpdate
    update_data = ShotlistItemUpdate(shot_reference_image=image_url)
    updated_item = item_service.update_shotlist_item(
        db=db,
        item_id=item_id,
        item=update_data
    )

    return {"url": image_url}
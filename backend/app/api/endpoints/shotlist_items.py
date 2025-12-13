from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.schemas.image_response import ImageResponse
from app.schemas.shotlist_item import (
    ShotlistItem,
    ShotlistItemCreate,
    ShotlistItemUpdate,
    ReorderRequest,
)
from app.models.user import User
from app.api.endpoints.auth import get_current_user
from app.services import shotlist_items as shotlist_item_service
from app.services import shotlists as shotlist_service
from app.services import projects as project_service
import os
import uuid
from PIL import Image
import io
from app.schemas.shotlist_item import ShotlistItemUpdate


router = APIRouter()


@router.get("/shotlists/{shotlist_id}/items", response_model=List[ShotlistItem])
def read_shotlist_items(
    shotlist_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_shotlist = shotlist_service.get_shotlist(
        db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    items = shotlist_item_service.get_shotlist_items(db, shotlist_id=shotlist_id)
    return items


@router.post("/shotlists/{shotlist_id}/items", response_model=ShotlistItem)
def create_shotlist_item(
    shotlist_id: UUID,
    item: ShotlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_shotlist = shotlist_service.get_shotlist(
        db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    return shotlist_item_service.create_shotlist_item(
        db=db, item=item, shotlist_id=shotlist_id
    )


@router.get("/shotlist-items/{item_id}", response_model=ShotlistItem)
def read_shotlist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_item = shotlist_item_service.get_shotlist_item(
        db, item_id=item_id, user_id=current_user.id
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return db_item


@router.put("/shotlist-items/{item_id}", response_model=ShotlistItem)
def update_shotlist_item(
    item_id: UUID,
    item: ShotlistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_item = shotlist_item_service.get_shotlist_item(
        db, item_id=item_id, user_id=current_user.id
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    return shotlist_item_service.update_shotlist_item(db=db, item_id=item_id, item=item)


@router.delete("/shotlist-items/{item_id}")
def delete_shotlist_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_item = shotlist_item_service.get_shotlist_item(
        db, item_id=item_id, user_id=current_user.id
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    shotlist_item_service.delete_shotlist_item(db=db, item_id=item_id)
    return {"detail": "Item deleted successfully"}


@router.put("/shotlists/{shotlist_id}/items/reorder", response_model=List[ShotlistItem])
def reorder_shotlist_items(
    shotlist_id: UUID,
    reorder_request: ReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_shotlist = shotlist_service.get_shotlist(
        db, shotlist_id=shotlist_id, user_id=current_user.id
    )
    if db_shotlist is None:
        raise HTTPException(status_code=404, detail="Shotlist not found")

    items = shotlist_item_service.reorder_shotlist_items(
        db=db,
        shotlist_id=shotlist_id,
        reorder_request=reorder_request,
        call_time=db_shotlist.call_time,
    )
    return items


@router.post("/shotlist-items/{item_id}/upload-image", response_model=ImageResponse)
async def upload_image(
    item_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_item = shotlist_item_service.get_shotlist_item(
        db, item_id=item_id, user_id=current_user.id
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read the uploaded file
    contents = await file.read()

    # Validate file size
    if len(contents) > (3 * 1024 * 1024):
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is 3MB",
        )

    # Process the image with PIL
    try:
        image = Image.open(io.BytesIO(contents))

        # Convert to RGB if necessary (handles PNG with transparency, etc.)
        if image.mode != "RGB":
            image = image.convert("RGB")

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
        new_image = Image.new("RGB", target_size, (255, 255, 255))

        # Calculate position to center the resized image
        x = (target_size[0] - image.size[0]) // 2
        y = (target_size[1] - image.size[1]) // 2

        # Paste the resized image onto the center of the new image
        new_image.paste(image, (x, y))

        # Generate unique filename
        file_extension = ".jpg"  # Always save as JPG for consistency
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
        raise HTTPException(
            status_code=400, detail="Error processing image. Please try again."
        )

    update_data = ShotlistItemUpdate(shot_reference_image=image_url)
    updated_item = shotlist_item_service.update_shotlist_item(
        db=db, item_id=item_id, item=update_data
    )

    return {"url": image_url}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectWithShotlists,
)
from app.models.user import User
from app.api.endpoints.auth import get_current_user
from app.services import projects as project_service
from app.services import clients as client_service

router = APIRouter()


@router.get("/", response_model=List[Project])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if client_id:

        client = client_service.get_client(db, client_id, user_id=current_user.id)
        if not client:
            raise HTTPException(
                status_code=404,
                detail="Client not found",
            )
        projects = project_service.get_client_projects(
            db, client_id=client_id, skip=skip, limit=limit
        )
    else:
        projects = project_service.get_user_projects(
            db, user_id=current_user.id, skip=skip, limit=limit
        )
    return projects


@router.post("/", response_model=Project)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.create_project(
        db=db, project=project, user_id=current_user.id
    )


@router.get("/{project_id}", response_model=ProjectWithShotlists)
def read_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = project_service.get_project(
        db, project_id=project_id, user_id=current_user.id
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id: UUID,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = project_service.get_project(
        db, project_id=project_id, user_id=current_user.id
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project_service.update_project(
        db=db, project_id=project_id, project=project, user_id=current_user.id
    )


@router.delete("/{project_id}")
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_project = project_service.get_project(
        db, project_id=project_id, user_id=current_user.id
    )
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    project_service.delete_project(
        db=db, project_id=project_id, user_id=current_user.id
    )
    return {"detail": "Project deleted successfully"}

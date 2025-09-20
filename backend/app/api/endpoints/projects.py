from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectWithShotlists
from app.schemas.user import User
from app.services import auth as auth_service
from app.services import projects as project_service

router = APIRouter()

@router.get("/", response_model=List[Project])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    projects = project_service.get_user_projects(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects

@router.post("/", response_model=Project)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    return project_service.create_project(db=db, project=project, user_id=current_user.id)

@router.get("/{project_id}", response_model=ProjectWithShotlists)
def read_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_project = project_service.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return db_project

@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id: UUID,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_project = project_service.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    return project_service.update_project(db=db, project_id=project_id, project=project)

@router.delete("/{project_id}")
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    db_project = project_service.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    project_service.delete_project(db=db, project_id=project_id)
    return {"detail": "Project deleted successfully"}
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_project(db: Session, project_id: UUID):
    return db.query(Project).filter(Project.id == project_id).first()


def get_user_projects(db: Session, user_id: UUID, skip: int = 0, limit: int = 100):
    return (
        db.query(Project)
        .filter(Project.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_client_projects(db: Session, client_id: UUID, skip: int = 0, limit: int = 100):
    return (
        db.query(Project)
        .filter(Project.client_id == client_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_project(db: Session, project: ProjectCreate, user_id: UUID):
    db_project = Project(**project.model_dump(), user_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, project_id: UUID, project: ProjectUpdate):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        update_data = project.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
        db.commit()
        db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: UUID):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project

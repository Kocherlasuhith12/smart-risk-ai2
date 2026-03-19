"""Project CRUD routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db, Project, User
from app.schemas.schemas import ProjectCreate, ProjectOut, ProjectUpdate
from app.utils.auth import get_current_user, require_roles

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post(
    "/",
    response_model=ProjectOut,
    status_code=201,
    dependencies=[Depends(require_roles("admin", "project_manager", "team_lead"))],
)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = Project(**data.model_dump(), owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get(
    "/",
    response_model=List[ProjectOut],
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return db.query(Project).order_by(Project.created_at.desc()).all()
    return db.query(Project).filter(Project.owner_id == current_user.id).order_by(Project.created_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put(
    "/{project_id}",
    response_model=ProjectOut,
    dependencies=[Depends(require_roles("admin", "project_manager", "team_lead"))],
)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Access: admin can edit any, others only their own.
    if current_user.role != "admin" and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    updates = data.model_dump(exclude_unset=True, exclude_none=True)
    for k, v in updates.items():
        setattr(project, k, v)

    # Invalidate prior prediction when core parameters change.
    project.predicted_risk = None
    project.risk_score = None

    db.commit()
    db.refresh(project)
    return project


@router.delete(
    "/{project_id}",
    status_code=204,
    dependencies=[Depends(require_roles("admin", "project_manager"))],
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()

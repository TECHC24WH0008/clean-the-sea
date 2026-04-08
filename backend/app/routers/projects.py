"""回収プロジェクトAPIルーター"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import RecoveryProject
from ..schemas import ProjectDetailResponse, ProjectListResponse, ProjectSummaryResponse

router = APIRouter(prefix="/api", tags=["projects"])


@router.get("/projects", response_model=ProjectListResponse)
def get_projects(db: Session = Depends(get_db)) -> ProjectListResponse:
    projects = db.query(RecoveryProject).all()
    return ProjectListResponse(
        projects=[
            ProjectSummaryResponse(
                id=p.id,
                location_name=p.location_name,
                recovered_tons=p.recovered_tons,
                photo_url=p.photo_url,
                conducted_at=p.conducted_at,
            )
            for p in projects
        ]
    )


@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)) -> ProjectDetailResponse:
    project = db.get(RecoveryProject, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="指定されたプロジェクトが見つかりません。")
    return ProjectDetailResponse(
        id=project.id,
        location_name=project.location_name,
        recovered_tons=project.recovered_tons,
        photo_url=project.photo_url,
        conducted_at=project.conducted_at,
        description=project.description,
    )

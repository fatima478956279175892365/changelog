from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.session import get_session
from app.models.project import Project
from app.models.update import Update
from app.schemas.project import ProjectCreate, ProjectDetail, ProjectRead
from app.schemas.update import UpdateRead
from app.utils.slug import make_unique_slug

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def list_projects(session: AsyncSession = Depends(get_session)) -> list[Project]:
    result = await session.execute(select(Project).order_by(Project.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    session: AsyncSession = Depends(get_session),
) -> Project:
    existing = await session.execute(select(Project.slug))
    slugs = {row[0] for row in existing.all()}
    slug = make_unique_slug(payload.name, slugs)

    project = Project(name=payload.name.strip(), slug=slug)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


@router.get("/slug/{slug}", response_model=ProjectDetail)
async def get_project_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> ProjectDetail:
    result = await session.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updates_result = await session.execute(
        select(Update)
        .where(Update.project_id == project.id)
        .order_by(Update.created_at.desc())
    )
    updates = [UpdateRead.model_validate(u) for u in updates_result.scalars().all()]
    return ProjectDetail(
        id=project.id,
        name=project.name,
        slug=project.slug,
        created_at=project.created_at,
        updates=updates,
    )


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: int,
    session: AsyncSession = Depends(get_session),
) -> Project:
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

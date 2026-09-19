from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from app.db.session import get_session
from app.models.project import Project
from app.models.subscriber import Subscriber
from app.models.update import Update, UpdateType
from app.schemas.update import (
    PaginatedUpdates,
    UpdateCreate,
    UpdateFromCommit,
    UpdateRead,
)
from app.services.email_service import notify_subscribers
from app.services.git_parser import parse_commit_message
from app.services.transform import transform_update

router = APIRouter(prefix="/updates", tags=["updates"])


async def _get_project_or_404(session: AsyncSession, project_id: int) -> Project:
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def _create_update_record(
    session: AsyncSession,
    project: Project,
    *,
    title: str,
    description: str,
    update_type=None,
    release_tag: str | None = None,
    commit_source: str | None = None,
) -> Update:
    transformed = transform_update(title, description, update_type)

    update = Update(
        project_id=project.id,
        title=title.strip(),
        description=description.strip(),
        type=transformed["type"],
        release_tag=release_tag,
        developer_view=transformed["developer_view"],
        customer_view=transformed["customer_view"],
        internal_view=transformed["internal_view"],
        commit_source=commit_source,
    )
    session.add(update)
    await session.commit()
    await session.refresh(update)

    subs_result = await session.execute(
        select(Subscriber.email).where(Subscriber.project_id == project.id)
    )
    emails = [row[0] for row in subs_result.all()]
    await notify_subscribers(project.name, emails, update.title)

    return update


@router.post("", response_model=UpdateRead, status_code=status.HTTP_201_CREATED)
async def create_update(
    payload: UpdateCreate,
    session: AsyncSession = Depends(get_session),
) -> Update:
    project = await _get_project_or_404(session, payload.project_id)
    return await _create_update_record(
        session,
        project,
        title=payload.title,
        description=payload.description,
        update_type=payload.type,
        release_tag=payload.release_tag,
        commit_source=payload.commit_source,
    )


@router.post("/from-commit", response_model=UpdateRead, status_code=status.HTTP_201_CREATED)
async def create_update_from_commit(
    payload: UpdateFromCommit,
    session: AsyncSession = Depends(get_session),
) -> Update:
    project = await _get_project_or_404(session, payload.project_id)
    parsed = parse_commit_message(payload.commit_message)
    return await _create_update_record(
        session,
        project,
        title=parsed["title"],
        description=parsed["description"],
        update_type=parsed["type"],
        commit_source=parsed["commit_source"],
    )


@router.get("", response_model=PaginatedUpdates)
async def list_updates(
    project_id: int = Query(...),
    type: UpdateType | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> PaginatedUpdates:
    await _get_project_or_404(session, project_id)

    filters = [Update.project_id == project_id]
    if type is not None:
        filters.append(Update.type == type)

    count_result = await session.execute(
        select(func.count()).select_from(Update).where(*filters)
    )
    total = count_result.scalar_one()

    offset = (page - 1) * page_size
    result = await session.execute(
        select(Update)
        .where(*filters)
        .order_by(Update.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    items = list(result.scalars().all())

    return PaginatedUpdates(
        items=[UpdateRead.model_validate(u) for u in items],
        total=total,
        page=page,
        page_size=page_size,
    )

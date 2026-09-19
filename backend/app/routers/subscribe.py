from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.session import get_session
from app.models.project import Project
from app.models.subscriber import Subscriber
from app.schemas.subscriber import SubscribeCreate, SubscribeRead

router = APIRouter(tags=["subscriptions"])


@router.post("/subscribe", response_model=SubscribeRead, status_code=status.HTTP_201_CREATED)
async def subscribe(
    payload: SubscribeCreate,
    session: AsyncSession = Depends(get_session),
) -> Subscriber:
    result = await session.execute(
        select(Project).where(Project.slug == payload.project_slug)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = await session.execute(
        select(Subscriber).where(
            Subscriber.project_id == project.id,
            Subscriber.email == payload.email.lower(),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already subscribed")

    subscriber = Subscriber(
        project_id=project.id,
        email=payload.email.lower(),
    )
    session.add(subscriber)
    await session.commit()
    await session.refresh(subscriber)
    return subscriber

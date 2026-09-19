from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.update import UpdateRead


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    created_at: datetime


class ProjectDetail(ProjectRead):
    updates: list[UpdateRead] = []

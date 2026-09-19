from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.update import UpdateType


class UpdateCreate(BaseModel):
    project_id: int
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1)
    type: UpdateType | None = None
    release_tag: str | None = Field(default=None, max_length=100)
    commit_source: str | None = Field(default=None, max_length=500)


class UpdateFromCommit(BaseModel):
    project_id: int
    commit_message: str = Field(min_length=1)


class UpdateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    description: str
    type: UpdateType
    created_at: datetime
    release_tag: str | None = None
    developer_view: str
    customer_view: str
    internal_view: str
    commit_source: str | None = None


class PaginatedUpdates(BaseModel):
    items: list[UpdateRead]
    total: int
    page: int
    page_size: int


class PublicUpdateRead(BaseModel):
    id: int
    title: str
    type: UpdateType
    created_at: datetime
    release_tag: str | None = None
    customer_view: str


class PublicChangelog(BaseModel):
    project_id: int
    project_name: str
    project_slug: str
    items: list[PublicUpdateRead]
    total: int
    page: int
    page_size: int

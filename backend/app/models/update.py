from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils.datetime import utc_now

if TYPE_CHECKING:
    from app.models.project import Project


class UpdateType(str, Enum):
    FEATURE = "FEATURE"
    BUGFIX = "BUGFIX"
    IMPROVEMENT = "IMPROVEMENT"


class Update(SQLModel, table=True):
    __tablename__ = "updates"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    title: str = Field(max_length=500)
    description: str
    type: UpdateType = Field(index=True)
    created_at: datetime = Field(default_factory=utc_now)
    release_tag: Optional[str] = Field(default=None, max_length=100)
    developer_view: str
    customer_view: str
    internal_view: str
    commit_source: Optional[str] = Field(default=None, max_length=500)

    project: Optional["Project"] = Relationship(back_populates="updates")

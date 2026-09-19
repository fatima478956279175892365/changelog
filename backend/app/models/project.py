from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils.datetime import utc_now

if TYPE_CHECKING:
    from app.models.subscriber import Subscriber
    from app.models.update import Update


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    slug: str = Field(max_length=100, unique=True, index=True)
    created_at: datetime = Field(default_factory=utc_now)

    updates: list["Update"] = Relationship(back_populates="project")
    subscribers: list["Subscriber"] = Relationship(back_populates="project")

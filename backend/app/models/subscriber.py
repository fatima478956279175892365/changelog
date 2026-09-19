from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils.datetime import utc_now

if TYPE_CHECKING:
    from app.models.project import Project


class Subscriber(SQLModel, table=True):
    __tablename__ = "subscribers"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    email: str = Field(max_length=320, index=True)
    created_at: datetime = Field(default_factory=utc_now)

    project: Optional["Project"] = Relationship(back_populates="subscribers")

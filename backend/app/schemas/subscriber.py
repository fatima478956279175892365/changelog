from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SubscribeCreate(BaseModel):
    project_slug: str = Field(min_length=1, max_length=100)
    email: EmailStr


class SubscribeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    email: str
    created_at: datetime

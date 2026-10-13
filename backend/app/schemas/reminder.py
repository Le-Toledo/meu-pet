from datetime import datetime

from pydantic import BaseModel, Field


class ReminderCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    reminder_at: datetime
    completed: bool = False


class ReminderUpdate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    reminder_at: datetime
    completed: bool


class ReminderResponse(BaseModel):
    id: int
    pet_id: int
    title: str
    description: str | None
    reminder_at: datetime
    completed: bool

    model_config = {
        "from_attributes": True
    }

class PetLostModeUpdate(BaseModel):
    is_lost: bool
    lost_message: str | None = Field(
        default=None,
        max_length=500,
    )
    contact_name: str | None = Field(
        default=None,
        max_length=100,
    )
    contact_phone: str | None = Field(
        default=None,
        max_length=30,
    )
from datetime import date

from pydantic import BaseModel, Field


class PetBase(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    species: str = Field(min_length=2, max_length=30)
    breed: str | None = Field(default=None, max_length=50)
    birth_date: date | None = None
    weight: float | None = Field(default=None, gt=0)
    sex: str | None = Field(default=None, max_length=10)
    color: str | None = Field(default=None, max_length=50)
    is_lost: bool = False
    photo_url: str | None = None

    lost_message: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None


class PetCreate(PetBase):
    pass


class PetUpdate(PetBase):
    pass


class PetResponse(PetBase):
    id: int
    public_id: str

    model_config = {
        "from_attributes": True
    }


class PetPublicResponse(BaseModel):
    public_id: str
    name: str
    species: str
    breed: str | None
    birth_date: date | None
    sex: str | None
    color: str | None
    is_lost: bool
    photo_url: str | None = None

    lost_message: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None

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
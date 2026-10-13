from datetime import date

from pydantic import BaseModel, Field


class VetVisitCreate(BaseModel):
    visit_date: date

    veterinarian: str | None = Field(
        default=None,
        max_length=100,
    )

    clinic: str | None = Field(
        default=None,
        max_length=150,
    )

    reason: str = Field(
        min_length=2,
        max_length=255,
    )

    diagnosis: str | None = Field(
        default=None,
        max_length=500,
    )

    notes: str | None = Field(
        default=None,
        max_length=1000,
    )

    next_visit_date: date | None = None


class VetVisitUpdate(VetVisitCreate):
    pass


class VetVisitResponse(VetVisitCreate):
    id: int
    pet_id: int

    model_config = {
        "from_attributes": True
    }
from datetime import date

from pydantic import BaseModel, Field


class PetWeightCreate(BaseModel):
    weight: float = Field(gt=0)
    recorded_at: date


class PetWeightResponse(BaseModel):
    id: int
    pet_id: int
    weight: float
    recorded_at: date

    model_config = {
        "from_attributes": True
    }
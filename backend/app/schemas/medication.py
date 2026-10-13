from datetime import date

from pydantic import BaseModel, Field


class MedicationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    dosage: str = Field(min_length=1, max_length=100)
    frequency: str = Field(min_length=1, max_length=100)
    start_date: date
    end_date: date | None = None


class MedicationUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    dosage: str = Field(min_length=1, max_length=100)
    frequency: str = Field(min_length=1, max_length=100)
    start_date: date
    end_date: date | None = None


class MedicationResponse(BaseModel):
    id: int
    pet_id: int
    name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: date | None

    model_config = {
        "from_attributes": True
    }

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MedicationDoseCreate(BaseModel):
    administered_at: datetime
    dosage: str = Field(min_length=1, max_length=100)
    notes: str | None = Field(default=None, max_length=500)


class MedicationDoseUpdate(BaseModel):
    administered_at: datetime
    dosage: str = Field(min_length=1, max_length=100)
    notes: str | None = Field(default=None, max_length=500)


class MedicationDoseResponse(BaseModel):
    id: int
    medication_id: int
    administered_at: datetime
    dosage: str
    notes: str | None

    model_config = ConfigDict(from_attributes=True)

from datetime import date, datetime

from pydantic import BaseModel


class WeightSummary(BaseModel):
    weight: float
    recorded_at: date

    model_config = {
        "from_attributes": True
    }


class VaccineSummary(BaseModel):
    id: int
    name: str
    next_dose_date: date | None

    model_config = {
        "from_attributes": True
    }


class MedicationSummary(BaseModel):
    id: int
    name: str
    dosage: str
    frequency: str
    end_date: date | None

    model_config = {
        "from_attributes": True
    }


class ReminderSummary(BaseModel):
    id: int
    title: str
    reminder_at: datetime

    model_config = {
        "from_attributes": True
    }


class VetVisitSummary(BaseModel):
    id: int
    veterinarian: str | None
    clinic: str | None
    next_visit_date: date | None

    model_config = {
        "from_attributes": True
    }


class PetSummaryResponse(BaseModel):
    id: int
    public_id: str
    name: str
    species: str
    breed: str | None
    photo_url: str | None
    is_lost: bool

    latest_weight: WeightSummary | None
    next_vaccine: VaccineSummary | None
    medications: list[MedicationSummary]
    next_reminder: ReminderSummary | None
    next_vet_visit: VetVisitSummary | None
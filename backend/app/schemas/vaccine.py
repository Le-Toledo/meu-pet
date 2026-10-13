from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field


class VaccineCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    application_date: date
    next_dose_date: date | None = None
    price: Decimal | None = None
    

class VaccineUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    application_date: date
    next_dose_date: date | None = None    
    price: Decimal | None = None


class VaccineResponse(BaseModel):
    id: int
    pet_id: int
    name: str
    application_date: date
    next_dose_date: date | None
    price: Decimal | None = None

    model_config = {
        "from_attributes": True
    }
from datetime import date, datetime

from sqlalchemy.orm import Session

from app.models.medication import Medication
from app.models.pet import Pet
from app.models.pet_weight import PetWeight
from app.models.reminder import Reminder
from app.models.vaccine import Vaccine
from app.models.vet_visit import VetVisit


def get_pet_summary(
    db: Session,
    pet_id: int,
    owner_id: int,
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == owner_id,
        )
        .first()
    )

    if pet is None:
        return None

    latest_weight = (
        db.query(PetWeight)
        .filter(PetWeight.pet_id == pet_id)
        .order_by(PetWeight.recorded_at.desc())
        .first()
    )

    next_vaccine = (
        db.query(Vaccine)
        .filter(
            Vaccine.pet_id == pet_id,
            Vaccine.next_dose_date >= date.today(),
        )
        .order_by(Vaccine.next_dose_date.asc())
        .first()
    )

    medications = (
        db.query(Medication)
        .filter(
            Medication.pet_id == pet_id,
            (Medication.end_date.is_(None))
            | (Medication.end_date >= date.today()),
        )
        .order_by(Medication.start_date.asc())
        .all()
    )

    next_reminder = (
        db.query(Reminder)
        .filter(
            Reminder.pet_id == pet_id,
            Reminder.reminder_at >= datetime.now(),
            Reminder.completed.is_(False),
        )
        .order_by(Reminder.reminder_at.asc())
        .first()
    )

    next_vet_visit = (
        db.query(VetVisit)
        .filter(
            VetVisit.pet_id == pet_id,
            VetVisit.next_visit_date >= date.today(),
        )
        .order_by(VetVisit.next_visit_date.asc())
        .first()
    )

    return {
        "id": pet.id,
        "public_id": pet.public_id,
        "name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "photo_url": pet.photo_url,
        "is_lost": pet.is_lost,
        "latest_weight": latest_weight,
        "next_vaccine": next_vaccine,
        "medications": medications,
        "next_reminder": next_reminder,
        "next_vet_visit": next_vet_visit,
    }
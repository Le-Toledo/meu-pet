
from sqlalchemy.orm import Session

from app.models.vaccine import Vaccine
from app.schemas.vaccine import VaccineCreate, VaccineUpdate


def create_vaccine(
    db: Session,
    pet_id: int,
    vaccine_data: VaccineCreate,
):
    new_vaccine = Vaccine(
        pet_id=pet_id,
        name=vaccine_data.name,
        application_date=vaccine_data.application_date,
        next_dose_date=vaccine_data.next_dose_date,
        price=vaccine_data.price,
    )

    db.add(new_vaccine)
    db.commit()
    db.refresh(new_vaccine)

    return new_vaccine


def get_pet_vaccines(
    db: Session,
    pet_id: int,
):
    return (
        db.query(Vaccine)
        .filter(Vaccine.pet_id == pet_id)
        .order_by(Vaccine.application_date.desc())
        .all()
    )


def get_vaccine_by_id(
    db: Session,
    vaccine_id: int,
    pet_id: int,
):
    return (
        db.query(Vaccine)
        .filter(
            Vaccine.id == vaccine_id,
            Vaccine.pet_id == pet_id,
        )
        .first()
    )


def update_vaccine(
    db: Session,
    vaccine: Vaccine,
    vaccine_data: VaccineUpdate,
):
    vaccine.name = vaccine_data.name
    vaccine.application_date = vaccine_data.application_date
    vaccine.next_dose_date = vaccine_data.next_dose_date
    vaccine.price = vaccine_data.price

    db.commit()
    db.refresh(vaccine)

    return vaccine


def delete_vaccine(
    db: Session,
    vaccine: Vaccine,
):
    db.delete(vaccine)
    db.commit()

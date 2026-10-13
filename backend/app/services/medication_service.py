from sqlalchemy.orm import Session
from app.models.medication_dose import MedicationDose
from app.models.medication import Medication
from app.schemas.medication import MedicationCreate, MedicationUpdate


def create_medication(
    db: Session,
    pet_id: int,
    medication_data: MedicationCreate,
):
    new_medication = Medication(
        pet_id=pet_id,
        name=medication_data.name,
        dosage=medication_data.dosage,
        frequency=medication_data.frequency,
        start_date=medication_data.start_date,
        end_date=medication_data.end_date,
    )

    db.add(new_medication)
    db.commit()
    db.refresh(new_medication)

    return new_medication


def get_pet_medications(
    db: Session,
    pet_id: int,
):
    return (
        db.query(Medication)
        .filter(Medication.pet_id == pet_id)
        .order_by(Medication.start_date.desc())
        .all()
    )


def get_medication_by_id(
    db: Session,
    medication_id: int,
    pet_id: int,
):
    return (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.pet_id == pet_id,
        )
        .first()
    )


def update_medication(
    db: Session,
    medication: Medication,
    medication_data: MedicationUpdate,
):
    medication.name = medication_data.name
    medication.dosage = medication_data.dosage
    medication.frequency = medication_data.frequency
    medication.start_date = medication_data.start_date
    medication.end_date = medication_data.end_date

    db.commit()
    db.refresh(medication)

    return medication


def delete_medication(
    db: Session,
    medication: Medication,
):
    has_history = (
        db.query(MedicationDose.id)
        .filter(MedicationDose.medication_id == medication.id)
        .first()
    )

    if has_history:
        return False

    db.delete(medication)
    db.commit()
    return True
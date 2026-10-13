
from sqlalchemy.orm import Session

from app.models.medication_dose import MedicationDose
from app.schemas.medication_dose import (
    MedicationDoseCreate,
    MedicationDoseUpdate,
)


def create_medication_dose(
    db: Session,
    medication_id: int,
    dose_data: MedicationDoseCreate,
):
    dose = MedicationDose(
        medication_id=medication_id,
        administered_at=dose_data.administered_at,
        dosage=dose_data.dosage,
        notes=dose_data.notes,
    )

    db.add(dose)
    db.commit()
    db.refresh(dose)

    return dose


def get_medication_doses(
    db: Session,
    medication_id: int,
):
    return (
        db.query(MedicationDose)
        .filter(MedicationDose.medication_id == medication_id)
        .order_by(MedicationDose.administered_at.desc())
        .all()
    )


def get_medication_dose_by_id(
    db: Session,
    dose_id: int,
    medication_id: int,
):
    return (
        db.query(MedicationDose)
        .filter(
            MedicationDose.id == dose_id,
            MedicationDose.medication_id == medication_id,
        )
        .first()
    )


def update_medication_dose(
    db: Session,
    dose: MedicationDose,
    dose_data: MedicationDoseUpdate,
):
    dose.administered_at = dose_data.administered_at
    dose.dosage = dose_data.dosage
    dose.notes = dose_data.notes

    db.commit()
    db.refresh(dose)

    return dose


def delete_medication_dose(
    db: Session,
    dose: MedicationDose,
):
    db.delete(dose)
    db.commit()

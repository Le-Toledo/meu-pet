
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.medication_dose import (
    MedicationDoseCreate,
    MedicationDoseUpdate,
    MedicationDoseResponse,
)
from app.services.pet_service import get_pet_by_id
from app.services.medication_service import get_medication_by_id
from app.services.medication_dose_service import (
    create_medication_dose,
    get_medication_doses,
    get_medication_dose_by_id,
    update_medication_dose,
    delete_medication_dose,
)


router = APIRouter(
    prefix="/pets",
    tags=["Medication Doses"],
)


def verify_medication(
    db: Session,
    pet_id: int,
    medication_id: int,
    user_id: int,
):
    pet = get_pet_by_id(db, pet_id, user_id)

    if pet is None:
        raise HTTPException(
            status_code=404,
            detail="Pet not found",
        )

    medication = get_medication_by_id(
        db, medication_id, pet_id
    )

    if medication is None:
        raise HTTPException(
            status_code=404,
            detail="Medication not found",
        )

    return medication


@router.post(
    "/{pet_id}/medications/{medication_id}/doses",
    response_model=MedicationDoseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_dose_route(
    pet_id: int,
    medication_id: int,
    dose_data: MedicationDoseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_medication(
        db, pet_id, medication_id, current_user.id
    )

    return create_medication_dose(
        db, medication_id, dose_data
    )


@router.get(
    "/{pet_id}/medications/{medication_id}/doses",
    response_model=list[MedicationDoseResponse],
)
def list_doses_route(
    pet_id: int,
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_medication(
        db, pet_id, medication_id, current_user.id
    )

    return get_medication_doses(db, medication_id)


@router.put(
    "/{pet_id}/medications/{medication_id}/doses/{dose_id}",
    response_model=MedicationDoseResponse,
)
def update_dose_route(
    pet_id: int,
    medication_id: int,
    dose_id: int,
    dose_data: MedicationDoseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_medication(
        db, pet_id, medication_id, current_user.id
    )

    dose = get_medication_dose_by_id(
        db, dose_id, medication_id
    )

    if dose is None:
        raise HTTPException(
            status_code=404,
            detail="Dose not found",
        )

    return update_medication_dose(
        db, dose, dose_data
    )


@router.delete(
    "/{pet_id}/medications/{medication_id}/doses/{dose_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_dose_route(
    pet_id: int,
    medication_id: int,
    dose_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_medication(
        db, pet_id, medication_id, current_user.id
    )

    dose = get_medication_dose_by_id(
        db, dose_id, medication_id
    )

    if dose is None:
        raise HTTPException(
            status_code=404,
            detail="Dose not found",
        )

    delete_medication_dose(db, dose)

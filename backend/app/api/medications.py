from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.medication import (
    MedicationCreate,
    MedicationResponse,
    MedicationUpdate,
)
from app.services.medication_service import (
    create_medication,
    delete_medication,
    get_medication_by_id,
    get_pet_medications,
    update_medication,
)
from app.services.pet_service import get_pet_by_id


router = APIRouter(
    prefix="/pets",
    tags=["Medications"],
)


@router.post(
    "/{pet_id}/medications",
    response_model=MedicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_medication_route(
    pet_id: int,
    medication_data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(db, pet_id, current_user.id)

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return create_medication(
        db,
        pet_id,
        medication_data,
    )


@router.get(
    "/{pet_id}/medications",
    response_model=list[MedicationResponse],
)
def list_medications(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(db, pet_id, current_user.id)

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return get_pet_medications(db, pet_id)


@router.put(
    "/{pet_id}/medications/{medication_id}",
    response_model=MedicationResponse,
)
def update_medication_route(
    pet_id: int,
    medication_id: int,
    medication_data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(db, pet_id, current_user.id)

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    medication = get_medication_by_id(
        db,
        medication_id,
        pet_id,
    )

    if medication is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found",
        )

    return update_medication(
        db,
        medication,
        medication_data,
    )


@router.delete(
    "/{pet_id}/medications/{medication_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_medication_route(
    pet_id: int,
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(db, pet_id, current_user.id)

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    medication = get_medication_by_id(
        db,
        medication_id,
        pet_id,
    )

    if medication is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found",
        )

    deleted = delete_medication(db, medication)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Medication has dose history and cannot be deleted",
    )
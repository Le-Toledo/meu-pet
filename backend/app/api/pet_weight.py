from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.pet_weight import PetWeightCreate, PetWeightResponse
from app.services.pet_service import get_pet_by_id
from app.services.pet_weight_service import (
    create_pet_weight,
    get_pet_weights,
)


router = APIRouter(
    prefix="/pets",
    tags=["Pet Weights"],
)


@router.post(
    "/{pet_id}/weights",
    response_model=PetWeightResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_weight(
    pet_id: int,
    weight_data: PetWeightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(
        db,
        pet_id,
        current_user.id,
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return create_pet_weight(
        db,
        pet,
        weight_data,
    )


@router.get(
    "/{pet_id}/weights",
    response_model=list[PetWeightResponse],
)
def list_weights(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(
        db,
        pet_id,
        current_user.id,
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return get_pet_weights(
        db,
        pet_id,
    )
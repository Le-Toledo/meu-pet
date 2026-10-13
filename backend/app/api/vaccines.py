from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.vaccine import VaccineCreate, VaccineResponse, VaccineUpdate
from app.services.pet_service import get_pet_by_id
from app.services.vaccine_service import ( 
    create_vaccine, 
    get_pet_vaccines, 
    get_vaccine_by_id, 
    update_vaccine,
    delete_vaccine
)

router = APIRouter(
    prefix="/pets",
    tags=["Vaccines"],
)


@router.post(
    "/{pet_id}/vaccines",
    response_model=VaccineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vaccine_route(
    pet_id: int,
    vaccine_data: VaccineCreate,
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

    return create_vaccine(
        db,
        pet_id,
        vaccine_data,
    )

@router.get(
    "/{pet_id}/vaccines",
    response_model=list[VaccineResponse],
)
def list_vaccines(
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

    return get_pet_vaccines(
        db,
        pet_id,
    )

@router.put(
    "/{pet_id}/vaccines/{vaccine_id}",
    response_model=VaccineResponse,
)
def update_vaccine_route(
    pet_id: int,
    vaccine_id: int,
    vaccine_data: VaccineUpdate,
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

    vaccine = get_vaccine_by_id(
        db,
        vaccine_id,
        pet_id,
    )

    if vaccine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccine not found",
        )

    return update_vaccine(
        db,
        vaccine,
        vaccine_data,
    )

@router.delete(
    "/{pet_id}/vaccines/{vaccine_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_vaccine_route(
    pet_id: int,
    vaccine_id: int,
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

    vaccine = get_vaccine_by_id(
        db,
        vaccine_id,
        pet_id,
    )

    if vaccine is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccine not found",
        )

    delete_vaccine(
        db,
        vaccine,
    )
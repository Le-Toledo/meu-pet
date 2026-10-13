from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.pet import Pet
from app.models.user import User
from app.schemas.vet_visit import (
    VetVisitCreate,
    VetVisitResponse,
    VetVisitUpdate,
)
from app.services.vet_visit_service import (
    create_vet_visit,
    delete_vet_visit,
    get_pet_vet_visits,
    get_vet_visit_by_id,
    update_vet_visit,
)


router = APIRouter(
    prefix="/vet-visits",
    tags=["Vet Visits"],
)


@router.post(
    "/pets/{pet_id}",
    response_model=VetVisitResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_pet_vet_visit(
    pet_id: int,
    visit_data: VetVisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return create_vet_visit(
        db,
        pet_id,
        visit_data,
    )


@router.get(
    "/pets/{pet_id}",
    response_model=list[VetVisitResponse],
)
def list_pet_vet_visits(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return get_pet_vet_visits(
        db,
        pet_id,
    )


@router.get(
    "/pets/{pet_id}/{visit_id}",
    response_model=VetVisitResponse,
)
def get_pet_vet_visit(
    pet_id: int,
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    visit = get_vet_visit_by_id(
        db,
        visit_id,
        pet_id,
    )

    if visit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet visit not found",
        )

    return visit


@router.put(
    "/pets/{pet_id}/{visit_id}",
    response_model=VetVisitResponse,
)
def edit_pet_vet_visit(
    pet_id: int,
    visit_id: int,
    visit_data: VetVisitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    visit = get_vet_visit_by_id(
        db,
        visit_id,
        pet_id,
    )

    if visit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet visit not found",
        )

    return update_vet_visit(
        db,
        visit,
        visit_data,
    )


@router.delete(
    "/pets/{pet_id}/{visit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_pet_vet_visit(
    pet_id: int,
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    visit = get_vet_visit_by_id(
        db,
        visit_id,
        pet_id,
    )

    if visit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet visit not found",
        )

    delete_vet_visit(
        db,
        visit,
    )

    return None
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetResponse, PetUpdate, PetLostModeUpdate
from app.services.pet_service import (
    get_pet_by_id, 
    get_all_pets, 
    create_pet,
    update_pet,
    delete_pet,
)
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.file_service import save_pet_photo
from app.schemas.pet_summary import PetSummaryResponse
from app.services.pet_summary_service import get_pet_summary





router = APIRouter(
    prefix="/pets",
    tags=["Pets"],
)

@router.get(
    "/{pet_id}/summary",
    response_model=PetSummaryResponse,
)
def get_summary(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = get_pet_summary(
        db,
        pet_id,
        current_user.id,
    )

    if summary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return summary

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_pet_route(
    pet: PetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_pet = create_pet(db, pet, current_user.id)


    return {
        "message": "Pet cadastrado com sucesso!",
        "pet": {
            "id": new_pet.id,
            "name": new_pet.name,
            "species": new_pet.species,
            "breed": new_pet.breed,
            "birth_date": new_pet.birth_date,
            "weight": new_pet.weight,
        },

        
    }

@router.get("/", response_model=list[PetResponse])
def list_pets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pets = get_all_pets(
        db,
        current_user.id,
    )

    return pets


@router.get("/{pet_id}", response_model=PetResponse)
def get_pet(
    pet_id: int,
    photo: UploadFile = File(...),
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
            detail="Pet not found"
        )

    try:
        filename = save_pet_photo(file)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format",
        )

    pet.photo_url = f"/pets/{pet.id}/photo"

    db.commit()
    db.refresh(pet)

    return pet

@router.put("/{pet_id}", response_model=PetResponse)
def update_pet_route(
    pet_id: int,
    pet_data: PetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(db, pet_id)

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return update_pet(
        db,
        pet,
        pet_data,
    )

@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT,
)
def delete_pet_route(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pet = get_pet_by_id(db, pet_id, current_user.id)

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    delete_pet(db, pet)


@router.post(
    "/{pet_id}/photo",
    response_model=PetResponse,
)
def upload_pet_photo(
    pet_id: int,
    file: UploadFile = File(...),
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

    try:
        filename = save_pet_photo(file)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format",
        )

    pet.photo_url = filename

    db.commit()
    db.refresh(pet)

    return pet


@router.get("/{pet_id}/photo")
def get_pet_photo(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_pet_by_id(
        db,
        pet_id,
        current_user.id,
    )

    if pet is None or pet.photo_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet photo not found",
        )

    file_path = f"uploads/pets/{pet.photo_url}"

    return FileResponse(file_path)


@router.patch(
    "/{pet_id}/lost-mode",
    response_model=PetResponse,
)
def update_lost_mode(
    pet_id: int,
    lost_data: PetLostModeUpdate,
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

    pet.is_lost = lost_data.is_lost
    pet.lost_message = lost_data.lost_message
    pet.contact_name = lost_data.contact_name
    pet.contact_phone = lost_data.contact_phone

    db.commit()
    db.refresh(pet)

    return pet
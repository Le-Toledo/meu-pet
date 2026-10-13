from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.pet import PetPublicResponse
from app.services.pet_service import get_pet_by_public_id
from fastapi.responses import StreamingResponse, FileResponse
from app.services.qr_code_service import generate_pet_qr_code
from pathlib import Path


router = APIRouter(
    prefix="/public/pets",
    tags=["Public Pet ID"],
)


@router.get(
    "/{public_id}",
    response_model=PetPublicResponse,
)
def get_public_pet(
    public_id: str,
    db: Session = Depends(get_db),
):
    pet = get_pet_by_public_id(
        db,
        public_id,
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    return PetPublicResponse(
        public_id=pet.public_id,
        name=pet.name,
        species=pet.species,
        breed=pet.breed,
        birth_date=pet.birth_date,
        sex=pet.sex,
        color=pet.color,
        is_lost=pet.is_lost,
        photo_url=pet.photo_url,
        lost_message=(
            pet.lost_message
            if pet.is_lost
            else None
        ),
        contact_name=(
            pet.contact_name
            if pet.is_lost
            else None
        ),
        contact_phone=(
            pet.contact_phone
            if pet.is_lost
            else None
        ),
    )

@router.get("/{public_id}/qr")
def get_pet_qr_code(
    public_id: str,
    db: Session = Depends(get_db),
):
    pet = get_pet_by_public_id(
        db,
        public_id,
    )

    if pet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found",
        )

    pet_url = (
        f"http://127.0.0.1:8000/public/pets/{pet.public_id}"
    )

    qr_code = generate_pet_qr_code(pet_url)

    return StreamingResponse(
        qr_code,
        media_type="image/png",
    )

@router.get("/{public_id}/photo")
def get_public_pet_photo(
    public_id: str,
    db: Session = Depends(get_db),
):
    pet = get_pet_by_public_id(
        db,
        public_id,
    )

    if pet is None or pet.photo_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet photo not found",
        )

    file_path = Path("uploads/pets") / pet.photo_url

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet photo file not found",
        )

    return FileResponse(file_path)
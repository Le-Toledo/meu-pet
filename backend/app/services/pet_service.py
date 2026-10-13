from sqlalchemy.orm import Session
from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetUpdate


def get_pet_by_id(
    db: Session,
    pet_id: int,
    owner_id: int,
):
    return (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == owner_id,
        )
        .first()
    )

def get_all_pets(
    db: Session,
    owner_id: int,
):
    return (
        db.query(Pet)
        .filter(Pet.owner_id == owner_id)
        .all()
    )

def create_pet(
    db: Session,
    pet_data: PetCreate,
    owner_id: int,
):
    new_pet = Pet(
        name=pet_data.name,
        species=pet_data.species,
        breed=pet_data.breed,
        birth_date=pet_data.birth_date,
        weight=pet_data.weight,
        owner_id=owner_id,
    )

    db.add(new_pet)
    db.commit()
    db.refresh(new_pet)

    return new_pet

def update_pet(db: Session, pet: Pet, pet_data: PetUpdate):
    pet.name = pet_data.name
    pet.species = pet_data.species
    pet.breed = pet_data.breed
    pet.birth_date = pet_data.birth_date
    pet.weight = pet_data.weight

    db.commit()
    db.refresh(pet)

    return pet

def delete_pet(db: Session, pet: Pet):
    db.delete(pet)
    db.commit()

def get_pet_by_public_id(
    db: Session,
    public_id: str,
):
    return (
        db.query(Pet)
        .filter(Pet.public_id == public_id)
        .first()
    )
from sqlalchemy.orm import Session
from app.models.pet import Pet
from app.models.pet_weight import PetWeight
from app.schemas.pet_weight import PetWeightCreate


def create_pet_weight(
    db: Session,
    pet: Pet,
    weight_data: PetWeightCreate,
):
    new_weight = PetWeight(
        pet_id=pet.id,
        weight=weight_data.weight,
        recorded_at=weight_data.recorded_at,
    )

    pet.weight = weight_data.weight

    db.add(new_weight)
    db.commit()
    db.refresh(new_weight)
    db.refresh(pet)

    return new_weight


def get_pet_weights(
    db: Session,
    pet_id: int,
):
    return (
        db.query(PetWeight)
        .filter(PetWeight.pet_id == pet_id)
        .order_by(PetWeight.recorded_at.desc())
        .all()
    )
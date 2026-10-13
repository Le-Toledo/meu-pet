from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.pet import Pet
from app.models.user import User
from app.schemas.reminder import (
    ReminderCreate,
    ReminderResponse,
    ReminderUpdate,
)
from app.services.reminder_service import (
    create_reminder,
    delete_reminder,
    get_pet_reminders,
    get_reminder_by_id,
    get_upcoming_reminders,
    update_reminder,
)


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"],
)


@router.get(
    "/upcoming",
    response_model=list[ReminderResponse],
)
def list_upcoming_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_upcoming_reminders(
        db,
        current_user.id,
    )


@router.post(
    "/pets/{pet_id}",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_pet_reminder(
    pet_id: int,
    reminder_data: ReminderCreate,
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

    return create_reminder(
        db,
        pet_id,
        reminder_data,
    )


@router.get(
    "/pets/{pet_id}",
    response_model=list[ReminderResponse],
)
def list_pet_reminders(
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

    return get_pet_reminders(
        db,
        pet_id,
    )


@router.get(
    "/pets/{pet_id}/{reminder_id}",
    response_model=ReminderResponse,
)
def get_pet_reminder(
    pet_id: int,
    reminder_id: int,
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

    reminder = get_reminder_by_id(
        db,
        reminder_id,
        pet_id,
    )

    if reminder is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found",
        )

    return reminder


@router.put(
    "/pets/{pet_id}/{reminder_id}",
    response_model=ReminderResponse,
)
def edit_pet_reminder(
    pet_id: int,
    reminder_id: int,
    reminder_data: ReminderUpdate,
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

    reminder = get_reminder_by_id(
        db,
        reminder_id,
        pet_id,
    )

    if reminder is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found",
        )

    return update_reminder(
        db,
        reminder,
        reminder_data,
    )


@router.delete(
    "/pets/{pet_id}/{reminder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_pet_reminder(
    pet_id: int,
    reminder_id: int,
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

    reminder = get_reminder_by_id(
        db,
        reminder_id,
        pet_id,
    )

    if reminder is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found",
        )

    delete_reminder(
        db,
        reminder,
    )

    return None
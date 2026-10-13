from datetime import datetime

from sqlalchemy.orm import Session

from app.models.pet import Pet
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate, ReminderUpdate


def get_upcoming_reminders(
    db: Session,
    owner_id: int,
):
    return (
        db.query(Reminder)
        .join(
            Pet,
            Reminder.pet_id == Pet.id,
        )
        .filter(
            Pet.owner_id == owner_id,
            Reminder.reminder_at >= datetime.now(),
            Reminder.completed.is_(False),
        )
        .order_by(Reminder.reminder_at.asc())
        .all()
    )


def create_reminder(
    db: Session,
    pet_id: int,
    reminder_data: ReminderCreate,
):
    new_reminder = Reminder(
        pet_id=pet_id,
        title=reminder_data.title,
        description=reminder_data.description,
        reminder_at=reminder_data.reminder_at,
        completed=reminder_data.completed,
    )

    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)

    return new_reminder


def get_pet_reminders(
    db: Session,
    pet_id: int,
):
    return (
        db.query(Reminder)
        .filter(Reminder.pet_id == pet_id)
        .order_by(Reminder.reminder_at.asc())
        .all()
    )


def get_reminder_by_id(
    db: Session,
    reminder_id: int,
    pet_id: int,
):
    return (
        db.query(Reminder)
        .filter(
            Reminder.id == reminder_id,
            Reminder.pet_id == pet_id,
        )
        .first()
    )


def update_reminder(
    db: Session,
    reminder: Reminder,
    reminder_data: ReminderUpdate,
):
    reminder.title = reminder_data.title
    reminder.description = reminder_data.description
    reminder.reminder_at = reminder_data.reminder_at
    reminder.completed = reminder_data.completed

    db.commit()
    db.refresh(reminder)

    return reminder


def delete_reminder(
    db: Session,
    reminder: Reminder,
):
    db.delete(reminder)
    db.commit()
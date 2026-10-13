from sqlalchemy.orm import Session

from app.models.vet_visit import VetVisit
from app.schemas.vet_visit import (
    VetVisitCreate,
    VetVisitUpdate,
)


def create_vet_visit(
    db: Session,
    pet_id: int,
    visit_data: VetVisitCreate,
):
    visit = VetVisit(
        pet_id=pet_id,
        visit_date=visit_data.visit_date,
        veterinarian=visit_data.veterinarian,
        clinic=visit_data.clinic,
        reason=visit_data.reason,
        diagnosis=visit_data.diagnosis,
        notes=visit_data.notes,
        next_visit_date=visit_data.next_visit_date,
    )

    db.add(visit)
    db.commit()
    db.refresh(visit)

    return visit


def get_pet_vet_visits(
    db: Session,
    pet_id: int,
):
    return (
        db.query(VetVisit)
        .filter(VetVisit.pet_id == pet_id)
        .order_by(VetVisit.visit_date.desc())
        .all()
    )


def get_vet_visit_by_id(
    db: Session,
    visit_id: int,
    pet_id: int,
):
    return (
        db.query(VetVisit)
        .filter(
            VetVisit.id == visit_id,
            VetVisit.pet_id == pet_id,
        )
        .first()
    )


def update_vet_visit(
    db: Session,
    visit: VetVisit,
    visit_data: VetVisitUpdate,
):
    visit.visit_date = visit_data.visit_date
    visit.veterinarian = visit_data.veterinarian
    visit.clinic = visit_data.clinic
    visit.reason = visit_data.reason
    visit.diagnosis = visit_data.diagnosis
    visit.notes = visit_data.notes
    visit.next_visit_date = visit_data.next_visit_date

    db.commit()
    db.refresh(visit)

    return visit


def delete_vet_visit(
    db: Session,
    visit: VetVisit,
):
    db.delete(visit)
    db.commit()
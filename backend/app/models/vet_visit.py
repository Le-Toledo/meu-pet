from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class VetVisit(Base):
    __tablename__ = "vet_visits"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id"),
        nullable=False,
        index=True,
    )

    visit_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    veterinarian: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    clinic: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    reason: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    diagnosis: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    next_visit_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    dosage: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    frequency: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Vaccine(Base):
    __tablename__ = "vaccines"

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

    application_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    next_dose_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    ) 
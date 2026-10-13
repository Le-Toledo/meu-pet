from datetime import date
from sqlalchemy import Date, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base


class PetWeight(Base):
    __tablename__ = "pet_weights"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id"),
        nullable=False,
        index=True,
    )

    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    recorded_at: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
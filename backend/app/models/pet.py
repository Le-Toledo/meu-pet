import uuid
from datetime import date

from sqlalchemy import Boolean, Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    public_id: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        nullable=False,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    species: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    breed: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    birth_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    weight: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    sex: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    color: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    is_lost: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    photo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    lost_message: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True,
    )

    contact_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    contact_phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )
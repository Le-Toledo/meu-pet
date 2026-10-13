from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class MedicationDose(Base):
    __tablename__ = "medication_doses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    medication_id: Mapped[int] = mapped_column(
        ForeignKey("medications.id"),
        nullable=False,
        index=True,
    )

    administered_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    dosage: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

"""create medication doses table

Revision ID: b1d1024179f8
Revises: 35fcca5e098f
Create Date: 2026-10-09 18:18:44.263049
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b1d1024179f8"
down_revision: Union[str, Sequence[str], None] = "35fcca5e098f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "medication_doses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("medication_id", sa.Integer(), nullable=False),
        sa.Column("administered_at", sa.DateTime(), nullable=False),
        sa.Column("dosage", sa.String(length=100), nullable=False),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(
            ["medication_id"],
            ["medications.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_medication_doses_id",
        "medication_doses",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_medication_doses_medication_id",
        "medication_doses",
        ["medication_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_medication_doses_medication_id",
        table_name="medication_doses",
    )

    op.drop_index(
        "ix_medication_doses_id",
        table_name="medication_doses",
    )

    op.drop_table("medication_doses")

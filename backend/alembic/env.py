from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from app.database.connection import Base
from app.models.pet import Pet
from app.models.user import User
import os 
from dotenv import load_dotenv
from app.models.pet_weight import PetWeight
from app.models.vaccine import Vaccine
from app.models.medication import Medication
from app.models.reminder import Reminder
from app.models.vet_visit import VetVisit
from app.models.medication_dose import MedicationDose


config = context.config
load_dotenv()
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL não foi configurada.")

config.set_main_option(
    "sqlalchemy.url", database_url,
)


target_metadata = Base.metadata



def run_migrations_offline() -> None:

    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

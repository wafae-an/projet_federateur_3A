from logging.config import fileConfig
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

from sqlalchemy import engine_from_config, pool
from alembic import context

import configparser
configparser.ConfigParser(interpolation=None)

# -------------------------------
# Charger les variables depuis .env
# -------------------------------
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))  # encode les caractères spéciaux
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# -------------------------------
# Config Alembic
# -------------------------------
config = context.config
# Remplace l'URL de la base dans config par celle de ton .env
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

# Configurer le logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# -------------------------------
# Importer la Base contenant tous les modèles
# -------------------------------
from database import Base  # <- adapte le chemin si besoin
target_metadata = Base.metadata

# -------------------------------
# Fonctions de migration
# -------------------------------
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
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

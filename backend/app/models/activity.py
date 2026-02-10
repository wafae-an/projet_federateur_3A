# models/activity.py
import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import relationship
from database import Base  # ✅ utiliser le même Base que pour User
from .user import User  # ✅ late import juste pour le type hint (pas obligatoire pour relationship)

class ActivityCategory(str, enum.Enum):
    # Important : Clé et Valeur doivent être IDENTIQUES aux strings de React
    Sommeil_nocturne = "Sommeil_nocturne"
    Sieste_diurne = "Sieste_diurne"
    Repos_passif = "Repos_passif"
    Preparation_repas = "Preparation_repas"
    Prise_repas = "Prise_repas"
    Collation = "Collation"
    Prise_medicaments = "Prise_medicaments"
    Utilisation_toilettes = "Utilisation_toilettes"
    Douche = "Douche"
    Loisir_sedentaires = "Loisir_sedentaires"
    Deplacement_interne = "Deplacement_interne"
    Sortie_domicile = "Sortie_domicile"
    Retour_domicile = "Retour_domicile"

class ActivitySource(str, enum.Enum):
    MANUAL = "MANUAL"        # Saisie par le surveillé
    PREDICTED = "PREDICTED"  # Générée par l'IA

class Activity(Base):
    __tablename__ = "activities"

    # UUID
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Heure et date de l'activité
    time = Column(String(5), nullable=False)   # "HH:mm"
    date = Column(DateTime, nullable=False)    # Date de l'activité

    # Catégorie
    category = Column(SQLEnum(ActivityCategory, native_enum=False), nullable=False)
    source = Column(SQLEnum(ActivitySource), nullable=False, default=ActivitySource.MANUAL)

    # Date de création (système)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Créé par (FK vers users.id)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Relation ORM vers User
    creator = relationship(
        "User",                      # chaîne pour éviter import circulaire
        backref="created_activities",
        lazy="joined"
    )

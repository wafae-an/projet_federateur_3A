from pydantic import BaseModel
from datetime import date, time
from typing import Optional

# Utilisé par le surveillé pour envoyer son état
class HealthStatusCreate(BaseModel):
    dependent_id: int  # ID du profil dependent_profiles
    status_type: str   # Ex: 'WELL', 'PAIN', etc.

# Utilisé pour renvoyer les données au dashboard du caregiver
class HealthStatusHistoryResponse(BaseModel):
    full_name: str     # Provient de la table User
    age: int           # Provient de la table DependentProfile
    status: str        # Provient de la table HealthStatusLog
    log_date: date
    log_time: str      # Formaté en "HH:MM" pour le frontend

    class Config:
        from_attributes = True
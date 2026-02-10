from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from database import get_db
from app.schema.schema_activity import ActivityCreate, ActivityOut
from app.services.activity_service import create_activity, get_activities_by_date
from app.security import get_current_user  # on utilise le nouveau système JWT

router = APIRouter(prefix="/activities", tags=["activities"])


# === Créer une activité ===
@router.post("/", response_model=ActivityOut)
def create_activity_endpoint(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # {"id": ..., "role": ...}
):
    # Sécurité : seulement DEPENDENT
    if current_user["role"].upper() != "DEPENDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only dependent users can create activities"
        )

    # Passe l'ID du user au service
    return create_activity(db, activity, current_user["id"])



# === Récupérer les activités d'une date spécifique ===
@router.get("/by-date", response_model=list[ActivityOut])
def get_activities_by_date_endpoint(
    date_param: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_activities_by_date(db, date_param, current_user["id"])


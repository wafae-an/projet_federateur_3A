from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from database import get_db
from app.services.get_predicted_activity import get_predicted_activities_by_date
from app.schema.schema_activity import ActivityRead  # Votre schéma Pydantic pour la réponse

router = APIRouter()

@router.get("/activities/predicted", response_model=List[ActivityRead])
def read_predicted_activities(
    target_date: date = Query(..., description="Date au format YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des activités prédites par l'IA pour une journée précise.
    """
    activities = get_predicted_activities_by_date(db, target_date=target_date)
    
    # On retourne une liste vide si rien n'est trouvé (mieux que 404 pour une timeline)
    return activities
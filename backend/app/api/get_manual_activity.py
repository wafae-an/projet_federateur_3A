from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from database import get_db
from app.services.get_manual_activity import get_manual_activities_by_date
from app.schema.schema_activity import ActivityRead

router = APIRouter()

@router.get("/activities/manual", response_model=List[ActivityRead])
def read_manual_activities(
    target_date: date = Query(..., description="Date au format YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """
    Endpoint pour récupérer l'historique manuel de l'utilisateur 1 à une date précise.
    """
    return get_manual_activities_by_date(db, target_date=target_date)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from app.services.get_anomalities import get_today_anomalies
# Importez votre schéma Pydantic si vous en avez un, sinon utilisez la réponse brute

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

# Dépendance pour la session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/today")
async def read_today_anomalies(db: Session = Depends(get_db)):
    """
    Récupère l'historique des alertes critiques de la journée pour l'utilisateur 1.
    """
    try:
        anomalies = get_today_anomalies(db, user_id=1)
        return anomalies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from app.services.update_status import update_anomaly_status  # Importez votre service ici

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

# Dépendance pour obtenir la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.patch("/{anomaly_id}/acknowledge")
async def acknowledge_anomaly(anomaly_id: str, db: Session = Depends(get_db)):
    """
    Endpoint appelé par React pour passer une anomalie en statut 'seen'.
    """
    # Appel de la fonction de service que vous avez fournie
    updated_anomaly = update_anomaly_status(db, anomaly_id)
    
    # Si le service retourne None, l'ID n'existe pas
    if not updated_anomaly:
        raise HTTPException(
            status_code=404, 
            detail=f"L'anomalie avec l'ID {anomaly_id} est introuvable."
        )
    
    return {
        "status": "success",
        "message": "Statut mis à jour avec succès",
        "data": {
            "id": updated_anomaly.id,
            "new_status": updated_anomaly.status
        }
    }
from sqlalchemy.orm import Session
from app.models.anomaly import Anomaly

def update_anomaly_status(db: Session, anomaly_id: str):
    """
    Met à jour le statut d'une anomalie de 'active' vers 'seen'.
    """
    # Recherche de l'anomalie par son ID
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    
    if anomaly:
        anomaly.status = "seen"
        db.commit()
        db.refresh(anomaly)
    
    return anomaly
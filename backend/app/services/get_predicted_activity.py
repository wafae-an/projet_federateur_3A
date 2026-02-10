from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.models.activity import Activity, ActivitySource

def get_predicted_activities_by_date(db: Session, target_date: date):
    """
    Récupère toutes les activités prédites pour la date spécifiée,
    triées de la plus récente à la plus ancienne.
    """
    return db.query(Activity).filter(
        Activity.source == ActivitySource.PREDICTED,
        func.date(Activity.date) == target_date
    ).order_by(Activity.time.desc()).all()
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.models.activity import Activity, ActivitySource

def get_manual_activities_by_date(db: Session, target_date: date):
    """
    Récupère les activités saisies MANUELLEMENT par l'utilisateur 1
    pour une date donnée, triées par heure décroissante.
    """
    return db.query(Activity).filter(
        Activity.created_by == 1,
        Activity.source == ActivitySource.MANUAL,
        func.date(Activity.date) == target_date
    ).order_by(Activity.time.desc()).all()
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.activity import Activity, ActivitySource
from app.schema.schema_activity import ActivityCreate
from app.models.user import User

# === Créer une activité pour le surveillé connecté ===
def create_activity(db: Session, activity: ActivityCreate, user_id: int):
    """
    Crée une activité pour l'utilisateur identifié par user_id avec source MANUELLE.
    """
    db_activity = Activity(
        time=activity.time,
        date=datetime.combine(date.today(), datetime.min.time()),  # aujourd'hui
        category=activity.category,
        created_by=user_id,
        source=ActivitySource.MANUAL  # ✅ Ajout de la source manuelle
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

# === Récupérer les activités d'une date spécifique pour le surveillé connecté ===
def get_activities_by_date(db: Session, target_date: date, user_id: int):
    """
    Récupère UNIQUEMENT les activités MANUELLES pour une date et un utilisateur.
    """
    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())

    return (
        db.query(Activity)
        .filter(Activity.date >= start_dt)
        .filter(Activity.date <= end_dt)
        .filter(Activity.created_by == user_id)
        .filter(Activity.source == ActivitySource.MANUAL)  # ✅ Filtre pour ne prendre que le manuel
        .order_by(Activity.time.asc())
        .all()
    )
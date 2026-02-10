from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, time
from app.models.anomaly import Anomaly

def get_today_anomalies(db: Session, user_id: int = 1):
    """
    Récupère toutes les anomalies enregistrées entre 00:00:00 et 23:59:59 aujourd'hui.
    """
    now = datetime.now()
    start_of_day = datetime.combine(now.date(), time.min)
    end_of_day = datetime.combine(now.date(), time.max)

    return db.query(Anomaly).filter(
        and_(
            Anomaly.user_id == user_id,
            Anomaly.date >= start_of_day,
            Anomaly.date <= end_of_day
        )
    ).order_by(Anomaly.date.desc()).all()
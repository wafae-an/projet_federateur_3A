from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from app.models.health_status_logs import HealthStatusLog
from app.models.dependent import DependentProfile
from app.models.caregiver import CaregiverProfile
from app.models.association import CaregiverDependentAssociation
from app.models.user import User
from app.security import get_current_user, get_current_user_id
from app.schema.health_status import HealthStatusCreate, HealthStatusHistoryResponse

router = APIRouter(prefix="/health", tags=["Santé"])

# --- 1. ENREGISTRER (Surveillé) ---
@router.post("/status")
def create_health_status(
    data: HealthStatusCreate, 
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    dependent = db.query(DependentProfile).filter(DependentProfile.user_id == current_user_id).first()
    if not dependent:
        raise HTTPException(status_code=403, detail="Profil non trouvé")

    # On ne passe que status_type, created_at est géré par MySQL
    new_status = HealthStatusLog(
        dependent_id=dependent.id,
        status_type=data.status_type
    )
    db.add(new_status)
    db.commit()
    return {"message": "État enregistré"}

# --- 2. RÉCUPÉRER L'HISTORIQUE (Aidant) ---
@router.get("/history")
def get_dependents_health_history(
    selected_date: date = Query(default=date.today()), 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    caregiver = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == current_user["id"]).first()
    if not caregiver or current_user["role"].upper() != "CAREGIVER":
        raise HTTPException(status_code=403, detail="Accès refusé")

    # On filtre sur la partie 'Date' du champ DATETIME
    from sqlalchemy import func
    results = db.query(HealthStatusLog, User.full_name, DependentProfile.age)\
        .join(DependentProfile, HealthStatusLog.dependent_id == DependentProfile.id)\
        .join(User, DependentProfile.user_id == User.id)\
        .join(CaregiverDependentAssociation, CaregiverDependentAssociation.dependent_id == DependentProfile.id)\
        .filter(CaregiverDependentAssociation.caregiver_id == caregiver.id)\
        .filter(func.date(HealthStatusLog.created_at) == selected_date)\
        .order_by(HealthStatusLog.created_at.desc())\
        .all()

    return [
        {
            "full_name": res.full_name,
            "age": res.age,
            "status": res.HealthStatusLog.status_type,
            "log_date": res.HealthStatusLog.created_at.strftime("%d/%m/%Y"),
            "log_time": res.HealthStatusLog.created_at.strftime("%H:%M")
        } for res in results
    ]
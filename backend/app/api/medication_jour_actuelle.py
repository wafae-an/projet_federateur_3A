from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from app.security import get_current_user
from app.models import  DependentProfile
from app.models.medication import MedicationIntake

router = APIRouter(prefix="/dependent/medications", tags=["dependent-medications"])

@router.get("/today")
def get_my_today_medications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Récupérer le profil du surveillé à partir de l'user_id du token
    dependent = db.query(DependentProfile).filter(DependentProfile.user_id == current_user["id"]).first()
    
    if not dependent:
        raise HTTPException(status_code=404, detail="Profil surveillé non trouvé")

    # 2. Récupérer les prises pour aujourd'hui uniquement
    today = date.today()
    medications = db.query(MedicationIntake).filter(
        MedicationIntake.dependent_id == dependent.id,
        MedicationIntake.intake_date == today
    ).order_by(MedicationIntake.intake_time.asc()).all()

    return medications
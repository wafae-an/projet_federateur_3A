from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.security import get_current_user
from app.models import DependentProfile
from app.models.medication import MedicationIntake

router = APIRouter(prefix="/dependent/medications", tags=["dependent-medications"])

@router.patch("/{medication_id}/take")
def mark_medication_as_taken(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Identifier le profil du dépendant
    dependent = db.query(DependentProfile).filter(DependentProfile.user_id == current_user["id"]).first()
    if not dependent:
        raise HTTPException(status_code=404, detail="Profil non trouvé")

    # 2. Chercher la prise spécifique et vérifier qu'elle lui appartient
    med_intake = db.query(MedicationIntake).filter(
        MedicationIntake.id == medication_id,
        MedicationIntake.dependent_id == dependent.id
    ).first()

    if not med_intake:
        raise HTTPException(status_code=404, detail="Prise de médicament non trouvée")

    # 3. Empêcher de marquer comme pris si c'est déjà 'MISSED' ou déjà 'TAKEN'
    if med_intake.status == "TAKEN":
        return {"message": "Médicament déjà marqué comme pris", "status": "TAKEN"}
    
    # 4. Mise à jour du statut
    med_intake.status = "TAKEN"
    db.commit()
    db.refresh(med_intake)

    return {"message": "Médicament pris avec succès", "status": "TAKEN"}
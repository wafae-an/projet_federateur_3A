from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from app.models.activity import Activity
from app.models.caregiver import CaregiverProfile
from app.models.dependent import DependentProfile
from app.models.association import CaregiverDependentAssociation
# Importe tes schémas Pydantic ici (ex: ActivityResponse)

router = APIRouter(prefix="/monitoring", tags=["Caregiver"])

@router.get("/my-dependent-activities/{caregiver_user_id}")
def get_associated_dependent_activities(
    caregiver_user_id: int, 
    db: Session = Depends(get_db)
):
    # 1. Trouver le profil de l'aidant à partir de son user_id
    caregiver = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == caregiver_user_id).first()
    if not caregiver:
        raise HTTPException(status_code=404, detail="Profil aidant non trouvé")

    # 2. Trouver l'association (on prend le premier dépendant trouvé pour cet aidant)
    association = db.query(CaregiverDependentAssociation).filter(
        CaregiverDependentAssociation.caregiver_id == caregiver.id
    ).first()
    
    if not association:
        raise HTTPException(status_code=404, detail="Aucune personne surveillée associée à cet aidant")

    # 3. Récupérer le profil du dépendant pour avoir son user_id (celui utilisé dans la table activities)
    dependent = db.query(DependentProfile).filter(DependentProfile.id == association.dependent_id).first()
    
    # 4. Récupérer enfin les activités liées au user_id du dépendant
    activities = db.query(Activity).filter(
        Activity.user_id == dependent.user_id
    ).order_by(desc(Activity.date), desc(Activity.time)).limit(50).all()

    return {
        "dependent_user_id": dependent.user_id,
        "activities": activities
    }
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime # Importation de datetime nécessaire
from typing import List
from database import get_db
from app.security import get_current_user
from app.models import CaregiverDependentAssociation, CaregiverProfile
from app.models.medication import MedicationIntake
from app.schema.medication_schema import MedicationResponse

router = APIRouter(prefix="/medications", tags=["medications"])

@router.get("/history", response_model=List[MedicationResponse])
def get_medications_by_date(
    selected_date: date = Query(..., description="Date au format YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Vérification du rôle
    if current_user["role"].upper() != "CAREGIVER":
        raise HTTPException(status_code=403, detail="Accès refusé.")

    # 2. Récupération du profil de l'aidant
    caregiver = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user["id"]
    ).first()

    # 3. Récupération de l'association
    association = db.query(CaregiverDependentAssociation).filter(
        CaregiverDependentAssociation.caregiver_id == caregiver.id
    ).first()

    if not association:
        raise HTTPException(status_code=404, detail="Aucun surveillé associé trouvé.")

    # --- LOGIQUE DE MISE À JOUR AUTOMATIQUE (MISSED) ---
    now = datetime.now()
    current_date = now.date()
    current_time = now.time()

    # On cherche les médicaments qui doivent être marqués comme manqués :
    # - Statut est encore 'TO_TAKE'
    # - La date est aujourd'hui (ou passée)
    # - L'heure est inférieure à l'heure actuelle
    query_missed = db.query(MedicationIntake).filter(
        MedicationIntake.dependent_id == association.dependent_id,
        MedicationIntake.status == "TO_TAKE",
        MedicationIntake.intake_date <= current_date, # Date passée ou aujourd'hui
        MedicationIntake.intake_time < current_time   # Heure dépassée
    )

    # Mise à jour en base de données
    updated_count = query_missed.update({"status": "MISSED"}, synchronize_session=False)
    if updated_count > 0:
        db.commit()
    # ---------------------------------------------------

    # 4. Récupération finale des médicaments (incluant les nouveaux 'MISSED')
    medications = db.query(MedicationIntake).filter(
        MedicationIntake.dependent_id == association.dependent_id,
        MedicationIntake.intake_date == selected_date
    ).order_by(MedicationIntake.intake_time.asc()).all()

    return medications
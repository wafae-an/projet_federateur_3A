from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from app.security import get_current_user
from app.models import CaregiverDependentAssociation, CaregiverProfile
from app.models.medication import MedicationIntake
from app.schema.medication_schema import MedicationCreate

router = APIRouter(prefix="/medications", tags=["medications"])

@router.post("/create")
def create_medication_intake(
    data: MedicationCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Vérifier que l'utilisateur est un aidant
    if current_user["role"].upper() != "CAREGIVER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Seuls les aidants peuvent programmer des médicaments."
        )

    # 2. Récupérer le profil de l'aidant
    caregiver_profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == current_user["id"]
    ).first()

    # 3. Trouver le surveillé associé à cet aidant
    association = db.query(CaregiverDependentAssociation).filter(
        CaregiverDependentAssociation.caregiver_id == caregiver_profile.id
    ).first()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Aucun surveillé associé trouvé pour cet aidant."
        )

    # 4. Création de la prise de médicament
    # Le status sera 'à prendre' par défaut selon la définition du modèle SQLAlchemy
    new_intake = MedicationIntake(
        medication_name=data.medication_name,
        dosage=data.dosage,
        intake_date=data.intake_date,
        intake_time=data.intake_time,
        
        dependent_id=association.dependent_id  # Liaison automatique
    )

    db.add(new_intake)
    db.commit()
    db.refresh(new_intake)

    return {"message": "Prise de médicament créée avec succès", "id": new_intake.id}
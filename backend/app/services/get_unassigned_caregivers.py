# app/services/caregiver_service.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.caregiver import CaregiverProfile
from app.models.association import CaregiverDependentAssociation
from app.schema.caregiver_basic_info import CaregiverBasicInfo

def get_unassigned_caregivers(db: Session) -> list[CaregiverBasicInfo]:
    # Sous-requête pour récupérer les IDs de caregivers assignés
    assigned_subquery = select(CaregiverDependentAssociation.caregiver_id)

    # Récupérer les caregivers qui ne sont pas assignés
    caregivers = (
        db.query(CaregiverProfile)
        .filter(CaregiverProfile.id.not_in(assigned_subquery))
        .all()
    )

    # Mapper sur le schema CaregiverBasicInfo
    result = [
        CaregiverBasicInfo(
            id=caregiver.user.id,
            full_name=caregiver.user.full_name,
            email=caregiver.user.email
        )
        for caregiver in caregivers
    ]

    return result

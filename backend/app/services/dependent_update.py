from sqlalchemy.orm import Session
from app.models.dependent import DependentProfile
from app.models.caregiver import CaregiverProfile
from app.schema.dependent_schema import DependentUpdate


def update_dependent_service(
    db: Session,
    dependent: DependentProfile,
    data: DependentUpdate
) -> DependentProfile:

    user = dependent.user

    # 1. Mise à jour des informations de l'Utilisateur (Table 'users')
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.address is not None:
        user.address = data.address
    if data.email is not None:
        user.email = data.email

    # 2. Mise à jour des informations du Profil (Table 'dependent_profiles')
    if data.dependency_category is not None:
        dependent.dependency_category = data.dependency_category
    
    # Mise à jour de l'âge
    if data.age is not None:
        dependent.age = data.age

    # 3. Mise à jour de la relation Caregivers (Table d'association)
    # CORRECTION : On utilise CaregiverProfile.user_id car les IDs envoyés 
    # par le frontend React sont les IDs des utilisateurs.
    if data.caregiver_ids is not None:
        caregivers = db.query(CaregiverProfile)\
            .filter(CaregiverProfile.user_id.in_(data.caregiver_ids))\
            .all()
        dependent.caregivers = caregivers

    db.commit()
    db.refresh(dependent)

    return dependent
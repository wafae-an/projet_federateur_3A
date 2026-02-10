from sqlalchemy.orm import Session
from app.models.user import User
from app.models.dependent import DependentProfile
from app.models.caregiver import CaregiverProfile
from app.schema.dependent_schema import DependentCreate

def create_dependent_service(db: Session, data: DependentCreate) -> DependentProfile:
    # 1. Création de l'entrée dans la table 'users'
    user = User(
        email=data.email,
        hashed_password=data.password, 
        full_name=data.full_name,
        phone=data.phone,
        address=data.address,
        role="DEPENDENT",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Création du profil DependentProfile lié à l'user_id créé
    dependent = DependentProfile(
        user_id=user.id,
        age=data.age,
        dependency_category=data.dependency_category
    )

    # 3. Affectation des caregivers
    # On filtre par CaregiverProfile.user_id car React envoie les IDs de la table Users
    if data.caregiver_ids:
        caregivers = db.query(CaregiverProfile)\
            .filter(CaregiverProfile.user_id.in_(data.caregiver_ids))\
            .all()
        dependent.caregivers = caregivers

    db.add(dependent)
    db.commit()
    db.refresh(dependent)

    return dependent
from sqlalchemy.orm import Session, joinedload
from app.models.dependent import DependentProfile
from app.models.caregiver import CaregiverProfile
from app.models.association import CaregiverDependentAssociation
from app.models.user import User
from app.schema.dependent_schema import DependentInfo
from app.schema.caregiver_basic_info import CaregiverBasicInfo

def get_all_dependents_service(db: Session) -> list[DependentInfo]:
    # Récupération de tous les dependents avec leur user lié
    dependents = db.query(DependentProfile).options(joinedload(DependentProfile.user)).all()

    result = []

    for dep in dependents:
        # Récupérer tous les caregiver_id associés à ce dependent
        caregiver_associations = db.query(CaregiverDependentAssociation).filter_by(dependent_id=dep.id).all()

        caregivers_list = []
        for assoc in caregiver_associations:
            caregiver_profile = db.query(CaregiverProfile).options(joinedload(CaregiverProfile.user)).filter_by(id=assoc.caregiver_id).first()
            if caregiver_profile and caregiver_profile.user:
                caregivers_list.append(
                    CaregiverBasicInfo(
                        id=caregiver_profile.user.id,
                        full_name=caregiver_profile.user.full_name,
                        email=caregiver_profile.user.email
                    )
                )

        # Ajouter le dependent avec le nouveau champ AGE
        result.append(
            DependentInfo(
                id=dep.user.id,
                email=dep.user.email,
                full_name=dep.user.full_name,
                age=dep.age,  # <--- AJOUTÉ : Extraction de l'âge depuis DependentProfile
                phone=dep.user.phone,
                address=dep.user.address,
                is_active=dep.user.is_active,
                dependency_category=dep.dependency_category,
                caregivers=caregivers_list
            )
        )

    return result
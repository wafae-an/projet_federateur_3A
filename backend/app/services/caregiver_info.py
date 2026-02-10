from sqlalchemy.orm import Session
from app.models.user import User
from app.models.caregiver import CaregiverProfile
from app.schema.caregiver_schema import CaregiverInfo

def get_all_caregivers(db: Session) -> list[CaregiverInfo]:
    caregivers = (
        db.query(User, CaregiverProfile)
        .join(CaregiverProfile, CaregiverProfile.user_id == User.id)
        .filter(User.role == "caregiver")
        .all()
    )

    result = []
    for user, profile in caregivers:
        result.append(
            CaregiverInfo(
                id=user.id,                 # users.id
                email=user.email,
                full_name=user.full_name,
                phone=user.phone,
                address=user.address,
                is_active=user.is_active,
                profession=profile.profession,
                relationship_type=profile.relationship_type
            )
        )

    return result

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.caregiver import CaregiverProfile
from app.schema.caregiver_schema import UserUpdate

def update_caregiver(
    db: Session,
    user_id: int,
    user_update: UserUpdate
) -> User:
    # Récupérer le caregiver
    user = db.query(User).filter(
        User.id == user_id,
        User.role == "caregiver"
    ).first()

    if not user:
        raise ValueError("Caregiver introuvable")

    # ---------- Mise à jour User ----------
    if user_update.full_name is not None:
        user.full_name = user_update.full_name

    if user_update.phone is not None:
        user.phone = user_update.phone

    if user_update.address is not None:
        user.address = user_update.address

    if user_update.email is not None:
        user.email = user_update.email

    # ---------- Mise à jour CaregiverProfile ----------
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.user_id == user.id
    ).first()

    if profile:
        if user_update.profession is not None:
            profile.profession = user_update.profession

        
    db.commit()
    db.refresh(user)

    return user

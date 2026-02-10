from sqlalchemy.orm import Session
from app.models.user import User

def deactivate_caregiver(db: Session, user_id: int) -> User:
    """
    Désactive le compte d'un caregiver (soft delete)
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.role == "caregiver"
    ).first()

    if not user:
        raise ValueError("Caregiver introuvable")

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user

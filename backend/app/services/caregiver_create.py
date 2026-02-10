from sqlalchemy.orm import Session
from app.models.user import User
from app.models.caregiver import CaregiverProfile
from app.schema.caregiver_schema import UserCreate

def create_caregiver(db: Session, user_in: UserCreate) -> User:
    """
    Crée un caregiver (utilisateur + profil caregiver)
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise ValueError("Email déjà utilisé")

    # Créer l'utilisateur
    user = User(
        email=user_in.email,
        hashed_password=user_in.password,
        full_name=user_in.full_name,
        phone=user_in.phone,
        address=user_in.address,
        role="caregiver"  # rôle forcé à caregiver
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Créer le profil caregiver
    profile = CaregiverProfile(
        user_id=user.id,
        profession=user_in.profession,
        relationship_type=user_in.relationship_type
    )
    db.add(profile)
    db.commit()
    
    return user

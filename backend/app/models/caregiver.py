# models/caregiver_profile.py
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from database import Base

class CaregiverProfile(Base):
    """Profil spécifique d'un Aidant"""
    __tablename__ = "caregiver_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), 
    unique=True)

    profession = Column(String(100))
    
    # Information optionnelle
    
    relationship_type = Column(String(50))  # "fils", "fille", "conjoint"
    
    # Relation avec User
    user = relationship("User", back_populates="caregiver_profile")
    
    # Relation avec Dependent via table d'association
    assigned_dependents = relationship(
        "DependentProfile",
        secondary="caregiver_dependent_association",
        back_populates="caregivers"
    )
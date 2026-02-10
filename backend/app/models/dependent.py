# models/dependent_profile.py
from sqlalchemy import Column, Integer, ForeignKey, String,Enum, Text
from sqlalchemy.orm import relationship
from database import Base
from .enums_dependent import DependencyCategory
import enum

class DependentProfile(Base):
    """Profil spécifique d'un Surveillé"""
    __tablename__ = "dependent_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    
    dependency_category = Column(Enum(DependencyCategory), nullable=False)
    age = Column(Integer, nullable=False)
    
    # Relation avec User
    user = relationship("User", back_populates="dependent_profile")
    
    # Relation avec Caregiver via table d'association
    caregivers = relationship(
        "CaregiverProfile",
        secondary="caregiver_dependent_association",
        back_populates="assigned_dependents"
    )
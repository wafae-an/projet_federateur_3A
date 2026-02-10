# models/user.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
from .enums import UserRole

class User(Base):
    """Table principale pour TOUS les utilisateurs"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(20))
       # Information surveillé
    address = Column(String(500))
    
    # Rôle
    role = Column(Enum(UserRole), nullable=False)
    
    # Activation
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations (optionnel, si besoin d'accéder aux profils)
    caregiver_profile = relationship("CaregiverProfile", back_populates="user", uselist=False)
    dependent_profile = relationship("DependentProfile", back_populates="user", uselist=False)
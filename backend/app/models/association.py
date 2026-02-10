# models/association.py
from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from database import Base

class CaregiverDependentAssociation(Base):
    """Table d'association entre Aidant et Surveillé"""
    __tablename__ = "caregiver_dependent_association"
    
    # IDs des deux parties
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), primary_key=True)
    dependent_id = Column(Integer, ForeignKey("dependent_profiles.id", ondelete="CASCADE"), primary_key=True)
    
    # Métadonnées
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    # Contrainte: un aidant ne peut être associé qu'UNE FOIS à un surveillé
    # Mais un surveillé peut avoir plusieurs aidants
    __table_args__ = (
        UniqueConstraint('caregiver_id', 'dependent_id', name='unique_caregiver_dependent'),
    )
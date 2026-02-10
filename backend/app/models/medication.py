from sqlalchemy import Column, Integer, String, Date, Time, Text, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base
import enum

class MedicationStatus(enum.Enum):
    TO_TAKE = "TO_TAKE"
    TAKEN = "TAKEN"
    MISSED = "MISSED"

class MedicationIntake(Base):
    __tablename__ = "medication_intakes"

    id = Column(Integer, primary_key=True, index=True)
    medication_name = Column(String(100), nullable=False)
    dosage = Column(String(50))
    intake_date = Column(Date, nullable=False)
    intake_time = Column(Time, nullable=False)
    
    
    # Status avec valeur par défaut "à prendre"
    status = Column(
        Enum(MedicationStatus), 
        default=MedicationStatus.TO_TAKE, 
        nullable=False
    )
    
    # Relation avec le surveillé
    dependent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
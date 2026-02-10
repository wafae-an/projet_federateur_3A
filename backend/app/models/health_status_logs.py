from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base

class HealthStatusLog(Base):
    __tablename__ = "health_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    dependent_id = Column(Integer, ForeignKey("dependent_profiles.id"))
    status_type = Column(String(50)) 
    # On stocke le timestamp complet
    created_at = Column(DateTime, default=datetime.utcnow)
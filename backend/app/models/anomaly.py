import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from database import Base

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    activity_name = Column(String(100), nullable=False)
    time = Column(String(5), nullable=False) # "HH:mm"
    date = Column(DateTime, default=datetime.utcnow)
    priority = Column(String(20), nullable=False) # High, Medium, Low
    status = Column(String(20), nullable=False, default="active")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
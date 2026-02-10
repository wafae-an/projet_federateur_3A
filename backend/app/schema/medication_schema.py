from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class MedicationCreate(BaseModel):
    medication_name: str
    dosage: Optional[str] = None
    intake_date: date
    intake_time: time


class MedicationResponse(BaseModel):
    id: int
    medication_name: str
    dosage: Optional[str]
    intake_date: date
    intake_time: time
    status: str # "à prendre", "pris", "manqué"

    class Config:
        from_attributes = True
    
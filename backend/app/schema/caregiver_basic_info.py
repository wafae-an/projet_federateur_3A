# app/schema/caregiver_schema.py
from pydantic import BaseModel
from typing import Optional

class CaregiverBasicInfo(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True

# app/api/caregivers.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from app.services.get_unassigned_caregivers import get_unassigned_caregivers
from app.schema.caregiver_basic_info import CaregiverBasicInfo
from typing import List

router = APIRouter(prefix="/caregivers", tags=["Caregivers"])

@router.get("/unassigned", response_model=List[CaregiverBasicInfo])
def get_unassigned_caregivers_endpoint(db: Session = Depends(get_db)):
    return get_unassigned_caregivers(db)

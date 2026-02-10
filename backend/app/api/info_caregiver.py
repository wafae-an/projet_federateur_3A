from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from app.services.caregiver_info import get_all_caregivers
from app.schema.caregiver_schema import CaregiverInfo

router = APIRouter(prefix="/caregivers", tags=["caregivers"])

@router.get("/", response_model=list[CaregiverInfo])
def get_all_caregivers_endpoint(db: Session = Depends(get_db)):
    return get_all_caregivers(db)

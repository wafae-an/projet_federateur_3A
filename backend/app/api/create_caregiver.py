from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.schema.caregiver_schema import UserCreate
from app.services.caregiver_create import create_caregiver

router = APIRouter(prefix="/caregivers", tags=["caregivers"])

@router.post("/", response_model=dict)
def create_caregiver_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = create_caregiver(db=db, user_in=user_in)
        return {"message": "Caregiver créé avec succès", "user_id": user.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

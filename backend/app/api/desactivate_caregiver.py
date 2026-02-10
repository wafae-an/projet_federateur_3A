from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.services.caregiver_desactivate import deactivate_caregiver

router = APIRouter(prefix="/caregivers", tags=["caregivers"])

@router.patch("/{caregiver_id}/deactivate", response_model=dict)
def deactivate_caregiver_endpoint(
    caregiver_id: int,
    db: Session = Depends(get_db)
):
    try:
        user = deactivate_caregiver(db=db, user_id=caregiver_id)
        return {
            "message": "Compte caregiver désactivé avec succès",
            "user_id": user.id,
            "is_active": user.is_active
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

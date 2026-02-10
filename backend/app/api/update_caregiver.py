from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.schema.caregiver_schema import UserUpdate
from app.services.caregiver_update import update_caregiver

router = APIRouter(prefix="/caregivers", tags=["caregivers"])

@router.put("/{caregiver_id}", response_model=dict)
def update_caregiver_endpoint(
    caregiver_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    try:
        user = update_caregiver(
            db=db,
            user_id=caregiver_id,
            user_update=user_update
        )
        return {
            "message": "Caregiver mis à jour avec succès",
            "user_id": user.id
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

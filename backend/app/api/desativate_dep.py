from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from app.models.dependent import DependentProfile
from app.services.dependent_desactivate import deactivate_dependent_service

router = APIRouter(prefix="/dependents", tags=["Dependents"])


@router.patch("/{dependent_id}/deactivate")
def deactivate_dependent_endpoint(
    dependent_id: int,
    db: Session = Depends(get_db)
):
    dependent = db.query(DependentProfile).filter(
        DependentProfile.id == dependent_id
    ).first()

    if not dependent:
        raise HTTPException(status_code=404, detail="Dependent introuvable")

    deactivate_dependent_service(db, dependent)
    return {"message": "Compte dependent désactivé avec succès"}

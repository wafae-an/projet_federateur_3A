from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from app.models.dependent import DependentProfile
from app.schema.dependent_schema import DependentUpdate
from app.services.dependent_update import update_dependent_service


router = APIRouter(prefix="/dependents", tags=["Dependents"])


@router.put("/{user_id}") # On l'appelle user_id pour être clair
def update_dependent_endpoint(user_id: int, data: DependentUpdate, db: Session = Depends(get_db)):
    # On cherche le profil dont le user_id correspond à l'ID reçu
    dependent = db.query(DependentProfile).filter(
        DependentProfile.user_id == user_id 
    ).first()

    if not dependent:
        raise HTTPException(status_code=404, detail="Dependent introuvable")

    return update_dependent_service(db, dependent, data)
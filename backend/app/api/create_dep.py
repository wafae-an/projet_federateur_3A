from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from app.schema.dependent_schema import DependentCreate
from app.services.dependent_create import create_dependent_service

router = APIRouter(prefix="/dependents", tags=["Dependents"])


@router.post("/", status_code=201)
def create_dependent_endpoint(
    data: DependentCreate,
    db: Session = Depends(get_db)
):
    try:
        dependent = create_dependent_service(db, data)
        return {
            "message": "Dependent créé avec succès",
            "dependent_id": dependent.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

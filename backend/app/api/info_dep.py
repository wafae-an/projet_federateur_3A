# app/api/dependent.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from app.services.dependent_info import get_all_dependents_service
from app.schema.dependent_schema import DependentInfo

router = APIRouter(prefix="/infoDependents", tags=["Dependents"])

@router.get("/", response_model=List[DependentInfo])
def get_all_dependents_endpoint(db: Session = Depends(get_db)):
    return get_all_dependents_service(db)

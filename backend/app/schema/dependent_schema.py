from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from app.models.enums_dependent import DependencyCategory
from app.schema.caregiver_basic_info import CaregiverBasicInfo

class DependentCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    age: int = Field(..., gt=0, lt=120)  # Age obligatoire, entre 1 et 120 ans
    phone: Optional[str] = None
    address: Optional[str] = None
    dependency_category: DependencyCategory
    caregiver_ids: List[int]

class DependentUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, gt=0, lt=120) # Age optionnel pour la mise à jour
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    dependency_category: Optional[DependencyCategory] = None
    caregiver_ids: Optional[List[int]] = None

class DependentInfo(BaseModel):
    id: int
    email: str
    full_name: str
    age: int  # Retourné dans les infos du profil
    phone: Optional[str]
    address: Optional[str]
    is_active: bool
    dependency_category: DependencyCategory
    caregivers: List[CaregiverBasicInfo]

    class Config:
        from_attributes = True
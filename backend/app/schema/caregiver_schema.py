from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.enums import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str]
    address: Optional[str]
    role: UserRole
    profession: Optional[str]
    relationship_type: Optional[str]


class UserUpdate(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    email: Optional [EmailStr]
    address: Optional[str]
    profession: Optional[str]


class UserDeactivate(BaseModel):
    is_active: bool

class CaregiverInfo(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    address: Optional[str]
    profession: Optional[str]
    relationship_type: Optional[str]
    is_active: bool

class Config:
    from_attributes = True

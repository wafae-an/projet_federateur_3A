from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.security import create_access_token  # JWT utils

router = APIRouter()

# === Schémas Pydantic ===
class LoginRequest(BaseModel):
    email: EmailStr
    password: str  # inchangé

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: EmailStr
    full_name: str
    role: UserRole

# === Endpoint login ===
@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # Cherche l'utilisateur par email
    user = db.query(User).filter(User.email == data.email).first()

    # Vérification existence + mot de passe (inchangé)
    if not user or user.hashed_password != data.password:
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")

    # Génération du token JWT (user.id + user.role)
    token = create_access_token(user_id=user.id, role=user.role.value)

    # Retourne le token + info utilisateur
    return LoginResponse(
        access_token=token,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

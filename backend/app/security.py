from datetime import datetime, timedelta
from typing import Union
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

# === Configuration ===
SECRET_KEY = "votre_clé_très_secrète"
ALGORITHM = "HS256"

# === Password hashing ===
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# === JWT Token generation (ID + ROLE) ===
def create_access_token(user_id: int, role: str, expires_delta: Union[timedelta, None] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=2))
    to_encode = {
        "sub": str(user_id),  # ID utilisateur
        "role": role,          # rôle unique
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# === JWT Token decoding ===
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Token invalide ou expiré")


# === Dépendance FastAPI pour récupérer l'utilisateur courant ===
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")  # endpoint login

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Retourne un dict avec id et role depuis le token JWT
    """
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        role: str = payload.get("role")

        if user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Token invalide")

        return {"id": int(user_id), "role": role}

    except ValueError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")


# === Dépendances utilitaires ===
def get_current_user_id(user: dict = Depends(get_current_user)) -> int:
    return user["id"]

def get_current_user_role(user: dict = Depends(get_current_user)) -> str:
    return user["role"]

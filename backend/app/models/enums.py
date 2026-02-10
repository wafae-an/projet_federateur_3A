# enums.py
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CAREGIVER = "caregiver"  # Aidant
    DEPENDENT = "dependent"  # Surveillé
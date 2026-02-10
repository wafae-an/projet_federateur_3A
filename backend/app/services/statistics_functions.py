# stats.py
from sqlalchemy.orm import Session
from models.user import User
from app.models.caregiver import CaregiverProfile
from app.models.dependent import DependentProfile
from app.models.enums_dependent import DependencyCategory

def count_caregivers(db: Session) -> int:
    """Nombre total de caregivers (exclut les admins)"""
    return db.query(User).filter(User.role == "caregiver").count()

def count_dependents(db: Session) -> int:
    """Nombre total de dépendants"""
    return db.query(User).filter(User.role == "dependent").count()

def count_active_inactive(db: Session):
    """
    Retourne le nombre de comptes activés et désactivés
    pour caregivers et dependents
    """
    stats = {}
    for role in ["caregiver", "dependent"]:
        total_active = db.query(User).filter(User.role==role, User.is_active==True).count()
        total_inactive = db.query(User).filter(User.role==role, User.is_active==False).count()
        stats[role] = {"active": total_active, "inactive": total_inactive}
    return stats

def dependent_category_percentages(db: Session):
    """
    Retourne le pourcentage de dependants par catégorie
    Ex : {"LOW_DEPENDENCY": 30, "HIGH_DEPENDENCY": 70}
    """
    percentages = {}
    total_dependents = db.query(DependentProfile).count()
    if total_dependents == 0:
        return {category.name: 0 for category in DependencyCategory}
    
    for category in DependencyCategory:
        count = db.query(DependentProfile).filter(
            DependentProfile.dependency_category == category
        ).count()
        percentages[category.name] = round((count / total_dependents) * 100, 2)
    
    return percentages

def count_associations(db: Session):
    """
    Nombre total d'associations entre caregivers et dependants
    """
    total = 0
    caregivers = db.query(CaregiverProfile).all()
    for caregiver in caregivers:
        total += len(caregiver.assigned_dependents)
    return total

def all_statistics(db: Session):
    """
    Retourne un dictionnaire complet des statistiques à afficher
    """
    stats = {
        "total_caregivers": count_caregivers(db),
        "total_dependents": count_dependents(db),
        "active_inactive": count_active_inactive(db),
        "dependent_category_percentages": dependent_category_percentages(db),
        "total_associations": count_associations(db)
    }
    return stats

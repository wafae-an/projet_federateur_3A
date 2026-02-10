# app/enums_dependent.py
import enum

class DependencyCategory(str, enum.Enum):
    """Grandes catégories de dépendance"""
    ELDERLY = "elderly"                # Personnes âgées
    DISABILITY = "disability"          # Personnes en situation de handicap
    CHRONIC_DISEASE = "chronic_disease"  # Maladies chroniques
    POST_HOSPITALIZATION = "post_hospitalization"  # Suivi post-hospitalier
    SOCIAL_VULNERABILITY = "social_vulnerability"  # Vulnérabilité sociale
    COGNITIVE_DISORDER = "cognitive_disorder"  # Troubles cognitifs
    TEMPORARY_CARE = "temporary_care"  # Soins temporaires
    PALLIATIVE_CARE = "palliative_care"  # Soins palliatifs 
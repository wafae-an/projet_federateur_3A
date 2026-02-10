from sqlalchemy.orm import Session
from app.models.dependent import DependentProfile


def deactivate_dependent_service(
    db: Session,
    dependent: DependentProfile
) -> None:
    dependent.user.is_active = False
    db.commit()

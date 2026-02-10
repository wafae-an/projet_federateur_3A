# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# ⚠️ IMPORT CRUCIAL : Importer TOUS les modèles AVANT create_all
from app.models.user import User
from app.models.caregiver import CaregiverProfile
from app.models.dependent import DependentProfile
from app.models.association import CaregiverDependentAssociation
from app.models.enums import UserRole
from app.api import create_caregiver,update_caregiver,desactivate_caregiver,info_caregiver,create_dep,update_dep,info_dep,desativate_dep,get_unassigned_caregivers,login
from app.api import realtime_monitoring,activity_endpoint,dependent_activity,get_predicted_activity,get_manual_activity
from app.api import get_anomalities,update_status,health_status,medication_create,medication_info,medication_jour_actuelle
from app.api import update_status_prise
app = FastAPI()

# ✅ D'ABORD créer les tables
Base.metadata.create_all(bind=engine)
print("✅ Tables créées dans la base de données")

@app.get("/")
async def root():
    return {"message": "hello world"}

# ✅ Ensuite ajouter le middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_caregiver.router)
app.include_router(update_caregiver.router)
app.include_router(desactivate_caregiver.router)
app.include_router(info_caregiver.router)
app.include_router(create_dep.router)
app.include_router(update_dep.router)
app.include_router(desativate_dep.router)
app.include_router(info_dep.router)
app.include_router(get_unassigned_caregivers.router)
app.include_router(login.router)
app.include_router(realtime_monitoring.router)
app.include_router(activity_endpoint.router)
app.include_router(dependent_activity.router)
app.include_router(get_predicted_activity.router)
app.include_router(get_manual_activity.router)
app.include_router(get_anomalities.router)
app.include_router(update_status.router)
app.include_router(health_status.router)
app.include_router(medication_create.router)
app.include_router(medication_info.router)
app.include_router(medication_jour_actuelle.router)
app.include_router(update_status_prise.router)
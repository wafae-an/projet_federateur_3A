from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
import asyncio
import uuid
from sqlalchemy.orm import Session
from database import SessionLocal  # Assurez-vous d'importer votre SessionLocal
from app.models.activity import Activity, ActivitySource # Importez vos modèles
from app.services.sensor_simulator import generate_sensor_data
from app.services.predictor import predict_activity

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(f"DEBUG: Connexion établie à {datetime.now()}")
    
    normal_activities = {
        "Sommeil_nocturne", "Sieste_diurne", "Repos_passif",
        "Preparation_repas", "Prise_repas", "Collation",
        "Prise_medicaments", "Utilisation_toilettes", "Douche",
        "Loisir_sedentaires", "Deplacement_interne",
        "Sortie_domicile", "Retour_domicile"
    }

    db: Session = SessionLocal()

    try:
        while True:
            sensor_data = generate_sensor_data()
            activity = predict_activity(sensor_data)
            now = datetime.now()
            
            # 1. Analyse de la catégorie
            category = "normal" if activity in normal_activities else "anormal"
            print(f"DEBUG: Activité détectée: {activity} ({category})")
            
            # --- CAS ACTIVITÉ NORMALE ---
            if category == "normal":
                try:
                    new_activity = Activity(
                        id=str(uuid.uuid4()),
                        time=now.strftime("%H:%M"),
                        date=now,
                        category=activity,
                        source=ActivitySource.PREDICTED,
                        created_by=1,
                        created_at=now
                    )
                    db.add(new_activity)
                    db.commit()
                except Exception as e:
                    db.rollback()
                    print(f"ERREUR DB NORMALE: {e}")

            # --- CAS ACTIVITÉ ANORMALE (NOUVEAU) ---
            else:
                try:
                    # On importe le modèle Anomaly ici ou en haut du fichier
                    from app.models.anomaly import Anomaly 
                    
                    new_anomaly = Anomaly(
                        id=str(uuid.uuid4()),
                        activity_name=activity,
                        priority="High" if "chute" in activity.lower() else "Medium",
                        time=now.strftime("%H:%M"),
                        date=now,
                        status="active", # Statut par défaut
                        user_id=1
                    )
                    db.add(new_anomaly)
                    db.commit()
                    print(f"DB: Anomalie '{activity}' enregistrée !")
                except Exception as e:
                    db.rollback()
                    print(f"ERREUR DB ANOMALIE: {e}")

            # --- 2. ENVOI À REACT (Pour tout le monde) ---
            # On sort l'envoi du bloc "if category == normal" pour que 
            # les deux composants reçoivent l'info
            payload = {
                "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
                "activity": activity,
                "category": category, # "normal" ou "anormal"
                "priority": "High" if category == "anormal" else "Low",
                "source": "predicted"
            }
            await websocket.send_json(payload)
            
            # Conseil : 15 min (900s) c'est très long pour tester. 
            # Mettez 5 ou 10 secondes pour voir les alertes arriver.
            await asyncio.sleep(300) 

    except WebSocketDisconnect:
        print("INFO: Déconnexion flux.")
    finally:
        db.close()
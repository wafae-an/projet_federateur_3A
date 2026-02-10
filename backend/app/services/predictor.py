# predictor.py
import joblib
import pandas as pd
from app.services.feature_builder import build_features  # si tu as une fonction pour transformer raw -> features

# Charger le modèle Random Forest
rf_model = joblib.load("app/model/random_forest_model.pkl")

# Charger le LabelEncoder
le = joblib.load("app/model/le_silverguardian.pkl")

def predict_activity(sensor_data):
    """
    Prend des données brutes des capteurs, construit les features et retourne
    l'activité prédite sous forme de nom (string) et non son code.
    """
    # Transformer les données brutes en features attendues par le modèle
    X = build_features(sensor_data)  # X doit être un DataFrame ou array
    
    # Prédiction (retourne un code)
    pred_idx = rf_model.predict(X)[0]
    
    # Mapping code -> label string
    activity_label = le.inverse_transform([pred_idx])[0]
    
    return activity_label

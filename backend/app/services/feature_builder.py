import pandas as pd

FEATURE_COLUMNS = [
    "heure_jour", "jour_semaine",
    "pir_cuisine", "pir_salon", "pir_chambre", "pir_sdb", "pir_couloir",
    "pression_lit", "duree_lit", "duree_fauteuil",
    "frigo_ouvert", "four_ouvert", "porte_entree",
    "duree_douche", "duree_toilettes", "duree_lavabo",
    "chute_detectee"
]

def build_features(sensor_data):
    df = pd.DataFrame([sensor_data])
    return df[FEATURE_COLUMNS]

import random
from datetime import datetime

def generate_sensor_data():
    now = datetime.now()

    return {
        "heure_jour": now.hour,
        "jour_semaine": now.weekday(),

        "pir_cuisine": random.randint(0, 15),
        "pir_salon": random.randint(0, 10),
        "pir_chambre": random.randint(0, 10),
        "pir_sdb": random.randint(0, 10),
        "pir_couloir": random.randint(0, 15),

        "pression_lit": random.choice([0, 1]),
        "duree_lit": random.randint(0, 15),
        "duree_fauteuil": random.randint(0, 15),

        "frigo_ouvert": random.choice([0, 1]),
        "four_ouvert": random.choice([0, 1]),
        "porte_entree": random.choice([0, 1]),

        "duree_douche": random.randint(0, 15),
        "duree_toilettes": random.randint(0, 15),
        "duree_lavabo": random.randint(0, 10),

        "chute_detectee": random.choice([0, 0, 0, 1])  # rare
    }

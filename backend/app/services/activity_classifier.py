NORMAL_ACTIVITIES = {
    "Sommeil_nocturne", "Sieste_diurne", "Repos_passif",
    "Preparation_repas", "Prise_repas", "Collation",
    "Prise_medicaments", "Utilisation_toilettes", "Douche",
    "Loisir_sedentaires", "Deplacement_interne",
    "Sortie_domicile", "Retour_domicile"
}

ANORMAL_ACTIVITIES = {
    "Immobilite_prolongee", "Deplacement_inhabituel",
    "Sommeil_anormal", "Oubli_repas",
    "Chute", "Toilette_anormale"
}

def classify_activity(activity_label: str) -> str:
    if activity_label in ANORMAL_ACTIVITIES:
        return "anormal"
    return "normal"

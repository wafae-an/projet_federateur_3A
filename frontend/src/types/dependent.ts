// Types for the dependent (monitored person) interface

// MISE À JOUR : Aligné sur l'ENUM SQL ('WELL', 'TIRED', 'SICK', 'PAIN', 'AT_HOME')
export type MoodStatus = 'WELL' | 'TIRED' | 'SICK' | 'PAIN' | 'AT_HOME';

export interface MoodEntry {
  id: string;
  status: MoodStatus;
  createdAt: string; // Changé timestamp -> createdAt pour correspondre au backend
}

export type ActivityCategory = 
  | 'Sommeil_nocturne'
  | 'Sieste_diurne'
  | 'Repos_passif'
  | 'Preparation_repas'
  | 'Prise_repas'
  | 'Collation'
  | 'Prise_medicaments'
  | 'Utilisation_toilettes'
  | 'Douche'
  | 'Loisir_sedentaires'
  | 'Deplacement_interne'
  | 'Sortie_domicile'
  | 'Retour_domicile';

export interface Activity {
  id: string;
  time: string;
  date: string;
  category: ActivityCategory;
  createdAt: string;
}

export interface MedicationPrescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; 
}

export interface MedicationIntake {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  date: string;
  time: string;
  quantity: string;
  comment?: string;
  taken: boolean;
  postponed?: boolean;
}

// À ajouter dans dependent.ts

export interface HealthStatusHistoryItem {
  full_name: string;   // Nom complet du surveillé
  age: number;         // Âge du surveillé
  status: MoodStatus;  // L'état (WELL, TIRED, etc.) - sera utilisé pour l'icône et la couleur
  log_date: string;    // Date formatée par le backend (ex: "31/01/2026")
  log_time: string;    // Heure formatée par le backend (ex: "17:30")
}

export type AppointmentType = 'doctor' | 'physio' | 'exam' | 'dentist' | 'specialist' | 'other';
export type AppointmentStatus = 'upcoming' | 'late' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: AppointmentType;
  doctorName: string;
  location: string;
  phone?: string;
  notes?: string;
  reminder?: '1h' | '1d' | '2d' | 'none';
  status: AppointmentStatus;
}

// Labels et icônes des catégories
export const ACTIVITY_CATEGORIES: Record<ActivityCategory, { label: string; icon: string }> = {
  Sommeil_nocturne: { label: 'Sommeil nocturne', icon: '🌙' },
  Sieste_diurne: { label: 'Sieste diurne', icon: '🛌' },
  Repos_passif: { label: 'Repos passif', icon: '🛋️' },
  Preparation_repas: { label: 'Préparation repas', icon: '🍳' },
  Prise_repas: { label: 'Prise de repas', icon: '🍽️' },
  Collation: { label: 'Collation', icon: '🥪' },
  Prise_medicaments: { label: 'Prise de médicaments', icon: '💊' },
  Utilisation_toilettes: { label: 'Utilisation toilettes', icon: '🚽' },
  Douche: { label: 'Douche', icon: '🚿' },
  Loisir_sedentaires: { label: 'Loisirs sédentaires', icon: '📺' },
  Deplacement_interne: { label: 'Déplacement interne', icon: '🚶‍♂️' },
  Sortie_domicile: { label: 'Sortie du domicile', icon: '🏠' },
  Retour_domicile: { label: 'Retour au domicile', icon: '🏡' },
};

export const APPOINTMENT_TYPES: Record<AppointmentType, { label: string; icon: string }> = {
  doctor: { label: 'Médecin', icon: '👨‍⚕️' },
  physio: { label: 'Kinésithérapie', icon: '🏃' },
  exam: { label: 'Examens', icon: '🔬' },
  dentist: { label: 'Dentiste', icon: '🦷' },
  specialist: { label: 'Spécialiste', icon: '🩺' },
  other: { label: 'Autre', icon: '📋' },
};

// MISE À JOUR : Clés modifiées pour correspondre à l'ENUM SQL
export const MOOD_OPTIONS: Record<MoodStatus, { label: string; icon: string; color: string }> = {
  WELL: { label: 'Je vais bien', icon: '😊', color: 'bg-green-500 hover:bg-green-600' },
  TIRED: { label: 'Je suis fatigué(e)', icon: '😴', color: 'bg-blue-500 hover:bg-blue-600' },
  SICK: { label: 'Je suis malade', icon: '😷', color: 'bg-orange-500 hover:bg-orange-600' },
  PAIN: { label: "J'ai mal", icon: '🤕', color: 'bg-red-500 hover:bg-red-600' },
  AT_HOME: { label: 'Je suis à la maison', icon: '🏠', color: 'bg-purple-500 hover:bg-purple-600' },
};

// Timeline et Alertes (inchangés)
export type TimelineEventSource = 'predicted' | 'manual';
export interface TimelineEvent {
  id: string;
  time: string;
  date: string;
  category: ActivityCategory;
  description: string;
  source: TimelineEventSource;
  confidence?: number;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AnomalyType = 'fall' | 'prolonged_immobility' | 'unusual_late_sleep' | 'missed_meal' | 'abnormal_sleep_duration' | 'unusual_inactivity' | 'deviation_from_routine';

export interface Alert {
  id: string;
  type: AnomalyType;
  detectedAt: string;
  severity: AlertSeverity;
  description: string;
  probableCause: string;
  isAcknowledged: boolean;
}

export const ANOMALY_TYPES: Record<AnomalyType, { label: string; icon: string }> = {
  fall: { label: 'Chute détectée', icon: '⚠️' },
  prolonged_immobility: { label: 'Immobilité prolongée', icon: '🚨' },
  unusual_late_sleep: { label: 'Coucher tardif inhabituel', icon: '🌙' },
  missed_meal: { label: 'Repas manqué', icon: '🍽️' },
  abnormal_sleep_duration: { label: 'Durée de sommeil anormale', icon: '😴' },
  unusual_inactivity: { label: 'Inactivité inhabituelle', icon: '⏸️' },
  deviation_from_routine: { label: 'Écart à la routine', icon: '📊' },
};

export const SEVERITY_LEVELS: Record<AlertSeverity, { label: string; color: string }> = {
  low: { label: 'Faible', color: 'bg-yellow-500' },
  medium: { label: 'Modéré', color: 'bg-orange-500' },
  high: { label: 'Élevé', color: 'bg-red-500' },
  critical: { label: 'Critique', color: 'bg-red-700' },
};
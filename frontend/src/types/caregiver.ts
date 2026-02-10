// Types for the caregiver (aidant) interface

import { ActivityCategory, AppointmentType, TimelineEventSource, AlertSeverity, AnomalyType } from './dependent';

// Re-export shared types
export { 
  ACTIVITY_CATEGORIES, 
  APPOINTMENT_TYPES, 
  ANOMALY_TYPES, 
  SEVERITY_LEVELS 
} from './dependent';

// Medication managed by caregiver
export interface CaregiverMedication {
  id: string;
  name: string;
  dosage: string;
  date: string;
  time: string;
  dependentId: string;
  notes?: string;
  confirmedByDependent: boolean;
  confirmedAt?: string;
  status: 'pending' | 'taken' | 'missed' | 'late';
}

// Appointment managed by caregiver
export interface CaregiverAppointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: AppointmentType;
  comment?: string;
  dependentId: string;
  reminder?: '1h' | '1d' | '2d' | 'none';
  syncedToDependent: boolean;
}

// Timeline event viewed by caregiver
export interface CaregiverTimelineEvent {
  id: string;
  time: string;
  date: string;
  category: ActivityCategory;
  description: string;
  source: TimelineEventSource;
  confidence?: number;
}

// Alert viewed by caregiver
export interface CaregiverAlert {
  id: string;
  type: AnomalyType;
  detectedAt: string;
  severity: AlertSeverity;
  description: string;
  probableCause: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  recommendedAction: string;
}

// Dependent info for caregiver dashboard
export interface DependentInfo {
  id: string;
  name: string;
  age: number;
  lastActivity?: string;
  currentStatus: 'good' | 'tired' | 'sick' | 'pain' | 'home' | 'unknown';
  statusUpdatedAt?: string;
}

// Medication status labels
export const MEDICATION_STATUS: Record<CaregiverMedication['status'], { label: string; color: string; bgColor: string }> = {
  pending: { label: 'À prendre', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  taken: { label: 'Pris', color: 'text-green-700', bgColor: 'bg-green-100' },
  missed: { label: 'Manqué', color: 'text-red-700', bgColor: 'bg-red-100' },
  late: { label: 'En retard', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

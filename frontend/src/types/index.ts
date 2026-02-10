export type UserRole = 'admin' | 'caregiver' | 'dependent';

export type DependencyCategory =
  | 'elderly'                // Personnes âgées
  | 'disability'             // Personnes en situation de handicap
  | 'chronic_disease'        // Maladies chroniques
  | 'post_hospitalization'   // Suivi post-hospitalier
  | 'social_vulnerability'   // Vulnérabilité sociale
  | 'cognitive_disorder'     // Troubles cognitifs
  | 'temporary_care'         // Soins temporaires
  | 'palliative_care';       // Soins palliatifs

// Options de relation pour les caregivers
export type RelationshipType =
  | 'parent'     // Parent (ex. père ou mère)
  | 'enfant'     // Enfant (fils ou fille)
  | 'conjoint'   // Conjoint(e) (mari ou femme / partenaire)
  | 'frere_soeur' // Frère / Sœur
  | 'autre';      // Autre

// Objet pour les options de relation (pour les listes déroulantes)
export const RELATIONSHIP_OPTIONS = [
  { value: 'parent' as RelationshipType, label: 'Parent' },
  { value: 'enfant' as RelationshipType, label: 'Enfant' },
  { value: 'conjoint' as RelationshipType, label: 'Conjoint(e)' },
  { value: 'frere_soeur' as RelationshipType, label: 'Frère / Sœur' },
  { value: 'autre' as RelationshipType, label: 'Autre' },
] as const;

// Fonction pour obtenir le label d'une relation
export function getRelationshipLabel(relationship: RelationshipType | string): string {
  const option = RELATIONSHIP_OPTIONS.find(opt => opt.value === relationship);
  return option ? option.label : relationship || 'Non défini';
}

export interface BaseUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface User extends BaseUser {
  // Champs communs à tous les utilisateurs
}

export interface Caregiver extends BaseUser {
  role: 'caregiver';
  profession?: string;
  relationship_type?: RelationshipType;
  dependents?: Dependent[]; // Dependants associés à ce caregiver
}

export interface Dependent extends BaseUser {
  role: 'dependent';
  dependency_category: DependencyCategory;
  caregivers?: Caregiver[]; // Caregivers associés à ce dépendant
}

export interface CaregiverDependentAssociation {
  id: string;
  caregiver_id: string;
  dependent_id: string;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  usersByRole: {
    
    caregiver: { total: number; active: number; inactive: number };
    dependent: { total: number; active: number; inactive: number };
  };
  dependencyCategories: Record<DependencyCategory, number>;
  relationshipTypes: Record<RelationshipType, number>; // Ajout des statistiques par type de relation
  totalAssociations: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
}

export interface CreateCaregiverData extends CreateUserData {
  role: 'caregiver';
  profession?: string;
  relationship_type?: RelationshipType;
}

export interface CreateDependentData extends CreateUserData {
  role: 'dependent';
  dependency_category: DependencyCategory;
  caregiver_ids?: string[]; // IDs des caregivers à associer
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface UpdateCaregiverData extends UpdateUserData {
  profession?: string;
  relationship_type?: RelationshipType;
}

export interface UpdateDependentData extends UpdateUserData {
  dependency_category?: DependencyCategory;
}

// Types pour les formulaires
export interface CaregiverFormData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  profession: string;
  relationship_type: RelationshipType | '';
}

export interface DependentFormData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  dependency_category: DependencyCategory;
  caregiver_ids: string[];
}
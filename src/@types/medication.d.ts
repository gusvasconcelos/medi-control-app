export namespace Medication {
  export type MedicationForm =
    | 'tablet'
    | 'capsule'
    | 'liquid'
    | 'injection'
    | 'cream'
    | 'drops'
    | 'spray'
    | 'inhaler'
    | 'patch'
    | 'other';

  export type ViaAdministration =
    | 'oral'
    | 'topical'
    | 'injection'
    | 'inhalation'
    | 'sublingual'
    | 'rectal'
    | 'other';

  export type MedicationLogStatus = 'pending' | 'taken' | 'missed' | 'skipped';

  export interface Medication {
    id: number;
    name: string;
    activePrinciple: string | null;
    manufacturer: string | null;
    category: string | null;
    therapeuticClass: string | null;
    registrationNumber: string;
    strength: string | null;
    form: MedicationForm | null;
    description: string | null;
    warnings: string | null;
    interactions: string[] | null;
    createdAt: string;
    updatedAt: string;
  }

  export interface MedicationLog {
    id: number;
    userMedicationId: number;
    scheduledAt: string;
    takenAt: string | null;
    status: MedicationLogStatus;
    notes: string | null;
    createdAt: string;
  }

  export interface UserMedication {
    id: number;
    userId: number;
    medicationId: number;
    dosage: string;
    timeSlots: string[];
    viaAdministration: ViaAdministration;
    duration: number | null;
    startDate: string;
    endDate: string | null;
    initialStock: number;
    currentStock: number;
    lowStockThreshold: number;
    notes: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    medication: MedicationModel;
    logs: MedicationLog[];
  }

  export interface StoreUserMedicationWithExisting {
    medication_id: number;
    dosage: string;
    time_slots: string[];
    via_administration: ViaAdministration;
    duration?: number | null;
    start_date: string;
    end_date?: string | null;
    initial_stock: number;
    current_stock: number;
    low_stock_threshold: number;
    notes?: string | null;
  }

  export interface StoreUserMedicationWithNew {
    medication_name: string;
    medication_active_principle: string;
    medication_manufacturer?: string | null;
    medication_category?: string | null;
    medication_strength?: string | null;
    medication_form?: MedicationForm | null;
    dosage: string;
    time_slots: string[];
    via_administration: ViaAdministration;
    duration?: number | null;
    start_date: string;
    end_date?: string | null;
    initial_stock: number;
    current_stock: number;
    low_stock_threshold: number;
    notes?: string | null;
  }

  export interface UpdateUserMedication {
    dosage?: string;
    time_slots?: string[];
    via_administration?: ViaAdministration;
    duration?: number | null;
    start_date?: string;
    end_date?: string | null;
    initial_stock?: number;
    current_stock?: number;
    low_stock_threshold?: number;
    notes?: string | null;
    active?: boolean;
  }

  export interface UserMedicationResponse {
    message: string;
    data: UserMedication[];
  }

  export interface DeleteUserMedicationResponse {
    message: string;
  }

  export interface GetUserMedicationsParams {
    start_date?: string;
    end_date?: string;
  }

  export interface SearchMedicationsParams {
    search: string;
    limit?: number;
  }

  export interface SearchMedicationsResponse {
    data: Medication[];
  }

  export interface DayIndicator {
    date: string;
    totalScheduled: number;
    totalTaken: number;
  }

  export interface GetMedicationIndicatorsResponse {
    data: DayIndicator[];
  }

  export interface GetMedicationIndicatorsParams {
    startDate: string;
    endDate: string;
  }

  export interface LogTakenPayload {
    time_slot: string;
    taken_at?: string;
    notes?: string;
  }

  export interface LogTakenResponse {
    data: MedicationLog;
  }
}

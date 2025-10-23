export namespace Medication {
  /**
   * Forma farmacêutica do medicamento
   */
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

  /**
   * Via de administração do medicamento
   */
  export type ViaAdministration =
    | 'oral'
    | 'topical'
    | 'injection'
    | 'inhalation'
    | 'sublingual'
    | 'rectal'
    | 'other';

  /**
   * Status da tomada do medicamento
   */
  export type MedicationLogStatus = 'pending' | 'taken' | 'missed' | 'skipped';

  /**
   * Modelo de medicamento (convertido para camelCase pelo interceptor)
   */
  export interface MedicationModel {
    id: number;
    name: string;
    activePrinciple: string | null;
    manufacturer: string | null;
    category: string | null;
    therapeuticClass: string | null;
    strength: string | null;
    form: MedicationForm | null;
    description: string | null;
    warnings: string | null;
    interactions: string[] | null;
    createdAt: string;
    updatedAt: string;
  }

  /**
   * Log de tomada de medicamento (convertido para camelCase pelo interceptor)
   */
  export interface MedicationLog {
    id: number;
    userMedicationId: number;
    scheduledAt: string;
    takenAt: string | null;
    status: MedicationLogStatus;
    notes: string | null;
    createdAt: string;
  }

  /**
   * Medicamento do usuário (convertido para camelCase pelo interceptor)
   */
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

  /**
   * Payload para cadastrar medicamento usando medicamento existente
   */
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

  /**
   * Payload para cadastrar medicamento criando novo medicamento
   */
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

  /**
   * Payload para atualizar medicamento do usuário
   */
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

  /**
   * Resposta de cadastro/atualização de medicamento
   */
  export interface UserMedicationResponse {
    message: string;
    data: UserMedication;
  }

  /**
   * Resposta de remoção de medicamento
   */
  export interface DeleteUserMedicationResponse {
    message: string;
  }

  /**
   * Parâmetros para listagem de medicamentos
   */
  export interface GetUserMedicationsParams {
    start_date?: string;
    end_date?: string;
  }

  /**
   * Parâmetros para busca de medicamentos
   */
  export interface SearchMedicationsParams {
    search: string;
    limit?: number;
  }

  /**
   * Indicador de medicamentos por dia
   */
  export interface DayIndicator {
    date: string;
    totalScheduled: number;
    totalTaken: number;
  }

  /**
   * Resposta de indicadores de medicamentos
   */
  export interface GetMedicationIndicatorsResponse {
    data: DayIndicator[];
  }

  /**
   * Parâmetros para obter indicadores de medicamentos
   */
  export interface GetMedicationIndicatorsParams {
    startDate: string;
    endDate: string;
  }

  /**
   * Payload para marcar medicamento como tomado
   */
  export interface LogTakenPayload {
    time_slot: string;
    taken_at?: string;
    notes?: string;
  }

  /**
   * Resposta de log de medicamento tomado
   */
  export interface LogTakenResponse {
    data: MedicationLog;
  }
}

import type { Medication } from '@/src/@types';
import { api } from '@/src/api/index';
import { API_ROUTES } from '@/src/constants/api';

/**
 * Listar medicamentos ativos do usuário
 * @param params - Parâmetros opcionais de filtro (start_date, end_date)
 */
export const getUserMedications = async (params?: Medication.GetUserMedicationsParams) => {
  const { data } = await api.get<Medication.UserMedication[]>(
    API_ROUTES.userMedications.list,
    { params }
  );

  return data;
};

/**
 * Obter detalhes de um medicamento específico
 * @param id - ID do medicamento do usuário
 */
export const getUserMedication = async (id: number) => {
  const { data } = await api.get<Medication.UserMedication>(
    API_ROUTES.userMedications.show(id)
  );

  return data;
};

/**
 * Cadastrar novo medicamento usando medicamento existente
 * @param payload - Dados do medicamento do usuário
 */
export const createUserMedicationWithExisting = async (
  payload: Medication.StoreUserMedicationWithExisting
) => {
  const { data } = await api.post<Medication.UserMedicationResponse>(
    API_ROUTES.userMedications.create,
    payload
  );

  return data;
};

/**
 * Cadastrar novo medicamento criando um novo medicamento
 * @param payload - Dados do medicamento do usuário e do medicamento
 */
export const createUserMedicationWithNew = async (
  payload: Medication.StoreUserMedicationWithNew
) => {
  const { data } = await api.post<Medication.UserMedicationResponse>(
    API_ROUTES.userMedications.create,
    payload
  );

  return data;
};

/**
 * Atualizar medicamento do usuário
 * @param id - ID do medicamento do usuário
 * @param payload - Dados a serem atualizados
 */
export const updateUserMedication = async (
  id: number,
  payload: Medication.UpdateUserMedication
) => {
  const { data } = await api.put<Medication.UserMedicationResponse>(
    API_ROUTES.userMedications.update(id),
    payload
  );

  return data;
};

/**
 * Remover medicamento do usuário (soft delete)
 * @param id - ID do medicamento do usuário
 */
export const deleteUserMedication = async (id: number) => {
  const { data } = await api.delete<Medication.DeleteUserMedicationResponse>(
    API_ROUTES.userMedications.delete(id)
  );

  return data;
};

/**
 * Buscar medicamentos cadastrados no sistema
 * @param params - Parâmetros de busca (search, limit)
 */
export const searchMedications = async (params: Medication.SearchMedicationsParams) => {
  const { data } = await api.get<Medication.MedicationModel[]>(
    API_ROUTES.userMedications.searchMedications,
    { params }
  );

  return data;
};

/**
 * Obter indicadores de medicamentos por dia
 * @param params - Parâmetros de período (startDate, endDate)
 */
export const getMedicationIndicators = async (params: Medication.GetMedicationIndicatorsParams) => {
  const { data } = await api.get<Medication.GetMedicationIndicatorsResponse>(
    API_ROUTES.userMedications.indicators,
    { params }
  );

  return data.data;
};

/**
 * Marcar medicamento como tomado
 * @param id - ID do medicamento do usuário
 * @param payload - Dados do log (time_slot, taken_at, notes)
 */
export const logMedicationTaken = async (
  id: number,
  payload: Medication.LogTakenPayload
) => {
  const { data } = await api.post<Medication.LogTakenResponse>(
    API_ROUTES.userMedications.logTaken(id),
    payload
  );

  return data.data;
};

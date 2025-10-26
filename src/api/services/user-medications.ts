import type { Medication } from '@/src/@types';
import { api } from '@/src/api/index';
import { API_ROUTES } from '@/src/constants/api';

export const getUserMedications = async (params?: Medication.GetUserMedicationsParams) => {
  const { data } = await api.get<Medication.UserMedicationResponse>(
    API_ROUTES.userMedications.list,
    { params }
  );

  return data;
};

export const getUserMedication = async (id: number) => {
  const { data } = await api.get<Medication.UserMedication>(
    API_ROUTES.userMedications.show(id)
  );

  return data;
};

export const createUserMedicationWithExisting = async (
  payload: Medication.StoreUserMedicationWithExisting
) => {
  const { data } = await api.post<Medication.UserMedicationResponse>(
    API_ROUTES.userMedications.create,
    payload
  );

  return data;
};

export const createUserMedicationWithNew = async (
  payload: Medication.StoreUserMedicationWithNew
) => {
  const { data } = await api.post<Medication.UserMedicationResponse>(
    API_ROUTES.userMedications.create,
    payload
  );

  return data;
};

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

export const deleteUserMedication = async (id: number) => {
  const { data } = await api.delete<Medication.DeleteUserMedicationResponse>(
    API_ROUTES.userMedications.delete(id)
  );

  return data;
};

export const getMedicationIndicators = async (params: Medication.GetMedicationIndicatorsParams) => {
  const { data } = await api.get<Medication.GetMedicationIndicatorsResponse>(
    API_ROUTES.userMedications.indicators,
    { params }
  );

  return data.data;
};

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

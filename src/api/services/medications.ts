import type { Medication } from "@/src/@types";
import { api } from "@/src/api/index";
import { API_ROUTES } from "@/src/constants/api";

export const searchMedications = async (params: Medication.SearchMedicationsParams) => {
  const { data } = await api.get<Medication.SearchMedicationsResponse>(
    API_ROUTES.medications.search,
    { params }
  );

  return data;
};
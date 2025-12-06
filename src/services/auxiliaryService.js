import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

export const getAuxiliarydata = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/unit/${unitId}/candidate/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Distribution:", error);
      throw error;
    }
  };
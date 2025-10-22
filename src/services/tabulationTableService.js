import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

// Get insert scores by unit ID


export const getUnitAndCandidateSummary = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.TABULATION}/ratio?unitId=${unitId}&candidate_id=${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching scoring criteria:", error);
      throw error;
    }
};
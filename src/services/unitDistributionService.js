import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

// Get insert scores by unit ID

export const getNormalDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/normal-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};

export const getTDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/t-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};

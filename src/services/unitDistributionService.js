import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

// Get insert scores by unit ID

export const getNormalDistributionData = async (filters) => {
  try {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        // Handle array of candidate IDs by joining with commas
        if (key === 'candidate_id' && Array.isArray(value)) {
          params[key] = value.join(',');
          console.log("Processing candidate_id array:", value, "->", params[key]);
        } else {
          params[key] = value;
        }
      }
    });

    console.log("Final API params:", params);
    const query = new URLSearchParams(params).toString();
    const url = `${API_ROUTES.UNITDISTRIBUTION}?${query}`;
    console.log("API URL:", url);
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};
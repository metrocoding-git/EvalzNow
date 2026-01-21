import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";


// Get all global analytics data
export const getAllGLobalAnalyticsData = async (clientId) => {
    try {
      const response = await api.get(`${API_ROUTES.GLOBAL_ANALYTICS}/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching global analytics:", error);
      throw error;
    }
};

// Get all global analytics data
export const getUnitSuccessRatesByThreshold = async (clientId) => {
    try {
      const response = await api.get(`${API_ROUTES.GLOBAL_ANALYTICS}/thres/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching global analytics threshold:", error);
      throw error;
    }
};



// Get all global analytics data
export const getSTAPAndSTAGStableCount = async (clientId) => {
  try {
    const response = await api.get(`${API_ROUTES.GLOBAL_ANALYTICS}/stable/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching global analytics threshold:", error);
    throw error;
  }
};
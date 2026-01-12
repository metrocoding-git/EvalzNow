import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";


// Get all global analytics data
export const getDataExtractionByUnitId = async (unitId) => {
    try {
      const response = await api.get(`${API_ROUTES.DATA_EXTRACTION}/${unitId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data extraction:", error);
      throw error;
    }
};

// Get all global analytics data
export const getDataExtractionByClientId = async (clientId) => {
    try {
      const response = await api.get(`${API_ROUTES.DATA_EXTRACTION}/all/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data extraction:", error);
      throw error;
    }
};



// Get all global analytics data
export const getDataExtractionByCandidateId = async (clientId, candidateId) => {
  try {
    const response = await api.get(`${API_ROUTES.DATA_EXTRACTION}/all/${clientId}/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data extraction:", error);
    throw error;
  }
};
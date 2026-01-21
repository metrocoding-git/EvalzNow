import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";


// Get all global analytics data
export const getGlobalDataReportByClient = async (clientId) => {
    try {
      const response = await api.get(`${API_ROUTES.DATA_REPORT}/global/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data report:", error);
      throw error;
    }
};

// Get all global analytics data
export const getDataReportByUnit = async (unitId) => {
    try {
      const response = await api.get(`${API_ROUTES.DATA_REPORT}/unit-level/${unitId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data report:", error);
      throw error;
    }
};

// Get all global analytics data
export const getDataReportByUnitAllCandidates = async (unitId) => {
    try {
      const response = await api.get(`${API_ROUTES.DATA_REPORT}/candidate-level/${unitId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data report:", error);
      throw error;
    }
};



// Get all global analytics data
export const getDataReportByClient = async (clientId) => {
  try {
    const response = await api.get(`${API_ROUTES.DATA_REPORT}/client-level/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data report:", error);
    throw error;
  }
};

// Get all global analytics data
export const getDataReportByUnitCandidate = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.DATA_REPORT}/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data report:", error);
      throw error;
    }
};
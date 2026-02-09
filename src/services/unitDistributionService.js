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

export const getExponentialDistributionData = async (unitId, candidateId) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/exponential-dist?unitId=${unitId}&candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};

export const getChiDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/chi-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getFDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/f-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};



export const getBetaDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/beta-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getUniformDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/uniform-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getWeibullPDFDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/weibull-pdf-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getWeibullCDFDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/weibull-cdf-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getWeibullRiskDistributionData = async (payload) => {
  try {
    const response = await api.post(`${API_ROUTES.UNITDISTRIBUTION}/weibull-risk-dist`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};
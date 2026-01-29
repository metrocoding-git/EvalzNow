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

export const getChiDistributionData = async (unitId, candidateId) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/chi-dist?unitId=${unitId}&candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getFDistributionData = async (unitId, candidateId) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/f-dist?unitId=${unitId}&candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};



export const getBetaDistributionData = async (unitId, candidateId) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/beta-dist?unitId=${unitId}&candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getUniformDistributionData = async (unitId, candidateId) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/uniform-dist?unitId=${unitId}&candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getWeibullPDFDistributionData = async (unitId, candidateId, beta) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/weibull-pdf-dist?unitId=${unitId}&candidate_id=${candidateId}&beta=${beta}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getWeibullCDFDistributionData = async (unitId, candidateId, beta) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/weibull-cdf-dist?unitId=${unitId}&candidate_id=${candidateId}&beta=${beta}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};


export const getWeibullRiskDistributionData = async (unitId, candidateId, beta) => {
  try {
    const response = await api.get(`${API_ROUTES.UNITDISTRIBUTION}/weibull-risk-dist?unitId=${unitId}&candidate_id=${candidateId}&beta=${beta}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Distribution:", error);
    throw error;
  }
};
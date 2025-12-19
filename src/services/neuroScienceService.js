import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

export const createNeuroObject = async (neuroObjectData) => {
    try {
      const response = await api.post(API_ROUTES.NEURO_SCIENCE, neuroObjectData);
      return response.data;
    } catch (error) {
      console.error("Error creating Neuro Science:", error);
      throw error;
    }
  };

export const getNeuroObjectbyUnitAndCandidate = async (unitId, candidateId) => {
    try {
        const response = await api.get(`${API_ROUTES.NEURO_SCIENCE}/${unitId}/${candidateId}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
          return []; // ← IMPORTANT
        }
        throw error;
    }
};


export const getNeuroObjectRMSValue = async (params) => {
  try {
      const { unitId, candidateId, ppIdFrom, ppIdTo, criticalRefDateFrom, criticalRefDateTo } = params;
      let queryString = `${API_ROUTES.NEURO_SCIENCE}/rms/${unitId}/${candidateId}`;
      const queryParams = [];
      
      if (ppIdFrom !== undefined && ppIdFrom !== null) {
        queryParams.push(`ppIdFrom=${ppIdFrom}`);
      }
      if (ppIdTo !== undefined && ppIdTo !== null) {
        queryParams.push(`ppIdTo=${ppIdTo}`);
      }
      if (criticalRefDateFrom) {
        queryParams.push(`criticalRefDateFrom=${criticalRefDateFrom}`);
      }
      if (criticalRefDateTo) {
        queryParams.push(`criticalRefDateTo=${criticalRefDateTo}`);
      }
      
      if (queryParams.length > 0) {
        queryString += `?${queryParams.join('&')}`;
      }
      
      const response = await api.get(queryString);
      return response.data;
  } catch (error) {
      if (error.response?.status === 404) {
        return { data: [] }; // IMPORTANT
      }
      throw error;
  }
};


export const updateNeuroObject = async (sessionId, updateData) => {
  try {
      const response = await api.put(`${API_ROUTES.NEURO_SCIENCE}/${sessionId}`, updateData);
      return response.data;
  } catch (error) {
      console.error("Error creating Neuro Science:", error);
      throw error;
  }
};
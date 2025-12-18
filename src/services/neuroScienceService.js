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
        console.error("Error creating Neuro Science:", error);
        throw error;
    }
};


export const getNeuroObjectRMSValue = async (unitId, candidateId) => {
  try {
      const response = await api.get(`${API_ROUTES.NEURO_SCIENCE}/rms/${unitId}/${candidateId}`);
      return response.data;
  } catch (error) {
      console.error("Error creating Neuro Science:", error);
      throw error;
  }
};
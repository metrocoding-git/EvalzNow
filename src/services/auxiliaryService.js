import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

export const getAuxiliarydata = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/unit/${unitId}/candidate/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching auxilary data:", error);
      throw error;
    }
  };

  export const getCandidateMarks = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/marks/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const createCandidateMarks = async (candidateMarks) => {
    try {
      const response = await api.post(`${API_ROUTES.AUXILIARY}/marks`, candidateMarks);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const getNeedAssessment = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/assessment/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const createNeedAssessment = async (needAssessment) => {
    try {
      const response = await api.post(`${API_ROUTES.AUXILIARY}/assessment`, needAssessment);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };


  export const getUnitImprovement = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/lesson/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };

  export const createUnitImprovement = async (unitImprovement) => {
    try {
      const response = await api.post(`${API_ROUTES.AUXILIARY}/lesson`, unitImprovement);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };

  export const updateUnitImprovement = async (id, unitImprovement) => {
    try {
      const response = await api.put(`${API_ROUTES.AUXILIARY}/lesson/${id}`, unitImprovement);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };


  export const getLeaderMarks = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/leader/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };

  export const createLeaderMarks = async (leaderMarks) => {
    try {
      const response = await api.post(`${API_ROUTES.AUXILIARY}/leader`, leaderMarks);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };
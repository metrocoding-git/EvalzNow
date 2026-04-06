import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

export const getAuxiliarydata = async (unitId, candidateId, filters = {}) => {
  try {
    const safeFilters = filters ?? {}; // 👈 KEY FIX

    const params = new URLSearchParams();

    if (safeFilters.ppIdFrom) params.append("ppIdFrom", safeFilters.ppIdFrom);
    if (safeFilters.ppIdTo) params.append("ppIdTo", safeFilters.ppIdTo);
    if (safeFilters.criticalRefDateFrom)
      params.append("criticalRefDateFrom", safeFilters.criticalRefDateFrom);
    if (safeFilters.criticalRefDateTo)
      params.append("criticalRefDateTo", safeFilters.criticalRefDateTo);

    const url = `${API_ROUTES.AUXILIARY}/unit/${unitId}/candidate/${candidateId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching auxiliary data:", error);
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

  export const updateNeedAssessment = async (id, updateData) => {
    try {
      const response = await api.put(`${API_ROUTES.AUXILIARY}/assessment/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const deleteNeedAssessment = async (id) => {
    try {
      const response = await api.delete(`${API_ROUTES.AUXILIARY}/assessment/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };


  export const getUnitImprovement = async (unitId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/lesson/${unitId}`);
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

  export const deleteUnitImprovement = async (id) => {
    try {
      const response = await api.delete(`${API_ROUTES.AUXILIARY}/lesson/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const getLeaderMarks = async (unitId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/leader/${unitId}`);
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


  export const getEffortBu = async (unitId, candidateId, filters = {}) => {
    const response = await api.get(
      `${API_ROUTES.AUXILIARY}/effort/${unitId}/${candidateId}`,
      {
        params: {
          ppIdFrom: filters.ppIdFrom,
          ppIdTo: filters.ppIdTo,
          criticalRefDateFrom: filters.criticalDateFrom,
          criticalRefDateTo: filters.criticalDateTo
        }
      }
    );
  
    return response.data;
  };
  
  

  export const createAssessmentChain = async (assessment) => {
    try {
      const response = await api.post(`${API_ROUTES.AUXILIARY}/chain`, assessment);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };

  export const getAssessmentChain = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/chain/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };


  export const getAssessmentChainById = async (id) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/chain/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const updateAssessmentChain = async (id, payload) => {
    try {
      const response = await api.put(`${API_ROUTES.AUXILIARY}/chain/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate marks:", error);
      throw error;
    }
  };

  export const getNeedAssessmentSummary = async (unitId, candidateId) => {
    try {
      const response = await api.get(`${API_ROUTES.AUXILIARY}/assessment/summary/${unitId}/${candidateId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unit improvment:", error);
      throw error;
    }
  };
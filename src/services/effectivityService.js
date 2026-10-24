import { API_ROUTES } from "@/lib/apiRoutes";
import api from "@/lib/axiosClient";

const qs = (params = {}) => {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
};

const filterQuery = (f = {}) => ({
  ppIdFrom: f?.ppIdFrom,
  ppIdTo: f?.ppIdTo,
  criticalRefDateFrom: f?.criticalDateFrom,
  criticalRefDateTo: f?.criticalDateTo,
});

// Drop-down options + fixed thresholds per unit type.
export const getEffectivityOptions = async () => {
  const response = await api.get(`${API_ROUTES.EFFECTIVITY}/options`);
  return response.data;
};

// Effectivity table of one candidate ({ ppIdFrom, ppIdTo } optional).
export const getCandidateEffectivity = async (unitId, candidateId, filters = {}) => {
  const response = await api.get(
    `${API_ROUTES.EFFECTIVITY}/candidate/${unitId}/${candidateId}${qs(filterQuery(filters))}`
  );
  return response.data;
};

// Unit level: every (or the selected) candidate + unit pass fractions and type breakdown.
export const getUnitEffectivity = async (unitId, candidateIds = [], filters = {}) => {
  const ids = Array.isArray(candidateIds) ? candidateIds.join(",") : candidateIds;
  const response = await api.get(
    `${API_ROUTES.EFFECTIVITY}/unit/${unitId}${qs({ candidateIds: ids, ...filterQuery(filters) })}`
  );
  return response.data;
};

// Global (all units of the client).
export const getClientEffectivity = async (clientId) => {
  const response = await api.get(`${API_ROUTES.EFFECTIVITY}/client/${clientId}`);
  return response.data;
};

// Create or update the effectivity object of a candidate's PP ID.
export const saveEffectivity = async (payload) => {
  const response = await api.post(API_ROUTES.EFFECTIVITY, payload);
  return response.data;
};

export const deleteEffectivity = async (id) => {
  const response = await api.delete(`${API_ROUTES.EFFECTIVITY}/${id}`);
  return response.data;
};

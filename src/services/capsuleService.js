/**
 * Capsule service – Capsule (Capacity Accounting) API (/capsules).
 *
 * Same functions, arguments and response shapes as in the UI phase (when the data lived in the browser),
 * so the capsule screens did not change. Capsules belong to the active client (sessionStorage
 * "activeClientId", the same one the unit screens use).
 */
import api from "@/lib/axiosClient";
import { API_ROUTES } from "@/lib/apiRoutes";

const BASE = API_ROUTES.CAPSULES;

const activeClientId = () => (typeof window === "undefined" ? null : window.sessionStorage.getItem("activeClientId"));

/** Rejects with the API message (screens show `err.message`), keeping `err.response` like axios. */
async function call(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || "Request failed";
    const out = new Error(message);
    out.response = err?.response;
    out.status = err?.response?.status;
    throw out;
  }
}

// ---------------------------------------------------------------------------
// Snapshot of all capsule data of the active client (cross-capsule screens, auxiliary logic).
// Cached for a few seconds; every write through this module clears the cache.
// ---------------------------------------------------------------------------
const STORE_TTL_MS = 3000;
let storeCache = null; // { clientId, at, promise }

export function invalidateCapsuleStore() {
  storeCache = null;
}

const write = async (promise) => {
  try {
    return await call(promise);
  } finally {
    invalidateCapsuleStore();
  }
};

/**
 * All capsule data of the active client:
 * { capsules, rosters, blocks, scores, markerNames, projections, effectivity,
 *   auxCandidateMarks, auxNeedAssessments, auxImprovements, auxChains, auxLeaderMarks }
 */
export async function loadCapsuleStore(clientId = activeClientId()) {
  const empty = {
    capsules: [], rosters: [], blocks: [], scores: [], markerNames: {}, projections: [], effectivity: [],
    auxCandidateMarks: [], auxNeedAssessments: [], auxImprovements: [], auxChains: [], auxLeaderMarks: [],
  };
  if (!clientId) return empty;
  const now = Date.now();
  if (!storeCache || storeCache.clientId !== String(clientId) || now - storeCache.at > STORE_TTL_MS) {
    const promise = call(api.get(`${BASE}/store/${clientId}`)).catch((e) => { storeCache = null; throw e; });
    storeCache = { clientId: String(clientId), at: now, promise };
  }
  return { ...empty, ...(await storeCache.promise) };
}

// ---------------------------------------------------------------------------
// Capsules
// ---------------------------------------------------------------------------
export const getAllCapsules = async (clientId = activeClientId()) =>
  (clientId ? call(api.get(`${BASE}/client/${clientId}`)) : []);

export const getCapsuleById = async (id) => call(api.get(`${BASE}/id/${id}`));

export const createCapsule = async (payload) =>
  write(api.post(BASE, { ...payload, clientId: payload.clientId ?? activeClientId() }));

export const updateCapsule = async (id, payload) => write(api.put(`${BASE}/${id}`, payload));

export const deleteCapsule = async (id) => write(api.delete(`${BASE}/${id}`));

// ---------------------------------------------------------------------------
// Capsule roster
// ---------------------------------------------------------------------------
export const getAllCapsuleRoster = async (clientId = activeClientId()) =>
  (clientId ? call(api.get(`${BASE}/roster/client/${clientId}`)) : []);

export const getCapsuleRosterByCapsuleId = async (capsuleDbId) => call(api.get(`${BASE}/roster/capsule/${capsuleDbId}`));

/** Connected capsules of a candidate (Candidate tab → Review). */
export const getCapsulesByCandidateId = async (candidateDbId) => call(api.get(`${BASE}/roster/candidate/${candidateDbId}`));

export const createCapsuleRoster = async (payload) => {
  // the candidate record is joined by the API – only the ids and roster fields are sent
  const { candidate, ...rest } = payload || {};
  return write(api.post(`${BASE}/roster`, { ...rest, candidateId: rest.candidateId ?? candidate?.id }));
};

export const updateCapsuleRoster = async (id, payload) => {
  const { candidate, ...rest } = payload || {};
  return write(api.put(`${BASE}/roster/${id}`, rest));
};

export const deleteCapsuleRoster = async (id) => write(api.delete(`${BASE}/roster/${id}`));

// ---------------------------------------------------------------------------
// Capsule assessment blocks (same PP ID rules as units: Indirect -1,-2,…  Direct 1,2,…)
// ---------------------------------------------------------------------------
export const getCapsuleBlocksByCapsuleAndCandidate = async (capsuleDbId, candidateDbId) =>
  call(api.get(`${BASE}/blocks/${capsuleDbId}/${candidateDbId}`));

export const createCapsuleBlock = async (payload) => write(api.post(`${BASE}/blocks`, payload));

export const updateCapsuleBlock = async (id, payload) => write(api.put(`${BASE}/blocks/${id}`, payload));

export const deleteCapsuleBlock = async (id) => write(api.delete(`${BASE}/blocks/${id}`));

// ---------------------------------------------------------------------------
// Setup View – Insert Scores for Capacity Accounting
// ---------------------------------------------------------------------------
export const getCapsuleScoresByCapsule = async (capsuleDbId) => call(api.get(`${BASE}/scores/${capsuleDbId}`));

export const getCapsuleScoresByCapsuleAndCandidate = async (capsuleDbId, candidateDbId) =>
  call(api.get(`${BASE}/scores/${capsuleDbId}/${candidateDbId}`));

export const createCapsuleScore = async (payload) => {
  const { candidate, ...rest } = payload || {};
  return write(api.post(`${BASE}/scores`, rest));
};

export const updateCapsuleScore = async (id, payload) => {
  const { candidate, ...rest } = payload || {};
  return write(api.put(`${BASE}/scores/${id}`, rest));
};

export const deleteCapsuleScore = async (id) => write(api.delete(`${BASE}/scores/${id}`));

/**
 * Allowed Critical Reference Date range for a PP ID (same idea as the unit API):
 * not before the latest date of the previous PP ID, not after the earliest date of the next PP ID.
 */
export const getCapsuleCriticalRange = async (capsuleDbId, candidateDbId, ppId, ignoreScoreId = null) => {
  const q = new URLSearchParams({ ppId: String(ppId) });
  if (ignoreScoreId !== null && ignoreScoreId !== undefined) q.set("ignoreScoreId", String(ignoreScoreId));
  return call(api.get(`${BASE}/scores/${capsuleDbId}/${candidateDbId}/critical-range?${q}`));
};

/** Clinical Marker names of a capsule (CM89–CM100 are custom criteria and can be renamed, max 30 characters). */
export const getCapsuleMarkerNames = async (capsuleDbId) => call(api.get(`${BASE}/markers/${capsuleDbId}`));

export const updateCapsuleMarkerName = async (capsuleDbId, index, name) =>
  write(api.put(`${BASE}/markers/${capsuleDbId}/${index}`, { name: String(name ?? "").slice(0, 30) }));

/** -1, -2, … first, then 1, 2, … (same order as the API). */
const sortScores = (rows) =>
  [...rows].sort((a, b) => {
    const pa = Number(a.ppId), pb = Number(b.ppId);
    if ((pa < 0) !== (pb < 0)) return pa < 0 ? -1 : 1;
    if (pa !== pb) return Math.abs(pa) - Math.abs(pb);
    return String(a.criticalRefDate).localeCompare(String(b.criticalRefDate)) || a.id - b.id;
  });

/** Preview – "Master PP ID Bin Totals" (attained / maximum per capacity and PP ID). */
export const getCapsuleBinTotals = async (capsuleDbId, candidateDbId, capacities) => {
  const [capsule, scores] = await Promise.all([
    getCapsuleById(capsuleDbId), getCapsuleScoresByCapsuleAndCandidate(capsuleDbId, candidateDbId),
  ]);
  const byPp = new Map();
  sortScores(scores).forEach((x) => {
    if (!byPp.has(x.ppId)) byPp.set(x.ppId, []);
    byPp.get(x.ppId).push(x);
  });
  return [...byPp.entries()].map(([ppId, list]) => {
    const out = { ppId, capsuleName: capsule.capsuleName, capsuleId: capsule.capsuleId, capsuleType: capsule.capsuleType };
    capacities.forEach(({ name, code }) => {
      const mine = list.filter((x) => x.capacity === name);
      out[`A${code}`] = mine.reduce((t, x) => t + (Number(x.attainedScore) || 0), 0);
      out[`M${code}`] = mine.reduce((t, x) => t + (Number(x.maxScore) || 0), 0);
    });
    return out;
  });
};

/** Preview – Master PP ID table (duration total, latest date, missing capacities). */
export const getCapsulePpSummary = async (capsuleDbId, candidateDbId, capacities) => {
  const [rows, blocks] = await Promise.all([
    getCapsuleScoresByCapsuleAndCandidate(capsuleDbId, candidateDbId),
    getCapsuleBlocksByCapsuleAndCandidate(capsuleDbId, candidateDbId),
  ]);
  const ppIds = [...new Set(rows.map((x) => x.ppId))];
  return ppIds.map((ppId) => {
    const list = rows.filter((x) => x.ppId === ppId);
    const present = new Set(list.map((x) => x.capacity));
    const missing = capacities.map((c) => c.name).filter((n) => !present.has(n));
    const latest = list.map((x) => x.criticalRefDate).sort().pop() || null;
    const block = blocks.find((b) => b.ppId === ppId);
    return {
      ppId,
      shortDescription: block?.shortDescription || null,
      totalDuration: list.reduce((t, x) => t + (Number(x.durationDays) || 0), 0),
      latestCriticalRefDate: latest,
      missingCapacity: missing.join(", ") || null,
      error: missing.length ? "Yes" : "No",
    };
  });
};

// ---------------------------------------------------------------------------
// Growth Metrics – Projection Table sessions (same shape as the unit projection API)
// ---------------------------------------------------------------------------
export const getCapsuleProjection = async (capsuleDbId, candidateDbId) =>
  call(api.get(`${BASE}/projection/${capsuleDbId}/${candidateDbId}`));

export const createCapsuleProjection = async (payload) =>
  write(api.post(`${BASE}/projection`, {
    capsuleId: payload.unitId ?? payload.capsuleId, candidateId: payload.candidateId, points: payload.points || [],
  }));

export const updateCapsuleProjection = async (sessionId, payload) =>
  write(api.put(`${BASE}/projection/${sessionId}`, { points: payload.points || [] }));

// ---------------------------------------------------------------------------
// Effectivity objects (calculations: capsuleEffectivityService)
// ---------------------------------------------------------------------------
export const getCapsuleEffectivityResponses = async (capsuleDbId, candidateIds = []) => {
  const ids = (candidateIds || []).filter((x) => x !== null && x !== undefined && x !== "");
  return call(api.get(`${BASE}/effectivity/${capsuleDbId}${ids.length ? `?candidateIds=${ids.join(",")}` : ""}`));
};
export const saveCapsuleEffectivityResponse = async (payload) => write(api.post(`${BASE}/effectivity`, payload));
export const deleteCapsuleEffectivityResponse = async (id) => write(api.delete(`${BASE}/effectivity/${id}`));

// ---------------------------------------------------------------------------
// Auxiliary Resultants records (kind = candidateMarks | needAssessments | improvements | chains | leaderMarks)
// ---------------------------------------------------------------------------
export const createCapsuleAuxRecord = async (kind, payload) => write(api.post(`${BASE}/aux/${kind}`, payload));
export const updateCapsuleAuxRecord = async (kind, id, payload) => write(api.put(`${BASE}/aux/${kind}/${id}`, payload));
export const deleteCapsuleAuxRecord = async (kind, id) => write(api.delete(`${BASE}/aux/${kind}/${id}`));

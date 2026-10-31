/**
 * Capsule Effectivity – same functions / arguments / responses as effectivityService (unitId = capsule id).
 * The effectivity objects (drop-down values) are stored by the capsule API; the 15 parameters are calculated
 * here with the same logic as the server effectivity controller (Ri = PC1, Rj = PC2, Rk = PC3).
 */
import {
  getAllCapsules, getCapsuleById, getCapsuleEffectivityResponses, saveCapsuleEffectivityResponse, deleteCapsuleEffectivityResponse,
} from "./capsuleService";
import { getCapsuleCandidates, getCapsuleMultipleCandidateSummary } from "./capsuleAnalyticsService";
import * as fx from "@/lib/capsule/capsuleEffectivity";

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** -1, -2, -3 … then 1, 2, 3 … */
const ppOrder = (a, b) => {
  if (a < 0 && b < 0) return b - a;
  if (a < 0) return -1;
  if (b < 0) return 1;
  return a - b;
};

const pickFields = (r) => Object.fromEntries(fx.EFFECTIVITY_FIELDS.map((f) => [f, r ? r[f] ?? null : null]));

function rangeFilter({ ppIdFrom, ppIdTo } = {}) {
  const from = toNum(ppIdFrom);
  const to = toNum(ppIdTo);
  return (pp) => (from === null || pp >= from) && (to === null || pp <= to);
}

const responsesOf = async (capsuleId, candidateIds) => (candidateIds.length
  ? getCapsuleEffectivityResponses(capsuleId, candidateIds)
  : []);

async function tabulate(capsuleId, candidateIds, filters = {}) {
  if (!candidateIds.length) return null;
  return getCapsuleMultipleCandidateSummary({
    capsuleId,
    candidate_id: candidateIds.join(","),
    criticalRefDateFrom: filters.criticalDateFrom || filters.criticalRefDateFrom || undefined,
    criticalRefDateTo: filters.criticalDateTo || filters.criticalRefDateTo || undefined,
  });
}

function buildCandidateTable(candidateId, tab, responses, inRange = () => true) {
  const thresholds = fx.getThresholds();
  const results = (tab?.results || []).filter((r) => String(r.candidateId) === String(candidateId));
  const byPp = new Map();
  results.forEach((r) => {
    const pp = Number(r.ppId);
    if (!Number.isFinite(pp)) return;
    byPp.set(pp, {
      ppId: pp,
      totalDuration: toNum(r.totalDuration),
      criticalRefDate: r.criticalRefDate || r.latestCriticalRefDate || null,
      PC1: toNum(r.PC1), PC2: toNum(r.PC2), PC3: toNum(r.PC3),
    });
  });
  responses.forEach((r) => {
    if (!byPp.has(r.ppId)) byPp.set(r.ppId, { ppId: r.ppId, totalDuration: null, criticalRefDate: null, PC1: null, PC2: null, PC3: null });
  });
  const respByPp = new Map(responses.map((r) => [r.ppId, r]));
  const rows = [...byPp.values()]
    .filter((row) => inRange(row.ppId))
    .sort((a, b) => ppOrder(a.ppId, b.ppId))
    .map((row) => {
      const resp = respByPp.get(row.ppId);
      const parameters = fx.computeParameters(row.PC1, row.PC2, row.PC3);
      return { ...row, id: resp ? resp.id : null, ...pickFields(resp), parameters, pass: fx.passFlags(parameters, thresholds) };
    });

  // Average parameter = parameters of the candidate's average PC1 / PC2 / PC3.
  const avg = (tab?.averages || []).find((a) => String(a.candidateId) === String(candidateId)) || null;
  const averageParameters = avg ? fx.computeParameters(avg.PC1, avg.PC2, avg.PC3) : null;
  const average = {
    PC1: avg ? toNum(avg.PC1) : null, PC2: avg ? toNum(avg.PC2) : null, PC3: avg ? toNum(avg.PC3) : null,
    parameters: averageParameters,
    pass: fx.passFlags(averageParameters, thresholds),
  };
  return { thresholds, rows, average, typeBreakdown: fx.typeBreakdown(rows.filter((r) => r.id)) };
}

function passFractions(averages) {
  return Array.from({ length: fx.PARAMETER_COUNT }, (_, i) => {
    const flags = averages.map((a) => a.pass?.[i]).filter((v) => v === true || v === false);
    return flags.length ? Number((flags.filter(Boolean).length / flags.length).toFixed(3)) : null;
  });
}

async function capsuleSummary(capsule, candidateIds, filters = {}) {
  const tab = await tabulate(capsule.id, candidateIds, filters);
  const responses = await responsesOf(capsule.id, candidateIds);
  const inRange = rangeFilter(filters);
  const candidates = candidateIds.map((cid) => ({
    candidateId: Number(cid),
    ...buildCandidateTable(cid, tab, responses.filter((r) => String(r.candidateId) === String(cid)), inRange),
  }));
  return {
    unitType: capsule.capsuleType,
    thresholds: fx.getThresholds(),
    candidates,
    passFractions: passFractions(candidates.map((c) => c.average)),
    typeBreakdown: fx.typeBreakdown(candidates.flatMap((c) => c.rows.filter((r) => r.id))),
  };
}

async function rosterCandidateIds(capsuleId) {
  return (await getCapsuleCandidates(capsuleId)).map((c) => c.id);
}

/** Drop-down options and the fixed thresholds (same for every capsule type). */
export const getEffectivityOptions = async () => ({
  options: fx.EFFECTIVITY_OPTIONS,
  thresholds: { "Capacity - Combined": fx.getThresholds(), "Capacity - Isolated": fx.getThresholds() },
  cap: fx.PARAMETER_CAP,
});

export const getCandidateEffectivity = async (capsuleId, candidateId, filters = {}) => {
  const capsule = await getCapsuleById(capsuleId);
  const tab = await tabulate(capsule.id, [candidateId], filters);
  const table = buildCandidateTable(candidateId, tab, await responsesOf(capsule.id, [candidateId]), rangeFilter(filters));
  return { unitType: capsule.capsuleType, candidateId: Number(candidateId), ...table };
};

/** Capsule Level (default: whole roster). */
export const getUnitEffectivity = async (capsuleId, candidateIds = [], filters = {}) => {
  const capsule = await getCapsuleById(capsuleId);
  const roster = await rosterCandidateIds(capsule.id);
  const wanted = (Array.isArray(candidateIds) ? candidateIds : String(candidateIds || "").split(","))
    .filter((x) => x !== "" && x !== null && x !== undefined).map(Number);
  const ids = wanted.length ? roster.filter((id) => wanted.includes(Number(id))) : roster;
  return capsuleSummary(capsule, ids, filters);
};

/** All capsules (Clinical Analytics). */
export const getClientEffectivity = async () => {
  const capsules = await getAllCapsules();
  const allAverages = [];
  const allRows = [];
  for (const capsule of capsules) {
    const ids = await rosterCandidateIds(capsule.id);
    if (!ids.length) continue;
    const summary = await capsuleSummary(capsule, ids);
    summary.candidates.forEach((c) => {
      allAverages.push(c.average);
      allRows.push(...c.rows.filter((r) => r.id));
    });
  }
  return {
    unitCount: capsules.length,
    candidateCount: allAverages.length,
    passFractions: passFractions(allAverages),
    typeBreakdown: fx.typeBreakdown(allRows),
  };
};

/** Create or update the effectivity object of a candidate's PP ID (payload.unitId = capsule id). */
export const saveEffectivity = async (payload) => {
  const capsuleId = toNum(payload.unitId ?? payload.capsuleId);
  const candidateId = toNum(payload.candidateId);
  const ppId = toNum(payload.ppId);
  if (!capsuleId || !candidateId || ppId === null || !Number.isInteger(ppId)) {
    const err = new Error("capsuleId, candidateId and ppId are required");
    err.response = { status: 400, data: { message: err.message } };
    throw err;
  }
  return saveCapsuleEffectivityResponse({ capsuleId, candidateId, ppId, ...fx.sanitizeFields(payload) });
};

export const deleteEffectivity = async (id) => deleteCapsuleEffectivityResponse(id);

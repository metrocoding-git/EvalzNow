/**
 * Capsule Analytics.
 *
 * Builds the analytics data of a capsule from the capsule API data (capsuleService) with the
 * Capacity metrics of src/lib/capsule/capsuleMetrics.js. The response has the same shape as the unit
 * tabulation API (GET /tabulation/proficiency) so the analytics screens can use either source.
 * Rows carry both the capsule keys (PC1, ΔPC → dPC1, XCFL …) and the Third Parameter aliases.
 */
import { getCandidateById } from "./candidateService";
import { getCapsuleById, getCapsuleRosterByCapsuleId, getCapsuleScoresByCapsuleAndCandidate } from "./capsuleService";
import { computeCandidateTabulation, withTprmAliases } from "@/lib/capsule/capsuleMetrics";
import { capacitiesOf } from "@/app/dashboard/control-view/capsule/capsuleConfig";
import { ensureStaffDirectory, enrichStaffAssignments } from "@/lib/capsule/staffDirectory";

const candidateCache = new Map();

/** Roster candidate (snapshot) completed with the real candidate record when fields are missing. */
async function fullCandidate(rosterCandidate) {
  if (!rosterCandidate) return null;
  if (rosterCandidate.startDate) return rosterCandidate;
  const id = rosterCandidate.id;
  if (!candidateCache.has(id)) {
    candidateCache.set(id, getCandidateById(id).catch(() => null));
  }
  const real = await candidateCache.get(id);
  return { ...(real || {}), ...rosterCandidate, startDate: real?.startDate ?? rosterCandidate.startDate };
}

export async function getCapsuleCandidates(capsuleId) {
  const roster = await getCapsuleRosterByCapsuleId(capsuleId);
  const list = [];
  const seen = new Set();
  for (const r of roster) {
    if (!r.candidate || seen.has(r.candidate.id)) continue;
    seen.add(r.candidate.id);
    list.push({ ...(await fullCandidate(r.candidate)), capsuleOutcome: r.capsuleOutcome, ageRange: r.ageRange, rosterId: r.id });
  }
  return list;
}

/**
 * Same as getUnitAndMultipleCandidateSummary for a capsule.
 * @param {{capsuleId, candidate_id, ppIdFrom?, ppIdTo?, criticalRefDateFrom?, criticalRefDateTo?}} filters
 */
export async function getCapsuleMultipleCandidateSummary(filters) {
  const { capsuleId } = filters;
  const ids = String(filters.candidate_id ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!capsuleId || !ids.length) return { results: [] };

  const capsule = await getCapsuleById(capsuleId);
  const capacities = capacitiesOf(capsule.capsuleType);
  const candidates = await getCapsuleCandidates(capsuleId);
  const out = { results: [], averages: [], stdDevs: [], stdErrs: [], cumulativeSums: [], cumulativeAverages: [] };

  for (const id of ids) {
    const candidate = candidates.find((c) => String(c.id) === String(id)) || { id };
    const scores = await getCapsuleScoresByCapsuleAndCandidate(capsuleId, id);
    const t = computeCandidateTabulation(capsule, candidate, scores, capacities, {
      ppIdFrom: filters.ppIdFrom,
      ppIdTo: filters.ppIdTo,
      criticalDateFrom: filters.criticalRefDateFrom,
      criticalDateTo: filters.criticalRefDateTo,
    });
    out.results.push(...t.results.map((r) => ({ ...withTprmAliases(r), capsuleId: capsule.id, candidateId: id })));
    if (t.average) out.averages.push({ candidateId: id, ...withTprmAliases(t.average) });
    if (t.stdDev) out.stdDevs.push({ candidateId: id, ...withTprmAliases(t.stdDev) });
    if (t.stdErr) out.stdErrs.push({ candidateId: id, ...withTprmAliases(t.stdErr) });
    if (t.cumulativeSum) {
      const s = t.cumulativeSum;
      out.cumulativeSums.push({ candidateId: id, ...s, deltaRRN: s.dPC1, deltaPRN: s.dPC2, deltaARN: s.dPC3 });
    }
    if (t.cumulativeAverage) {
      const a = t.cumulativeAverage;
      out.cumulativeAverages.push({ candidateId: id, ...a, deltaRRN: a.dPC1, deltaPRN: a.dPC2, deltaARN: a.dPC3 });
    }
  }
  return out;
}

/** Thresholds of the capsule (Capsule Control) keyed like the metric keys; PC1–PC3 fixed at 0.700. */
export async function getCapsuleThresholds(capsuleId) {
  const c = await getCapsuleById(capsuleId);
  const pick = (k) => (c[k] === undefined || c[k] === null || c[k] === "" ? null : Number(c[k]));
  const keys = ["XEP", "XCFL", "XCPL", "XCTL", "XCOL", "XFLL", "XFLR", "XPLL", "XPLR", "XTLL", "XTLR", "XOLL", "XOLR",
    "XCP", "XBP", "MSIP", "NDIV"];
  const out = Object.fromEntries(keys.map((k) => [k, pick(k)]));
  out.PC1 = 0.7; out.PC2 = 0.7; out.PC3 = 0.7;
  out.dPC1 = pick("ΔPC1"); out.dPC2 = pick("ΔPC2"); out.dPC3 = pick("ΔPC3"); out.GEQ = pick("ΔGEQ");
  return out;
}

/**
 * Same call shape as getUnitAndMultipleCandidateSummary (unitId = capsule id, optional single ppId),
 * used by the unit screens copied for capsules (Hybrid Metrics etc.).
 */
export async function getCapsuleSummaryForUnitScreens(filters = {}) {
  const f = { ...filters, capsuleId: filters.capsuleId ?? filters.unitId };
  if (f.ppId !== undefined && f.ppId !== null && f.ppId !== "") {
    f.ppIdFrom = f.ppId;
    f.ppIdTo = f.ppId;
  }
  return getCapsuleMultipleCandidateSummary(f);
}

/** Capsule record shaped like a unit (Third Parameter model) for the copied unit screens. */
export async function getCapsuleAsUnit(capsuleId) {
  const c = await getCapsuleById(capsuleId);
  await ensureStaffDirectory();
  return {
    ...c,
    staffAssignments: enrichStaffAssignments(c),
    unitType: "Third Parameter",
    unitName: c.capsuleName,
    unitId: c.capsuleId,
    unitStartDate: c.capsuleStartDate,
    // Third Parameter threshold names used by the unit logic (ΔRRN → ΔPC1 …)
    "ΔRRN": c["ΔPC1"], "ΔPRN": c["ΔPC2"], "ΔARN": c["ΔPC3"],
  };
}

/** Same shape as insertScoreService getInsertScoreByUnitAndCandidate (scores with unit / candidate). */
export async function getCapsuleInsertScoresForUnitScreens(capsuleId, candidateId) {
  const { getInsertScoresByUnitAndCandidate } = await import("@/lib/capsule/auxiliary/auxiliaryAdapters");
  return new Promise((resolve, reject) => {
    const res = { status() { return this; }, json(d) { resolve(d); return this; } };
    getInsertScoresByUnitAndCandidate({ params: { unitId: capsuleId, candidate_id: candidateId } }, res).catch(reject);
  });
}

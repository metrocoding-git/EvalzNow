/**
 * Capsule Effectivity (Capacity_Part14a / Capacity_Part14b) – 15 parameters for all capsule types.
 *
 *   Ri = PC1, Rj = PC2, Rk = PC3, a = b = c = 1 (Environment = Clinical-Neuro)
 *   P01..P05 = (Ri^n + Rj^n + Rk^n)^(-1/n) - 1   with n = 8, 7, 6, 5, 4
 *   P06..P15 = the 10 unit Effectivity parameters (server utils/effectivity.js P01..P10)
 *
 * If a parameter is > 5 or +inf (or not a number) it is set to 5. Pass rule: parameter ≤ threshold.
 * Thresholds are fixed: the parameter values at PC1 = PC2 = PC3 = 0.75 (3 decimals).
 * Drop-down options: same as the unit Effectivity (server utils/effectivity.js).
 */

export const PARAMETER_COUNT = 15;
export const PARAMETER_CAP = 5;
const THRESHOLD_RATIO = 0.75;

export const EFFECTIVITY_OPTIONS = {
  effectivityType: ["Holistic", "Mission-Focused", "Not Applicable", "Proactive Dominant", "Reactive Dominant"],
  effectivityGap: ["Capability", "Capacity", "Competency", "Domestic-Driven", "Foreign-Driven", "Not Applicable", "Willingness"],
  effectivitySegment: [
    "Administrative", "Civil Affairs", "Coalition Support", "Combat", "Command & Control", "Counterproliferation",
    "Counterterrorism", "Defense Support", "Direct Action", "Foreign Internal", "Humanitarian", "Intelligence",
    "Maintain Contact", "Movement and Maneuver", "Non-Military", "Not Applicable", "Other", "Peacekeeping",
    "Protection", "Psych Operations", "Reconnaissance", "Rescue & Extraction", "Route Clearance",
    "Search & Destroy", "Search & Rescue", "Security Assistance", "Special Operations", "Strike/Fires/Assault",
    "Sustainment / Logistics", "TDY", "Training", "Unconventional Act", "Will Reduction",
  ],
  effectivityContext: ["Adaptive", "Domestic", "Global", "Not Applicable", "Regional", "Transition"],
  effectivityPurpose: [
    "Area Defense", "Civil - Non Force", "Counterattack Forces", "Decentralized Defense", "Deception Force",
    "Defense to Deny", "Defense to Destroy", "Defense to Preserve", "Disruption Force", "Execution",
    "Integrated Defense", "Main Defense Force", "Maneuver Defense", "Not Applicable", "Offensive Force",
    "Planning/Strategy", "Protected Force", "Psych Evaluation", "Security Force",
  ],
};
export const EFFECTIVITY_FIELDS = Object.keys(EFFECTIVITY_OPTIONS);
export const EFFECTIVITY_TYPES = EFFECTIVITY_OPTIONS.effectivityType;

const num = (v) => {
  if (v === null || v === undefined || v === "" || v === "-") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const cap = (value) => (!Number.isFinite(value) || value > PARAMETER_CAP ? PARAMETER_CAP : value);

/** Raw (uncapped) parameter values for one set of principals. */
export function rawParameters(Ri, Rj, Rk) {
  const powerMean = (n) => (Ri ** n + Rj ** n + Rk ** n) ** (-1 / n) - 1;
  const ij2 = Ri ** 2 + Rj ** 2;
  return [
    powerMean(8), powerMean(7), powerMean(6), powerMean(5), powerMean(4),
    (Ri ** 3 + Rj ** 3 + Rk ** 3) ** (-1 / 3) - 1,
    (Ri ** 2 + Rj ** 2 + Rk ** 2) ** (-1 / 2) - 1,
    (-Rk + Math.sqrt(Rk ** 2 + 4 * ij2)) / (2 * ij2) - 1,
    Math.cbrt((1 - Ri) / (Rj ** 3 + Rk ** 3)) - 1,
    (-(Rj + Rk) + Math.sqrt((Rj + Rk) ** 2 + 4 * Ri ** 2)) / (2 * Ri ** 2) - 1,
    Math.sqrt((1 - Ri) / (Rj ** 2 + Rk ** 2)) - 1,
    1 / (Ri + Rj + Rk) - 1,
    (-Rk + Math.sqrt(Rk ** 2 + 4 * Rj ** 2 * (1 - Ri))) / (2 * Rj ** 2) - 1,
    (1 - Ri) / (Rj + Rk) - 1,
    (1 - Rj - Rk) / Ri - 1,
  ];
}

/** The 15 parameters (capped, 3 decimals); null when a principal is missing. */
export function computeParameters(PC1, PC2, PC3) {
  const Ri = num(PC1);
  const Rj = num(PC2);
  const Rk = num(PC3);
  if (Ri === null || Rj === null || Rk === null) return null;
  return rawParameters(Ri, Rj, Rk).map((v) => Number(cap(v).toFixed(3)));
}

/** Fixed pass thresholds (3 decimals). */
export function getThresholds() {
  const r = THRESHOLD_RATIO;
  return rawParameters(r, r, r).map((v) => Number(v.toFixed(3)));
}

export function passFlags(params, thresholds) {
  if (!params) return Array(PARAMETER_COUNT).fill(null);
  return params.map((v, i) => (v === null || v === undefined ? null : v <= thresholds[i]));
}

/** Count + fraction (3 decimals) of each Effectivity Type. */
export function typeBreakdown(responses = []) {
  const counts = Object.fromEntries(EFFECTIVITY_TYPES.map((t) => [t, 0]));
  let total = 0;
  responses.forEach((r) => {
    const t = r && r.effectivityType;
    if (t && counts[t] !== undefined) { counts[t] += 1; total += 1; }
  });
  const percentages = Object.fromEntries(EFFECTIVITY_TYPES.map((t) => [t, total ? Number((counts[t] / total).toFixed(3)) : 0]));
  return { counts, percentages, total };
}

/** Keeps only known option values; unknown values become null. */
export function sanitizeFields(body = {}) {
  const out = {};
  EFFECTIVITY_FIELDS.forEach((f) => {
    if (body[f] === undefined) return;
    const v = body[f] === null ? null : String(body[f]).trim();
    out[f] = v && EFFECTIVITY_OPTIONS[f].includes(v) ? v : null;
  });
  return out;
}

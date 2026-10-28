/**
 * Capacity Accounting metrics (Capacity_Part7 – Candidate Tabulation Tables).
 *
 * Capsules use the Third Parameter model of the unit side with <PC1, PC2, PC3> instead of <RR, PR, AR>
 * (Capacity_Part10). The formulas below are copied from the server tabulation controller
 * (evalznow-server src/controllers/tabulationTable.controller.js, "Third Parameter" branches) so a capsule
 * gives the same numbers as a TPRM unit with the same principal ratios. When the capsule backend is built,
 * this file can move to the server unchanged.
 *
 * NOTE (Capacity_Part7): "This logic for IC will change a bit" and "This logic for 3D growth targets will
 * change a bit, so discuss with Rick first" – the current unit logic is used until Rick sends the update.
 */
import { getGrowthTarget3D } from "./growthTargets3D";

export const CAPSULE_COMBINED = "Capacity - Combined";
export const CAPSULE_ISOLATED = "Capacity - Isolated";

/** Capacity ratio keys per capsule type (X + capacity code). */
export const RATIO_KEYS = {
  [CAPSULE_COMBINED]: ["XCFL", "XCPL", "XCTL", "XCOL"],
  [CAPSULE_ISOLATED]: ["XFLL", "XFLR", "XPLL", "XPLR", "XTLL", "XTLR", "XOLL", "XOLR"],
};
export const ALL_RATIO_KEYS = [...RATIO_KEYS[CAPSULE_COMBINED], ...RATIO_KEYS[CAPSULE_ISOLATED]];

export const RATIO_NAMES = {
  XCFL: "Combined Frontal Ratio",
  XCPL: "Combined Parietal Ratio",
  XCTL: "Combined Temporal Ratio",
  XCOL: "Combined Occipital Ratio",
  XFLL: "Frontal Lobe (L) Ratio",
  XFLR: "Frontal Lobe (R) Ratio",
  XPLL: "Parietal Lobe (L) Ratio",
  XPLR: "Parietal Lobe (R) Ratio",
  XTLL: "Temporal Lobe (L) Ratio",
  XTLR: "Temporal Lobe (R) Ratio",
  XOLL: "Occipital Lobe (L) Ratio",
  XOLR: "Occipital Lobe (R) Ratio",
};

/**
 * Weights of each capacity ratio in PC1 / PC2 / PC3 (Capacity_Part7). These are also the fixed
 * "Compression %" values of the Proficiency compression cross plots (Capacity_Part8).
 */
export const PC_WEIGHTS = {
  [CAPSULE_COMBINED]: {
    PC1: { XCFL: 3 / 4, XCPL: 1 / 4 },
    PC2: { XCPL: 2 / 4, XCTL: 2 / 4 },
    PC3: { XCTL: 1 / 4, XCOL: 3 / 4 },
  },
  [CAPSULE_ISOLATED]: {
    PC1: { XFLL: 21 / 56, XFLR: 15 / 56, XPLL: 10 / 56, XPLR: 6 / 56, XTLL: 3 / 56, XTLR: 1 / 56 },
    PC2: { XFLR: 6 / 56, XPLL: 10 / 56, XPLR: 12 / 56, XTLL: 12 / 56, XTLR: 10 / 56, XOLL: 6 / 56 },
    PC3: { XPLL: 1 / 56, XPLR: 3 / 56, XTLL: 6 / 56, XTLR: 10 / 56, XOLL: 15 / 56, XOLR: 21 / 56 },
  },
};

/** PC1, PC2 and PC3 thresholds are always fixed at 0.700 (Capacity_Part9). */
export const PC_THRESHOLD = 0.7;

const r3 = (v) => (v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(v) ? null : +Number(v).toFixed(3));
const num = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

// ---------------------------------------------------------------------------
// Third Parameter formulas (server copies)
// ---------------------------------------------------------------------------
export function calculateXEP_TP(rrn, prn, arn) {
  if (rrn == null || prn == null || arn == null) return null;
  const term1 = Math.sqrt(rrn ** 2 + prn ** 2 - rrn * prn);
  const term2 = Math.sqrt(rrn ** 2 + arn ** 2 - rrn * arn);
  const term3 = Math.sqrt(prn ** 2 + arn ** 2 - prn * arn);
  const val = (term1 + term2 + term3) / 3;
  return isNaN(val) ? null : +val.toFixed(3);
}

export function CalcButlerIntProf3P(a, b, c) {
  let value = Math.pow(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2), -0.5) - 1;
  if (value > 5 || value === Number.POSITIVE_INFINITY) value = 5;
  return +value.toFixed(3);
}

export function calculateSTAP(pc1, pc2, pc3, msip) {
  return (pc1 ?? 0) >= 0.5 && (pc2 ?? 0) >= 0.5 && (pc3 ?? 0) >= 0.5 && (msip ?? 0) <= 0.42 ? "STABLE" : "UNSTABLE";
}

function GetInteractionClassAreaThird(eqn) {
  if (eqn < 0.6) return "0R0P";
  if (eqn < 0.7) return "1R1P";
  if (eqn < 0.8) return "2R2P";
  if (eqn < 0.9) return "3R3P";
  if (eqn < 1.0) return "4R4P";
  return "5R5P";
}

export function calculateIC(pc1, pc2, pc3) {
  return GetInteractionClassAreaThird(Math.sqrt((pc1 ?? 0) ** 2 + (pc2 ?? 0) ** 2 + (pc3 ?? 0) ** 2));
}

export function calculateGEQ_TP(d1, d2, d3) {
  if (d1 == null || d2 == null || d3 == null) return null;
  const safeSqrt = (x) => Math.sqrt(Math.max(0, x));
  const val = (safeSqrt(d1 ** 2 + d2 ** 2 - d1 * d2) + safeSqrt(d1 ** 2 + d3 ** 2 - d1 * d3) + safeSqrt(d2 ** 2 + d3 ** 2 - d2 * d3)) / 3;
  if (isNaN(val)) return null;
  const sign = d1 >= 0 && d2 >= 0 && d3 >= 0 ? 1 : -1;
  return +(sign * val).toFixed(3);
}

export function calculateSTAG(d1, d2, d3, msip, geq) {
  return d1 >= 0 && d2 >= 0 && d3 >= 0 && msip <= 0.42 && geq >= 0 ? "STABLE" : "UNSTABLE";
}

// ---------------------------------------------------------------------------
// Principal ratios
// ---------------------------------------------------------------------------
export function principalRatios(capsuleType, ratios) {
  const weights = PC_WEIGHTS[capsuleType];
  if (!weights) return { PC1: null, PC2: null, PC3: null };
  const out = {};
  ["PC1", "PC2", "PC3"].forEach((pc) => {
    const entries = Object.entries(weights[pc]);
    if (entries.every(([k]) => ratios[k] == null)) { out[pc] = null; return; }
    out[pc] = r3(entries.reduce((t, [k, w]) => t + w * (ratios[k] ?? 0), 0));
  });
  return out;
}

// ---------------------------------------------------------------------------
// Summary rows (Average / Std Dev / Std Error) – positive PP IDs only, as on the unit side
// ---------------------------------------------------------------------------
export const NUMERIC_FIELDS = [
  "Productivity_CSD", "Productivity_NSD", "PC1", "PC2", "PC3", ...ALL_RATIO_KEYS,
  "XEP", "XCP", "XBP", "MSIP", "dPC1", "dPC2", "dPC3", "GEQ",
];

function average(rows, field) {
  const vals = rows.map((r) => num(r[field])).filter((v) => v !== null);
  return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3) : null;
}

function stdDev(vals) {
  if (vals.length < 2) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const v = Math.sqrt(vals.reduce((a, x) => a + (x - mean) ** 2, 0) / (vals.length - 1));
  return Number.isFinite(v) ? +v.toFixed(3) : null;
}

export function summaryRows(results) {
  const pos = results.filter((r) => r.ppId > 0);
  if (!pos.length) return { average: null, stdDev: null, stdErr: null, cumulativeSum: null, cumulativeAverage: null };
  const avg = { ppId: "Average" };
  const sd = { ppId: "StdDev" };
  const se = { ppId: "StdErr" };
  NUMERIC_FIELDS.forEach((f) => {
    avg[f] = average(pos, f);
    const vals = pos.map((r) => num(r[f])).filter((v) => v !== null);
    sd[f] = f === "GEQ" ? null : stdDev(vals);
    se[f] = sd[f] == null ? null : +(sd[f] / Math.sqrt(pos.length)).toFixed(3);
  });
  // As the unit API: MSIP / IC / STA-P from the average principals, GEQ / STA-G from the average deltas
  avg.MSIP = CalcButlerIntProf3P(avg.PC1 ?? 0, avg.PC2 ?? 0, avg.PC3 ?? 0);
  avg.IC = calculateIC(avg.PC1, avg.PC2, avg.PC3);
  avg.STAP = calculateSTAP(avg.PC1, avg.PC2, avg.PC3, avg.MSIP);
  avg.GEQ = calculateGEQ_TP(avg.dPC1, avg.dPC2, avg.dPC3);
  avg.STAG = calculateSTAG(avg.dPC1, avg.dPC2, avg.dPC3, avg.MSIP, avg.GEQ);

  // Cumulative / average growth of each principal (Growth Metrics secondary area)
  const deltas = pos.filter((r) => r.dPC1 != null && r.dPC2 != null && r.dPC3 != null);
  const sum = (k) => +deltas.reduce((t, r) => t + (r[k] ?? 0), 0).toFixed(3);
  const cumulativeSum = { dPC1: sum("dPC1"), dPC2: sum("dPC2"), dPC3: sum("dPC3") };
  const cumulativeAverage = {
    dPC1: deltas.length ? +(cumulativeSum.dPC1 / deltas.length).toFixed(3) : null,
    dPC2: deltas.length ? +(cumulativeSum.dPC2 / deltas.length).toFixed(3) : null,
    dPC3: deltas.length ? +(cumulativeSum.dPC3 / deltas.length).toFixed(3) : null,
  };
  return { average: avg, stdDev: sd, stdErr: se, cumulativeSum, cumulativeAverage };
}

const DAY = 1000 * 60 * 60 * 24;
const toDate = (s) => (s ? new Date(`${String(s).slice(0, 10)}T00:00:00`) : null);

/**
 * Tabulation rows of one candidate in one capsule.
 * @param capsule   capsule record (capsuleType, capsuleStartDate)
 * @param candidate candidate (startDate used for Productivity_CSD)
 * @param scores    insert-score rows of this candidate in this capsule
 * @param capacities [{name, code}] of the capsule type
 * @param filters   { ppIdFrom, ppIdTo, criticalDateFrom, criticalDateTo }
 */
export function computeCandidateTabulation(capsule, candidate, scores, capacities, filters = {}) {
  const type = capsule?.capsuleType;
  const ratioKeys = RATIO_KEYS[type] || [];
  const from = num(filters.ppIdFrom);
  const to = num(filters.ppIdTo);
  const dFrom = filters.criticalDateFrom ? String(filters.criticalDateFrom).slice(0, 10) : null;
  const dTo = filters.criticalDateTo ? String(filters.criticalDateTo).slice(0, 10) : null;

  const rows = scores.filter((s) => {
    const pp = Number(s.ppId);
    if (from !== null && pp < from) return false;
    if (to !== null && pp > to) return false;
    const d = String(s.criticalRefDate || "").slice(0, 10);
    if (dFrom && d < dFrom) return false;
    if (dTo && d > dTo) return false;
    return true;
  });

  const byPp = new Map();
  rows.forEach((s) => {
    const pp = Number(s.ppId);
    if (!byPp.has(pp)) byPp.set(pp, []);
    byPp.get(pp).push(s);
  });

  const results = [...byPp.entries()].map(([ppId, list]) => {
    const out = {
      ppId,
      candidate_id: candidate?.id,
      candidateId: candidate?.candidateId,
      capsuleType: type,
      totalDuration: list.reduce((t, s) => t + (Number(s.durationDays) || 0), 0),
      criticalRefDate: list.map((s) => String(s.criticalRefDate || "").slice(0, 10)).sort().pop() || null,
    };
    let sumA = 0;
    let sumM = 0;
    capacities.forEach(({ name, code }) => {
      const mine = list.filter((s) => s.capacity === name);
      const a = mine.reduce((t, s) => t + (Number(s.attainedScore) || 0), 0);
      const m = mine.reduce((t, s) => t + (Number(s.maxScore) || 0), 0);
      out[`A${code}`] = mine.length ? a : null;
      out[`M${code}`] = mine.length ? m : null;
      out[`X${code}`] = m ? r3(a / m) : null;
      sumA += a;
      sumM += m;
    });
    Object.assign(out, principalRatios(type, out));
    out.XEP = calculateXEP_TP(out.PC1 ?? 0, out.PC2 ?? 0, out.PC3 ?? 0);
    out.XCP = r3(sumA / (sumM || 1));
    out.XBP = ratioKeys.length ? r3(ratioKeys.reduce((t, k) => t + (out[k] ?? 0), 0) / ratioKeys.length) : null;
    out.MSIP = CalcButlerIntProf3P(out.PC1 ?? 0, out.PC2 ?? 0, out.PC3 ?? 0);
    out.STAP = calculateSTAP(out.PC1, out.PC2, out.PC3, out.MSIP);
    out.IC = calculateIC(out.PC1, out.PC2, out.PC3);
    for (let n = 1; n <= 5; n++) {
      const [g1, g2, g3] = ppId > 0 ? getGrowthTarget3D(n, out.PC1, out.PC2, out.PC3) : [null, null, null];
      out[`PC1GT${n}`] = g1;
      out[`PC2GT${n}`] = g2;
      out[`PC3GT${n}`] = g3;
    }
    return out;
  });

  // Cumulative duration (Day Count) per side, then productivity for positive PP IDs
  const positives = results.filter((r) => r.ppId > 0).sort((a, b) => a.ppId - b.ppId);
  const negatives = results.filter((r) => r.ppId < 0).sort((a, b) => b.ppId - a.ppId);
  [positives, negatives].forEach((side) => {
    let cum = 0;
    side.forEach((r) => { cum += r.totalDuration || 0; r.cumulativeDuration = +cum.toFixed(3); });
  });
  const nsd = toDate(capsule?.capsuleStartDate);
  const csd = toDate(candidate?.startDate);
  results.forEach((r) => {
    const crd = toDate(r.criticalRefDate);
    if (r.ppId > 0 && crd && r.cumulativeDuration > 0) {
      const dN = nsd ? (crd - nsd) / DAY : null;
      const dC = csd ? (crd - csd) / DAY : null;
      r.Productivity_NSD = dN ? r3(r.cumulativeDuration / dN / 10) : null;
      r.Productivity_CSD = dC ? r3(r.cumulativeDuration / dC / 10) : null;
    } else {
      r.Productivity_NSD = null;
      r.Productivity_CSD = null;
    }
  });

  // Growth differentials (first positive PP ID = 0), GEQ and STA/G
  let prev = null;
  positives.forEach((r) => {
    if (!prev || r.ppId === 1) {
      r.dPC1 = 0; r.dPC2 = 0; r.dPC3 = 0;
    } else {
      r.dPC1 = r3((r.PC1 ?? 0) - (prev.PC1 ?? 0));
      r.dPC2 = r3((r.PC2 ?? 0) - (prev.PC2 ?? 0));
      r.dPC3 = r3((r.PC3 ?? 0) - (prev.PC3 ?? 0));
    }
    r.GEQ = calculateGEQ_TP(r.dPC1, r.dPC2, r.dPC3);
    r.STAG = calculateSTAG(r.dPC1, r.dPC2, r.dPC3, r.MSIP, r.GEQ);
    prev = r;
  });
  negatives.forEach((r) => { r.dPC1 = null; r.dPC2 = null; r.dPC3 = null; r.GEQ = null; r.STAG = null; });

  const ordered = [...negatives, ...positives];
  return { results: ordered, ...summaryRows(ordered) };
}

/**
 * Same rows with the Third Parameter (TPRM) key names the unit screens use
 * (RRN/PRN/ARN = PC1/PC2/PC3, deltaRRN… = ΔPC…, RRGT1… = PC1GT1…, Productivity_USD = Productivity_NSD).
 */
export function withTprmAliases(row) {
  if (!row) return row;
  const out = { ...row };
  out.RRN = row.PC1; out.PRN = row.PC2; out.ARN = row.PC3;
  out.XRVSR = row.PC1; out.XPVSR = row.PC2; out.XAVSR = row.PC3;
  out.deltaRRN = row.dPC1; out.deltaPRN = row.dPC2; out.deltaARN = row.dPC3;
  out.Productivity_USD = row.Productivity_NSD;
  out.unitType = "Third Parameter";
  for (let n = 1; n <= 5; n++) {
    out[`RRGT${n}`] = row[`PC1GT${n}`];
    out[`PRGT${n}`] = row[`PC2GT${n}`];
    out[`ARGT${n}`] = row[`PC3GT${n}`];
  }
  return out;
}

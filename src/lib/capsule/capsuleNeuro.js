/**
 * Capsule Neuroscience Tools (Capacity_Part13) – no RMS and no Neuro Object Form for capsules.
 *
 * Loads: the PP ID and the capsule metric are passed through the Cognitive Load script of the unit
 * Neuroscience Tools (cognitiveNS, cumulative over the positive PP IDs up to the current one).
 *   Proficiency – Isolated: XFLL XPLL XTLL XOLL XFLR XPLR XTLR XOLR PC1 PC2 PC3
 *                 Combined: XCFL XCPL XCTL XCOL PC1 PC2 PC3
 *   Growth      – ∆PC1 ∆PC2 ∆PC3
 *
 * Neurodiversity: absolute differences (3 decimals) of the capacity ratio pairs and XEP - PC1/2/3.
 *   Status = 'Typical' when Difference < NDIV, else 'Divergent' (NDIV from the Capsule control).
 */
import { CAPSULE_COMBINED, CAPSULE_ISOLATED } from "./capsuleMetrics";

/** Same as the unit Neuroscience Tools cognitiveNS (trapezoid area over the PP IDs / 100). */
export function cognitiveNS(xArray, yArray) {
  let areasub = 0;
  for (let i = 0; i < xArray.length; i++) {
    if (i <= xArray.length - 2 && yArray[i] != 0 && yArray[i + 1] != 0) {
      areasub += (yArray[i] + yArray[i + 1]) / 2;
    }
  }
  return Number((areasub / 100).toFixed(3));
}

const LOBES = [["F", "Frontal"], ["P", "Parietal"], ["T", "Temporal"], ["O", "Occipital"]];

/** Load columns of the Proficiency tab: { key, chart (chart label), column (table header) }. */
export function proficiencyLoadColumns(capsuleType) {
  const pcs = ["PC1", "PC2", "PC3"].map((k) => ({ key: k, chart: k, column: `Load/P ${k}` }));
  if (capsuleType === CAPSULE_COMBINED) {
    return [
      ...LOBES.map(([c, n]) => ({ key: `XC${c}L`, chart: `Comb ${n} Lobe`, column: `Load/P ${n}/Comb` })),
      ...pcs,
    ];
  }
  return [
    ...LOBES.map(([c, n]) => ({ key: `X${c}LL`, chart: `(L) - ${n} Lobe`, column: `Load/P ${n}/L` })),
    ...LOBES.map(([c, n]) => ({ key: `X${c}LR`, chart: `(R) - ${n} Lobe`, column: `Load/P ${n}/R` })),
    ...pcs,
  ];
}

export const GROWTH_LOAD_COLUMNS = [1, 2, 3].map((i) => ({ key: `dPC${i}`, chart: `∆PC${i}`, column: `Load/G ∆PC${i}` }));

/** Ratio pairs of the Neurodiversity tab (order of the Excel), then XEP - PC1/2/3. */
export function diversityPairs(capsuleType) {
  const ratios = capsuleType === CAPSULE_COMBINED
    ? ["XCFL", "XCPL", "XCTL", "XCOL"]
    : ["XFLL", "XFLR", "XPLL", "XPLR", "XTLL", "XTLR", "XOLL", "XOLR"];
  const pairs = [];
  for (let i = 0; i < ratios.length; i++) {
    for (let j = i + 1; j < ratios.length; j++) pairs.push([ratios[i], ratios[j]]);
  }
  ["PC1", "PC2", "PC3"].forEach((pc) => pairs.push(["XEP", pc]));
  return pairs.map(([a, b], i) => ({ a, b, label: `${a} - ${b}`, key: `D_${a}_${b}`, statusKey: `S_${a}_${b}`, no: i + 1 }));
}

const num = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

/** Positive PP ID rows of one candidate, sorted by PP ID. */
export function positiveRows(results) {
  return (results || []).filter((r) => Number(r.ppId) > 0).sort((a, b) => a.ppId - b.ppId);
}

/** Cumulative cognitive loads for each column key, one output row per positive PP ID. */
export function computeLoads(rows, columns) {
  return rows.map((row, idx) => {
    const upto = rows.slice(0, idx + 1);
    const out = { ppId: row.ppId };
    columns.forEach(({ key }) => {
      out[key] = upto.length < 2 ? 0 : cognitiveNS(upto.map((r) => r.ppId), upto.map((r) => num(r[key]) ?? 0));
    });
    return out;
  });
}

/** Differences (absolute, 3 decimals) and Typical / Divergent status for each pair and PP ID. */
export function computeDiversity(rows, pairs, ndiv) {
  const limit = num(ndiv);
  return rows.map((row) => {
    const out = { ppId: row.ppId };
    pairs.forEach((p) => {
      const a = num(row[p.a]);
      const b = num(row[p.b]);
      if (a === null || b === null) { out[p.key] = null; out[p.statusKey] = null; return; }
      const d = Number(Math.abs(a - b).toFixed(3));
      out[p.key] = d;
      out[p.statusKey] = limit === null ? null : d < limit ? "Typical" : "Divergent";
    });
    return out;
  });
}

<<<<<<< HEAD
/**
 * Entities of the Plots list (ids in Excel order).
 * Video "UI_Issues_15": chart titles without "vs. PP ID" (the x-axis says PP ID); the y-axis title is the
 * part after "for " (e.g. "Proficiency - Cognitive Load - Comb Frontal Lobe"); differences are absolute
 * values, written "| XCFL - XCPL |", with the y-axis "Differences | XCFL - XCPL |".
 */
export function neuroEntities(capsuleType) {
  const type = capsuleType === CAPSULE_COMBINED ? CAPSULE_COMBINED : CAPSULE_ISOLATED;
  const list = [{ name: "Neuro Tools Table", type: "table", icon: "🟦" }];
  const load = (target, c) => {
    const part = `${target} - Cognitive Load ${c.chart.startsWith("(") ? c.chart : `- ${c.chart}`}`;
    return { name: `Neuro-Load Trends for ${part}`, yLabel: part, type: "load", target, key: c.key, column: c.column };
  };
  proficiencyLoadColumns(type).forEach((c) => list.push(load("Proficiency", c)));
  GROWTH_LOAD_COLUMNS.forEach((c) => list.push(load("Growth", c)));
  const pairs = diversityPairs(type);
  pairs.forEach((p) => list.push({
    name: `Neuro-Diversity: Differences | ${p.label} |`, yLabel: `Differences | ${p.label} |`, type: "diff", pair: p,
  }));
  pairs.forEach((p) => list.push({
    name: `Neuro-Diversity: Divergence Status #${String(p.no).padStart(2, "0")} | ${p.label} |`, type: "status", pair: p,
=======
/** Entities of the Plots list (ids in Excel order). */
export function neuroEntities(capsuleType) {
  const type = capsuleType === CAPSULE_COMBINED ? CAPSULE_COMBINED : CAPSULE_ISOLATED;
  const list = [{ name: "Neuro Tools Table", type: "table", icon: "🟦" }];
  proficiencyLoadColumns(type).forEach((c) => list.push({
    name: `Neuro-Load Trends for Proficiency - Cognitive Load ${c.chart.startsWith("(") ? c.chart : `- ${c.chart}`} vs. PP ID`,
    type: "load", target: "Proficiency", key: c.key, column: c.column,
  }));
  GROWTH_LOAD_COLUMNS.forEach((c) => list.push({
    name: `Neuro-Load Trends for Growth - Cognitive Load - ${c.chart} vs. PP ID`,
    type: "load", target: "Growth", key: c.key, column: c.column,
  }));
  const pairs = diversityPairs(type);
  pairs.forEach((p) => list.push({ name: `Neuro-Diversity: Differences | ${p.label}`, type: "diff", pair: p }));
  pairs.forEach((p) => list.push({
    name: `Neuro-Diversity: Divergence Status #${String(p.no).padStart(2, "0")} | ${p.label}`, type: "status", pair: p,
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
  }));
  return list.map((e, i) => ({ ...e, displayId: i + 1 }));
}

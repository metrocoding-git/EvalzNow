/**
 * Data Extractions for capsules (Capacity_Part16) – candidate-level CSV, one row per candidate PP ID.
 * Columns that do not apply to the capsule type (Combined vs Isolated) are "-".
 */
import { getAllCapsules, getCapsuleById, loadCapsuleStore } from "@/services/capsuleService";
import { getCapsuleCandidates, getCapsuleMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
import { getCandidateEffectivity } from "@/services/capsuleEffectivityService";
import { GROWTH_LOAD_COLUMNS, computeLoads, positiveRows, proficiencyLoadColumns } from "./capsuleNeuro";
import { CAPSULE_COMBINED, CAPSULE_ISOLATED, RATIO_KEYS } from "./capsuleMetrics";

export const CAPSULE_EXTRACTION_HEADERS = [
  "Last Name", "First Name", "Candidate ID", "Candidate Start Date", "Nationality", "Gender", "Ethnicity", "Income",
  "Religion", "Marital Status", "Job Type", "Date of Birth", "Special ID No.", "Capsule Name", "Capsule ID",
  "Capsule Start Date", "Capsule End Date", "Signature Profile", "Capsule Type", "Environment", "PP ID",
  "Short Description", "Period Type", "Delivery", "Critical Reference Date", "Day Count (Days)", "Productivity_CSD",
  "Productivity_NSD", "PC1", "PC2", "PC3", "XCFL", "XCPL", "XCTL", "XCOL", "XFLL", "XFLR", "XPLL", "XPLR", "XTLL",
  "XTLR", "XOLL", "XOLR", "XEP", "XCP", "XBP", "MSIP", "STA/P", "IC", "ΔPC1", "ΔPC2", "ΔPC3", "GEQ", "STA/G",
  ...[1, 2, 3, 4, 5].flatMap((n) => [`PC1GT${n}`, `PC2GT${n}`, `PC3GT${n}`]),
  "Linked BIDs",
  "Load/P Frontal/Comb", "Load/P Parietal/Comb", "Load/P Temporal/Comb", "Load/P Occipital/Comb",
  "Load/P Frontal/L", "Load/P Parietal/L", "Load/P Temporal/L", "Load/P Occipital/L",
  "Load/P Frontal/R", "Load/P Parietal/R", "Load/P Temporal/R", "Load/P Occipital/R",
  "Load/P PC1", "Load/P PC2", "Load/P PC3", "Load/G ∆PC1", "Load/G ∆PC2", "Load/G ∆PC3",
  "Observations & Goals", "Action Status",
  "Effectivity Type", "Effectivity Gap", "Effectivity Segment", "Effectivity Context", "Effectivity Purpose",
  ...Array.from({ length: 15 }, (_, i) => `Parameter ${String(i + 1).padStart(2, "0")}`),
];

const dash = (v) => (v === null || v === undefined || v === "" ? "-" : v);
const date = (v) => (v ? String(v).slice(0, 10) : "-");
const f3 = (v) => {
  if (v === null || v === undefined || v === "" || v === "-") return "-";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(3) : "-";
};
const ppOrder = (a, b) => {
  if (a < 0 && b < 0) return b - a;
  if (a < 0) return -1;
  if (b < 0) return 1;
  return a - b;
};
const idsOf = (v) => {
  let x = v;
  for (let i = 0; i < 2 && typeof x === "string"; i++) {
    try { x = JSON.parse(x || "[]"); } catch { return []; }
  }
  return Array.isArray(x) ? x : [];
};

/** Rows of every (or the given) candidate of one capsule. */
export async function capsuleExtractionRows(capsuleId, onlyCandidateId = null) {
  const capsule = await getCapsuleById(capsuleId);
  const store = await loadCapsuleStore(capsule.clientId);
  const candidates = (await getCapsuleCandidates(capsule.id))
    .filter((c) => onlyCandidateId === null || String(c.id) === String(onlyCandidateId));
  if (!candidates.length) return [];
  const summary = await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: candidates.map((c) => c.id).join(",") });
  const type = capsule.capsuleType;
  const ratioKeys = new Set(RATIO_KEYS[type] || []);
  const profCols = proficiencyLoadColumns(type);
  const loadKeysByHeader = {
    "Load/P Frontal/Comb": "XCFL", "Load/P Parietal/Comb": "XCPL", "Load/P Temporal/Comb": "XCTL", "Load/P Occipital/Comb": "XCOL",
    "Load/P Frontal/L": "XFLL", "Load/P Parietal/L": "XPLL", "Load/P Temporal/L": "XTLL", "Load/P Occipital/L": "XOLL",
    "Load/P Frontal/R": "XFLR", "Load/P Parietal/R": "XPLR", "Load/P Temporal/R": "XTLR", "Load/P Occipital/R": "XOLR",
    "Load/P PC1": "PC1", "Load/P PC2": "PC2", "Load/P PC3": "PC3",
  };

  const rows = [];
  for (const cand of candidates) {
    const results = (summary.results || []).filter((r) => String(r.candidateId) === String(cand.id));
    const byPp = new Map(results.map((r) => [Number(r.ppId), r]));
    const pos = positiveRows(results);
    const profLoads = new Map(computeLoads(pos, profCols).map((r) => [r.ppId, r]));
    const growthLoads = new Map(computeLoads(pos, GROWTH_LOAD_COLUMNS).map((r) => [r.ppId, r]));
    const eff = await getCandidateEffectivity(capsule.id, cand.id).catch(() => null);
    const effByPp = new Map((eff?.rows || []).map((r) => [r.ppId, r]));
    const needs = (store.auxNeedAssessments || []).filter((n) => String(n.unitId) === String(capsule.id) && String(n.candidateId) === String(cand.id));
    const blocks = store.blocks
      .filter((b) => String(b.capsuleId) === String(capsule.id) && String(b.candidate_id) === String(cand.id))
      .sort((a, b) => ppOrder(Number(a.ppId), Number(b.ppId)));

    blocks.forEach((block) => {
      const pp = Number(block.ppId);
      const r = byPp.get(pp) || {};
      const need = needs.find((n) => Number(n.ppId) === pp);
      const bIds = need ? idsOf(need.bIds ?? need.benchmarkIds) : [];
      const status = !need ? "Open" : bIds.length && String(need.observation || "").trim() ? "Closed" : "Pending";
      const pl = profLoads.get(pp);
      const gl = growthLoads.get(pp);
      const e = effByPp.get(pp) || {};
      const ratio = (k) => (ratioKeys.has(k) ? f3(r[k]) : "-");
      const loadP = (header) => {
        const key = loadKeysByHeader[header];
        if (!pl || !profCols.some((c) => c.key === key)) return "-";
        return f3(pl[key]);
      };
      rows.push([
        dash(cand.lastName), dash(cand.firstName), dash(cand.candidateId), date(cand.startDate), dash(cand.nationality),
        dash(cand.gender), dash(cand.ethnicity), dash(cand.income), dash(cand.religion), dash(cand.maritalStatus),
        dash(cand.jobType), date(cand.dateOfBirth), dash(cand.specialIdNo),
        dash(capsule.capsuleName), dash(capsule.capsuleId), date(capsule.capsuleStartDate), date(capsule.capsuleEndDate),
        dash(capsule.signatureProfile), dash(type), dash(capsule.environment),
        pp, dash(block.shortDescription), dash(block.periodType), dash(block.delivery),
        date(r.criticalRefDate), dash(r.cumulativeDuration), f3(r.Productivity_CSD), f3(r.Productivity_NSD),
        f3(r.PC1), f3(r.PC2), f3(r.PC3),
        ...[...RATIO_KEYS[CAPSULE_COMBINED], ...RATIO_KEYS[CAPSULE_ISOLATED]].map(ratio),
        f3(r.XEP), f3(r.XCP), f3(r.XBP), f3(r.MSIP), dash(r.STAP), dash(r.IC),
        f3(r.dPC1), f3(r.dPC2), f3(r.dPC3), f3(r.GEQ), dash(r.STAG),
        ...[1, 2, 3, 4, 5].flatMap((n) => [1, 2, 3].map((p) => f3(r[`PC${p}GT${n}`]))),
        bIds.length ? bIds.join(",") : "-",
        ...Object.keys(loadKeysByHeader).map(loadP),
        ...GROWTH_LOAD_COLUMNS.map((c) => (gl ? f3(gl[c.key]) : "-")),
        dash(need?.observation), status,
        dash(e.effectivityType), dash(e.effectivityGap), dash(e.effectivitySegment), dash(e.effectivityContext), dash(e.effectivityPurpose),
        ...Array.from({ length: 15 }, (_, i) => (e.parameters ? f3(e.parameters[i]) : "-")),
      ]);
    });
  }
  return rows;
}

const csvEscape = (value) => {
  const str = String(value ?? "-");
  const escaped = str.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

/** CSV text with the Part16 title lines. */
export function capsuleCSV(rows) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const meta = [
    "EvalzNow – A Novel Human Capital Assessment Method",
    "Capacity Accounting for Education and Industry",
    "Hybrid Proficiency & Growth Monitoring",
    `Data Extraction Date: ${today}`,
    " ",
    " ",
  ];
  return "﻿" + meta.join("\n") + "\n" + CAPSULE_EXTRACTION_HEADERS.map(csvEscape).join(",") + "\n"
    + rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

export function downloadText(text, filename) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

/** Extract Candidate Data for the Active Capsule. */
export async function extractActiveCapsuleCSV(capsuleId) {
  const rows = await capsuleExtractionRows(capsuleId);
  await downloadText(capsuleCSV(rows), "Capsule Data Extraction.csv");
  return rows.length;
}

/** All data of the active candidate from all capsules that have the candidate – one CSV. */
export async function extractCandidateCapsulesCSV(candidateId) {
  const capsules = await getAllCapsules();
  const rows = [];
  for (const c of capsules) {
    const list = await getCapsuleCandidates(c.id);
    if (list.some((x) => String(x.id) === String(candidateId))) rows.push(...(await capsuleExtractionRows(c.id, candidateId)));
  }
  await downloadText(capsuleCSV(rows), "Capsule Data Extraction - Candidate.csv");
  return rows.length;
}

/** All candidates of all capsules (capsule part of "Extract All Candidate Data from Database"). */
export async function allCapsulesCSV() {
  const capsules = await getAllCapsules();
  const rows = [];
  for (const c of capsules) rows.push(...(await capsuleExtractionRows(c.id)));
  return { text: capsuleCSV(rows), count: rows.length };
}

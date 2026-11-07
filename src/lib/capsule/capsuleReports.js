/**
 * Capsule .ez reports (Capacity_Part17) – Candidate (capsule), Capsule and Clinical levels.
 *
 * Capsule and Clinical reports follow Rick's templates (capsuleReportTemplates.js, Nov 2026).
 * The Candidate (capsule) report is still PROVISIONAL (unit candidate layout) until its template arrives.
 */
import {
  finalize, headerLines, introLines, isoDate, kv, legalBlock, n2, n3, nomenclatureBlock, sectionBanner, subHeader, table, text,
} from "@/app/dashboard/analytics-view/data-reports/helper/reportFormat";
import { EFFECTIVITY_INTRO, EFFECTIVITY_TYPES } from "@/app/dashboard/analytics-view/data-reports/helper/effectivityReport";
import { getAllCapsules, getCapsuleById, getCapsuleRosterByCapsuleId, getCapsuleScoresByCapsuleAndCandidate, loadCapsuleStore } from "@/services/capsuleService";
import { getCapsuleAsUnit, getCapsuleCandidates, getCapsuleMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
import { getCandidateEffectivity, getClientEffectivity, getUnitEffectivity } from "@/services/capsuleEffectivityService";
import { getEffortBu } from "@/services/capsuleAuxiliaryService";
import { CAPSULE_COMBINED_TEMPLATE, CAPSULE_ISOLATED_TEMPLATE, CLINICAL_TEMPLATE } from "./capsuleReportTemplates";
import { fillTemplate } from "./capsuleReportFill";
import { thresholdsOf } from "@/app/dashboard/control-view/capsule/capsuleConfig";
import { CAPSULE_COMBINED, CAPSULE_ISOLATED, RATIO_KEYS, RATIO_NAMES } from "./capsuleMetrics";
import { GROWTH_LOAD_COLUMNS, computeDiversity, computeLoads, diversityPairs, positiveRows, proficiencyLoadColumns } from "./capsuleNeuro";
import { buildIndexTable, collectClinicalData } from "./clinicalAnalytics";

const PARAMS = Array.from({ length: 15 }, (_, i) => i);
const pNum = (i) => String(i + 1).padStart(2, "0");
const W = { indent: 2, width: 37 };
const TH_WIDTH = 43;

const ppSort = (a, b) => {
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
  return Array.isArray(x) ? x.map(Number).filter(Number.isFinite) : [];
};
const linkedBids = (na) => [...new Set([...idsOf(na?.benchmarkIds), ...idsOf(na?.bIds)])].sort((a, b) => a - b);
function actionStatus(na) {
  const hasIds = linkedBids(na).length > 0;
  const hasObs = Boolean(na?.observation && String(na.observation).trim());
  if (hasIds && hasObs) return "Closed";
  if (hasIds || hasObs) return "Pending";
  return "Open";
}
const icValue = (ic) => {
  const m = String(ic || "").match(/(\d)R(\d)P/);
  return m ? Number(m[1]) : null;
};
const staffNames = (staffAssignments = []) => {
  const name = (s) => `${s.staff?.lastName ?? "-"}, ${s.staff?.firstName ?? "-"}`;
  const pad = (arr) => Array.from({ length: 3 }, (_, i) => arr[i] ?? "-");
  return {
    leaders: pad(staffAssignments.filter((s) => s.roleType === "Leader").map(name)),
    assessors: pad(staffAssignments.filter((s) => s.roleType === "Assessor").map(name)),
  };
};

/** "Grade scale" lines of a capsule (pass rules with the capsule thresholds). */
function capsuleThresholdLines(capsule) {
  const t = thresholdsOf(capsule);
  const line = (label, rule) => kv(label, `PASS → ${rule}`, { width: TH_WIDTH });
  return [
    line("Principal Ratios PC1 / PC2 / PC3", "PC ≥ 0.700"),
    ...(RATIO_KEYS[capsule.capsuleType] || []).map((k) => line(RATIO_NAMES[k], `${k} ≥ ${n3(t[k])}`)),
    line("Equivalent Proficiency", `XEP ≥ ${n3(t.XEP)}`),
    line("Composite Proficiency", `XCP ≥ ${n3(t.XCP)}`),
    line("Band Proficiency", `XBP ≥ ${n3(t.XBP)}`),
    line("Butler Interaction Proficiency", `MSIP ≤ ${n3(t.MSIP)}`),
    line("Principal 1 Growth Differential", `ΔPC1 ≥ ${n3(t["ΔPC1"])}`),
    line("Principal 2 Growth Differential", `ΔPC2 ≥ ${n3(t["ΔPC2"])}`),
    line("Principal 3 Growth Differential", `ΔPC3 ≥ ${n3(t["ΔPC3"])}`),
    line("Equivalent Growth Differential", `ΔGEQ ≥ ${n3(t["ΔGEQ"])}`),
    line("Neuro-Divergence", `|Difference| < ${n3(t.NDIV)} → Typical`),
  ];
}

const effectivityThresholdLines = (th) => PARAMS.map((i) => kv(`Effectivity Parameter ${pNum(i)}`, `PASS → Parameter ${pNum(i)} ≤ ${n3(th?.[i])}`));
const effectivityTypeLines = (tb) => EFFECTIVITY_TYPES.map((t) => kv(`Effectivity Type % - ${t}`, tb ? n3(tb.percentages?.[t]) : "-"));
function effectivityRows(eff, dayByPp) {
  const rows = eff?.rows || [];
  const day = (r) => n2(dayByPp.get(r.ppId) ?? r.totalDuration);
  const p = (r, i) => (r.parameters ? n3(r.parameters[i]) : "-");
  const chunk = (from, to) => table(["PP ID", "DAYCOUNT", ...PARAMS.slice(from, to).map((i) => `Parameter ${pNum(i)}`)],
    rows.map((r) => [r.ppId, day(r), ...PARAMS.slice(from, to).map((i) => p(r, i))]));
  return [
    ...table(["PP ID", "DAYCOUNT", "Type", "Gap", "Segment", "Context", "Purpose"],
      rows.map((r) => [r.ppId, day(r), text(r.effectivityType), text(r.effectivityGap), text(r.effectivitySegment), text(r.effectivityContext), text(r.effectivityPurpose)])),
    ...chunk(0, 5), ...chunk(5, 10), ...chunk(10, 15),
  ];
}

const benchmarkRows = (list = []) => [...list].sort((a, b) => Number(a.benchmarkId) - Number(b.benchmarkId))
  .map((b) => [b.benchmarkId, b.benchmarkType, b.benchmarkRef, b.benchmarkDescription]);

/** Candidate report of one candidate in one capsule. */
export async function buildCapsuleCandidateReport(capsuleId, candidateId) {
  const capsule = await getCapsuleAsUnit(capsuleId);
  const type = capsule.capsuleType;
  const store = await loadCapsuleStore(capsule.clientId);
  const candidates = await getCapsuleCandidates(capsule.id);
  const candidate = candidates.find((c) => String(c.id) === String(candidateId)) || {};
  const roster = (await getCapsuleRosterByCapsuleId(capsule.id)).find((r) => String(r.candidateId) === String(candidateId)) || {};
  const summary = await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: String(candidateId) });
  const results = (summary.results || []).slice().sort((a, b) => ppSort(a.ppId, b.ppId));
  const avg = summary.averages?.[0] || {};
  const cum = summary.cumulativeSums?.[0] || {};
  const scores = (await getCapsuleScoresByCapsuleAndCandidate(capsule.id, candidateId)).slice().sort((a, b) => ppSort(Number(a.ppId), Number(b.ppId)));
  const blocks = store.blocks.filter((b) => String(b.capsuleId) === String(capsule.id) && String(b.candidate_id) === String(candidateId))
    .sort((a, b) => ppSort(Number(a.ppId), Number(b.ppId)));
  const needs = (store.auxNeedAssessments || []).filter((n) => String(n.unitId) === String(capsule.id) && String(n.candidateId) === String(candidateId));
  const marks = (store.auxCandidateMarks || []).filter((m) => String(m.unitId) === String(capsule.id) && String(m.candidateId) === String(candidateId));
  const eff = await getCandidateEffectivity(capsule.id, candidateId).catch(() => null);
  const dayByPp = new Map(results.map((r) => [r.ppId, r.cumulativeDuration]));
  const ratios = RATIO_KEYS[type] || [];
  const { leaders, assessors } = staffNames(capsule.staffAssignments);
  const pos = positiveRows(results);
  const profCols = proficiencyLoadColumns(type);
  const profLoads = computeLoads(pos, profCols);
  const growthLoads = computeLoads(pos, GROWTH_LOAD_COLUMNS);
  const pairs = diversityPairs(type);
  const diversity = computeDiversity(pos, pairs, thresholdsOf(capsule).NDIV);
  const att = ["presentCount", "excusedAbsences", "unexcusedAbsences", "excusedTardies", "unexcusedTardies"].map((k) => Number(roster[k]) || 0);
  const attTotal = att.reduce((a, b) => a + b, 0);
  const engage = ["High", "Medium", "Low", "N/A"].map((l) => scores.filter((s) => (s.engageLevel || "N/A") === l).length);
  const naByPp = new Map(needs.map((n) => [Number(n.ppId), n]));

  return finalize([
    headerLines("Candidate"), "", introLines(), "",
    sectionBanner(1), "",
    subHeader("CANDIDATE DETAILS :"),
    kv("Last Name", text(candidate.lastName), W), kv("First Name", text(candidate.firstName), W),
    kv("Candidate ID", text(candidate.candidateId), W), kv("Candidate Start Date", isoDate(candidate.startDate), W),
    kv("Nationality", text(candidate.nationality), W), kv("Date of Birth", isoDate(candidate.dateOfBirth), W),
    kv("Special ID No.", text(candidate.specialIdNo), W), kv("Age Range", text(roster.ageRange), W), "",
    subHeader("CAPSULE DETAILS :"),
    kv("Capsule Name", text(capsule.capsuleName), W), kv("Capsule ID", text(capsule.capsuleId), W),
    kv("Capsule Start Date", text(capsule.capsuleStartDate), W), kv("Capsule End Date", text(capsule.capsuleEndDate), W),
    kv("Signature Profile", text(capsule.signatureProfile), W), kv("Capsule Type", text(type), W),
    kv("Environment", text(capsule.environment), W), kv("Capsule Roster Count", text(candidates.length), W), "",
    ...leaders.map((n, i) => kv(`Assigned Leader #${i + 1}`, n, W)), "",
    ...assessors.map((n, i) => kv(`Assigned Assessor #${i + 1}`, n, W)), "",
    sectionBanner(2), "",
    subHeader("ASSESSMENT BLOCKS:"),
    table(["PP ID", "PERIOD TYPE", "DELIVERY", "SHORT DESCRIPTION"], blocks.map((b) => [b.ppId, b.periodType, b.delivery, b.shortDescription])),
    sectionBanner(3), "",
    subHeader("GRADE SCALE DEFINITION & THRESHOLDS:"),
    capsuleThresholdLines(capsule),
    kv("Capsule Outcome for Candidate", text(roster.capsuleOutcome), { width: TH_WIDTH }), "",
    sectionBanner(4), "",
    subHeader("TABULATIONS - PROFICIENCY:"),
    table(["PP ID", "PC1", "PC2", "PC3", ...ratios, "XEP", "XCP", "XBP", "STA/P"],
      results.map((r) => [r.ppId, n3(r.PC1), n3(r.PC2), n3(r.PC3), ...ratios.map((k) => n3(r[k])), n3(r.XEP), n3(r.XCP), n3(r.XBP), text(r.STAP)])),
    kv("Average Principal Ratio - PC1", n3(avg.PC1)), kv("Average Principal Ratio - PC2", n3(avg.PC2)), kv("Average Principal Ratio - PC3", n3(avg.PC3)), "",
    ...ratios.map((k) => kv(`Average ${RATIO_NAMES[k]} - ${k}`, n3(avg[k]))), "",
    kv("Average Equivalent Proficiency - XEP", n3(avg.XEP)), kv("Average Composite Proficiency - XCP", n3(avg.XCP)), kv("Average Band Proficiency - XBP", n3(avg.XBP)), "",
    subHeader("TABULATIONS - GROWTH:"),
    table(["PP ID", "DAYCOUNT", "ΔPC1", "ΔPC2", "ΔPC3", "∆GEQ", "STA/G"],
      results.map((r) => [r.ppId, n2(r.cumulativeDuration), n3(r.dPC1), n3(r.dPC2), n3(r.dPC3), n3(r.GEQ), text(r.STAG)])),
    ...[1, 2, 3].flatMap((i) => [kv(`Cumulative Growth - ΔPC${i}`, n3(cum[`dPC${i}`])), kv(`Average Growth - ΔPC${i}`, n3(avg[`dPC${i}`])), ""]),
    kv("Average Equivalent Growth - ∆GEQ", n3(avg.GEQ)), "",
    subHeader("TABULATIONS - HYBRID:"),
    table(["PP ID", "DAYCOUNT", "MSIP", "IC"], results.map((r) => [r.ppId, n2(r.cumulativeDuration), n3(r.MSIP), n2(icValue(r.IC))])),
    kv("Butler Interaction Proficiency - MSIP", n3(avg.MSIP)), kv("Average Interaction Class - IC", n2(icValue(avg.IC))), "",
    sectionBanner(5), "",
    subHeader("BUTLER PRODUCTIVITY & UTILIZATION:"),
    table(["PP ID", "CRITICAL REFERENCE DATE", "DAYCOUNT", "PRODUCTIVITY RATES - CSD", "PRODUCTIVITY RATES - NSD"],
      results.map((r) => [r.ppId, isoDate(r.criticalRefDate), n2(r.cumulativeDuration), n3(r.Productivity_CSD), n3(r.Productivity_NSD)])),
    subHeader("ATTENDANCE TRACKING:"),
    ...["Present", "Excused Absences", "Unexcused Absences", "Excused Tardies", "Unexcused Tardies"]
      .map((l, i) => kv(`Attendance % - ${l}`, attTotal ? n3(att[i] / attTotal) : "-")), "",
    subHeader("ENGAGEMENT TRACKING:"),
    ...["High", "Medium", "Low", "Not Applicable"].map((l, i) => kv(`Engagement Level % - ${l}`, scores.length ? n3(engage[i] / scores.length) : "-")), "",
    sectionBanner(6), "",
    subHeader("BENCHMARKS:"),
    table(["BIDs", "BENCHMARK TYPE", "BENCHMARK REF", "BENCHMARK DESCRIPTION"], benchmarkRows(capsule.benchmarks)),
    subHeader("CANDIDATE MARKS:"),
    table(["ENTRY", "IMPACT TYPE", "CONCERN IDENTIFIED", "IDENTITY DATE", "CONCERN RESOLVED", "RESOLUTION DATE"],
      marks.map((m, i) => [i + 1, m.impactType, m.concernIdentified, isoDate(m.identityDate), m.concernResolved, isoDate(m.resolutionDate)])),
    subHeader("NEEDS ASSESSMENT:"),
    table(["PP ID", "CRITICAL REFERENCE DATE", "ACTION STATUS", "BID", "OBSERVATIONS & GOALS"],
      results.map((r) => {
        const na = naByPp.get(Number(r.ppId));
        const b = linkedBids(na);
        return [r.ppId, isoDate(r.criticalRefDate), actionStatus(na).toUpperCase(), b.length ? b.join(", ") : "-", text(na?.observation?.trim())];
      })),
    sectionBanner(7), "",
    subHeader("RECORD OF ASSIGNMENTS:"),
    table(["PP ID", "DAYCOUNT", "TASK DECLARATION", "CAPACITY", "ATTAINED SCORE", "MAX SCORE"],
      scores.map((s) => [s.ppId, n2(s.durationDays), s.taskDeclaration, s.capacity, s.attainedScore, s.maxScore])),
    table(["PP ID", "WORKFLOW STAGE", "ASSESSMENT TYPE", "SCHEDULE IMPACT", "ENGAGEMENT LEVEL"],
      scores.map((s) => [s.ppId, s.workflowStage, s.assessmentType, s.scheduleImpact, s.engageLevel])),
    table(["PP ID", "CAUSE TYPE", "CONDITION TYPE", "SEVERITY LEVEL", "SCAN TYPE", "MONITOR TYPE", "THERAPY TYPE"],
      scores.map((s) => [s.ppId, s.causeType, s.conditionType, s.severityLevel, s.scanType, s.monitorType, s.therapyType])),
    sectionBanner(8), "",
    subHeader("NEUROSCIENCE - LOADS (PROFICIENCY):"),
    table(["PP ID", ...profCols.map((c) => c.column)], profLoads.map((r) => [r.ppId, ...profCols.map((c) => n3(r[c.key]))])),
    subHeader("NEUROSCIENCE - LOADS (GROWTH):"),
    table(["PP ID", ...GROWTH_LOAD_COLUMNS.map((c) => c.column)], growthLoads.map((r) => [r.ppId, ...GROWTH_LOAD_COLUMNS.map((c) => n3(r[c.key]))])),
    subHeader("NEUROSCIENCE - NEURODIVERSITY:"),
    ...pairs.map((p) => {
      const s = diversity.map((r) => r[p.statusKey]).filter(Boolean);
      return kv(`Divergent % - ${p.label}`, s.length ? n3(s.filter((x) => x === "Divergent").length / s.length) : "-");
    }), "",
    sectionBanner(9), "",
    subHeader("EFFECTIVITY:"),
    EFFECTIVITY_INTRO,
    effectivityThresholdLines(eff?.thresholds), "",
    effectivityRows(eff, dayByPp),
    ...PARAMS.map((i) => kv(`Average Effectivity Parameter ${pNum(i)}`, n3(eff?.average?.parameters?.[i]))), "",
    effectivityTypeLines(eff?.typeBreakdown), "",
    sectionBanner(10), "",
    nomenclatureBlock(),
    legalBlock(),
  ]);
}

/** Leader names "Last, First" (3 lines each). */
const ENGAGE = [["High", "High"], ["Medium", "Medium"], ["Low", "Low"], ["Not Applicable", "N/A"]];
const ATTENDANCE = [
  ["Present", "presentCount"], ["Excused Absences", "excusedAbsences"], ["Unexcused Absences", "unexcusedAbsences"],
  ["Excused Tardies", "excusedTardies"], ["Unexcused Tardies", "unexcusedTardies"],
];
// Template labels of the unilateral ratios
const UNILATERAL_LABELS = {
  XCFL: "Comb Frontal", XCPL: "Comb Parietal", XCTL: "Comb Temporal", XCOL: "Comb Occipital",
  XFLL: "Frontal (L)", XFLR: "Frontal (R)", XPLL: "Parietal (L)", XPLR: "Parietal (R)",
  XTLL: "Temporal (L)", XTLR: "Temporal (R)", XOLL: "Occipital (L)", XOLR: "Occipital (R)",
};
const fraction = (part, whole) => (whole ? n3(part / whole) : "-");
const mean = (vals) => {
  const v = vals.map(Number).filter(Number.isFinite);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

/** Threshold values of the template "PASS →" lines. */
function capsuleThresholdValues(capsule) {
  const t = thresholdsOf(capsule);
  const out = { PC1: "0.700", PC2: "0.700", PC3: "0.700" };
  [...(RATIO_KEYS[capsule.capsuleType] || []), "XEP", "XCP", "XBP", "MSIP", "ΔPC1", "ΔPC2", "ΔPC3", "ΔGEQ"].forEach((k) => { out[k] = n3(t[k]); });
  out.IC = t.IC === undefined || t.IC === null || t.IC === "" ? "-" : String(Number(t.IC));
  return out;
}

const effectivityThresholdValues = (th) => Object.fromEntries(PARAMS.map((i) => [`Parameter ${pNum(i)}`, n3(th?.[i])]));

/** Capsule Report (Rick's "Capsule Report - Combined / Isolated (new)" templates). */
export async function buildCapsuleReport(capsuleId) {
  const capsule = await getCapsuleAsUnit(capsuleId);
  const type = capsule.capsuleType;
  const th = thresholdsOf(capsule);
  const store = await loadCapsuleStore(capsule.clientId);
  const candidates = await getCapsuleCandidates(capsule.id);
  const rosters = await getCapsuleRosterByCapsuleId(capsule.id);
  const ids = candidates.map((c) => c.id);
  const summary = ids.length
    ? await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: ids.join(",") })
    : { averages: [], cumulativeSums: [], results: [] };
  const eff = ids.length ? await getUnitEffectivity(capsule.id, ids).catch(() => null) : null;
  const avgs = summary.averages || [];
  const mine = (list) => (list || []).filter((x) => String(x.unitId ?? x.capsuleId) === String(capsule.id));

  // pass share over the candidates' average values
  const passPct = (key, t, lower = false) => {
    const vals = avgs.map((a) => a[key]).filter((v) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v)));
    const thr = Number(t);
    if (!vals.length || !Number.isFinite(thr)) return "-";
    return n3(vals.filter((v) => (lower ? Number(v) <= thr : Number(v) >= thr)).length / vals.length);
  };
  const stablePct = (key) => {
    const s = avgs.map((a) => a[key]).filter(Boolean);
    return s.length ? n3(s.filter((v) => v === "STABLE").length / s.length) : "-";
  };
  const icPass = (() => {
    const v = avgs.map((a) => icValue(a.IC)).filter((x) => x !== null);
    return v.length ? n3(v.filter((x) => x >= Number(th.IC)).length / v.length) : "-";
  })();

  // attendance (roster), engagement (scores), needs assessment status (every PP ID of every candidate)
  const att = ATTENDANCE.map(([, k]) => rosters.reduce((t, r) => t + (Number(r[k]) || 0), 0));
  const attTotal = att.reduce((a, b) => a + b, 0);
  const scores = (store.scores || []).filter((x) => String(x.capsuleId) === String(capsule.id));
  const engage = ENGAGE.map(([, k]) => scores.filter((x) => (x.engageLevel || "N/A") === k).length);
  const needs = mine(store.auxNeedAssessments);
  const ppKeys = new Set((store.blocks || []).filter((b) => String(b.capsuleId) === String(capsule.id)).map((b) => `${b.candidate_id}|${b.ppId}`));
  const status = { Open: 0, Closed: 0, Pending: 0 };
  ppKeys.forEach((k) => {
    const [cand, pp] = k.split("|");
    const na = needs.find((n) => String(n.candidateId) === cand && String(n.ppId) === pp);
    status[actionStatus(na)] += 1;
  });

  // effort per candidate (Auxiliary Resultants)
  const effortRows = [];
  for (const c of candidates) {
    const e = await getEffortBu(capsule.id, c.id).catch(() => null);
    effortRows.push([c.lastName, c.firstName, c.candidateId, n3(e?.data?.CSD), n3(e?.data?.USD)]);
  }
  const { leaders, assessors } = staffNames(capsule.staffAssignments);
  const leaderMarks = mine(store.auxLeaderMarks)
    .sort((a, b) => (a.entryNumber ?? a.id) - (b.entryNumber ?? b.id))
    .map((m, i) => [m.entryNumber ?? i + 1, m.impactType, m.concernIdentified, isoDate(m.identityDate), m.concernResolved, isoDate(m.resolutionDate)]);
  const improvements = mine(store.auxImprovements).map((u, i) => {
    const bids = idsOf(u.bIds);
    const linked = idsOf(u.benchmarkIds);
    return [i + 1, bids.length ? bids.join(", ") : "-", u.lesson, linked.length ? linked.join(", ") : "-"];
  });

  const values = {
    "Capsule Name": text(capsule.capsuleName),
    "Capsule ID": text(capsule.capsuleId),
    "Capsule Start Date": text(capsule.capsuleStartDate),
    "Capsule End Date": text(capsule.capsuleEndDate),
    "Signature Profile": text(capsule.signatureProfile),
    "Capsule Type": text(type),
    Environment: text(capsule.environment),
    "Framework Age (Years)": text(capsule.frameworkAge),
    "Capsule Roster Count": text(candidates.length),
    ...Object.fromEntries(leaders.map((n, i) => [`Assigned Leader #${i + 1}`, n])),
    ...Object.fromEntries(assessors.map((n, i) => [`Assigned Assessor #${i + 1}`, n])),
    ...Object.fromEntries((RATIO_KEYS[type] || []).map((k) => [`Pass % Avg Unilateral - ${UNILATERAL_LABELS[k]}`, passPct(k, th[k])])),
    ...Object.fromEntries([1, 2, 3].map((i) => [`Pass % Avg Principal ${i} Ratio - PC${i}`, passPct(`PC${i}`, 0.7)])),
    "Pass % Avg Equivalent Proficiency - XEP": passPct("XEP", th.XEP),
    "Pass % Avg Composite Proficiency - XCP": passPct("XCP", th.XCP),
    "Pass % Avg Band Proficiency - XBP": passPct("XBP", th.XBP),
    "Pass % Stability in Proficiency": stablePct("STAP"),
    ...Object.fromEntries([1, 2, 3].map((i) => [`Pass % Average Growth - ΔPC${i}`, passPct(`dPC${i}`, th[`ΔPC${i}`])])),
    "Pass % Avg Equivalent Growth - ∆GEQ": passPct("GEQ", th["ΔGEQ"]),
    "Pass % Stability in Growth": stablePct("STAG"),
    "Pass % Avg Butler Int Proficiency - MSIP": passPct("MSIP", th.MSIP, true),
    "Pass % Avg Interaction Class - IC": icPass,
    // same as the unit report: average productivity of the candidates
    "Pass % Avg Productivity Rates - CSD": n3(mean(avgs.map((a) => a.Productivity_CSD))),
    "Pass % Avg Productivity Rates - NSD": n3(mean(avgs.map((a) => a.Productivity_NSD))),
    ...Object.fromEntries(ATTENDANCE.map(([l], i) => [`Attendance % - ${l}`, fraction(att[i], attTotal)])),
    ...Object.fromEntries(ENGAGE.map(([l], i) => [`Engagement Level % - ${l}`, fraction(engage[i], scores.length)])),
    ...Object.fromEntries(["Open", "Closed", "Pending"].map((k) => [`Action Status % - ${k}`, fraction(status[k], ppKeys.size)])),
    ...Object.fromEntries(PARAMS.map((i) => [`Pass % Effectivity Parameter ${pNum(i)}`, n3(eff?.passFractions?.[i])])),
    ...Object.fromEntries(EFFECTIVITY_TYPES.map((t) => [`Effectivity Type % - ${t}`, eff?.typeBreakdown ? n3(eff.typeBreakdown.percentages?.[t]) : "-"])),
  };
  const tables = {
    "||| LAST NAME ||| ||| FIRST NAME ||| ||| CANDIDATE ID ||| ||| CANDIDATE START DATE ||| ||| NATIONALITY ||| ||| CAPSULE OUTCOME ||| ||| AGE RANGE |||":
      candidates.map((c) => [c.lastName, c.firstName, c.candidateId, isoDate(c.startDate ?? c.candidateStartDate), c.nationality, c.capsuleOutcome, c.ageRange]),
    "||| LAST NAME ||| ||| FIRST NAME ||| ||| CANDIDATE ID ||| ||| EFFORT - CSD ||| ||| EFFORT - NSD |||": effortRows,
    "||| BIDs ||| ||| BENCHMARK TYPE ||| ||| BENCHMARK REF ||| ||| BENCHMARK DESCRIPTION |||": benchmarkRows(capsule.benchmarks),
    "||| ENTRY ||| ||| IMPACT TYPE ||| ||| CONCERN IDENTIFIED ||| ||| IDENTITY DATE ||| ||| CONCERN RESOLVED ||| ||| RESOLUTION DATE |||": leaderMarks,
    "||| ENTRY # ||| ||| BIDs ||| ||| LESSONS LEARNED ||| ||| LINKED BENCHMARKS |||": improvements,
  };
  const template = type === CAPSULE_COMBINED ? CAPSULE_COMBINED_TEMPLATE : CAPSULE_ISOLATED_TEMPLATE;
  return fillTemplate(template, {
    values, tables, thresholds: { ...capsuleThresholdValues(capsule), ...effectivityThresholdValues(eff?.thresholds) },
  }).text;
}

/** Clinical Analytics Report (all capsules; Rick's "Clinical Analytics Report (new)" template). */
export async function buildClinicalReport() {
  const data = await collectClinicalData();
  const index = buildIndexTable(data);
  const store = await loadCapsuleStore();
  const client = store.client || {};
  const eff = await getClientEffectivity().catch(() => null);
  const row = (desc) => n3(index.rows.find((r) => r.description === desc)?.value);
  const rate = (k) => {
    const p = data.pass[k];
    return p && p.totalInstances ? n3(p.successCount / p.totalInstances) : "-";
  };
  const share = (obj, k) => {
    const t = Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);
    return t ? n3((Number(obj[k]) || 0) / t) : "-";
  };
  const values = {
    "Executive ID": text(client.executiveId),
    "Company Name": text(client.companyName),
    "Company Contact Number": text(client.companyContactNumber),
    "Institutional Type": text(client.institutionalType),
    Country: text(client.country),
    "Company Size": text(client.companySize?.candidate),
    "Total Capsule Count": text(data.totalCapsules),
    "Total Candidate Count": text(data.candidateIds.size),
    "Global Percentage of Capacity - Combined": row("Global Percentage of Capacity - Combined"),
    "Global Percentage of Capacity - Isolated": row("Global Percentage of Capacity - Isolated"),
    "% Capsules Cand-to-Lead, CTL ≤ 10": row("Global Percentage of Capsules with Candidate-to-Leader Ratio, CTL ≤ 10"),
    "% Capsules Cand-to-Lead, 10 < CTL ≤ 20": row("Global Percentage of Capsules with Candidate-to-Leader Ratio, 10 < CTL ≤ 20"),
    "% Capsules Cand-to-Lead, CTL > 20": row("Global Percentage of Capsules with Candidate-to-Leader Ratio, CTL > 20"),
    "% Benchmark Counts, BC ≤ 10": row("Global Percentage of Benchmark Counts, BC ≤ 10"),
    "% Benchmark Counts, 10 < BC ≤ 25": row("Global Percentage of Benchmark Counts, 10 < BC ≤ 25"),
    "% Benchmark Counts, BC > 25": row("Global Percentage of Benchmark Counts, BC > 25"),
    "% Assessment Blocks, AB ≤ 8": row("Global Percentage of Assessment Blocks, AB ≤ 8"),
    "% Assessment Blocks, 8 < AB ≤ 20": row("Global Percentage of Assessment Blocks, 8 < AB ≤ 20"),
    "% Assessment Blocks, AB > 20": row("Global Percentage of Assessment Blocks, AB > 20"),
    ...Object.fromEntries(ATTENDANCE.map(([l]) => [`% Attendance - ${l}`, row(`Global Percentage of Attendance - ${l}`)])),
    "% Action Status - Closed": row("Global Percentage Closed Items for All Courses"),
    "% Positive Candidate Marks": row("Global Percentage of Positive Candidate Marks"),
    "% Positive Leader Marks": row("Global Percentage of Positive Leader Marks"),
    "% Passing Candidates": share(data.outcomes, "Pass"),
    "% Failed Candidates": share(data.outcomes, "Fail"),
    "% Ongoing Candidates": share(data.outcomes, "Ongoing"),
    "% Candidates under Observation": share(data.outcomes, "Under Observation"),
    "% Candidates under Exploration": share(data.outcomes, "Under Exploration"),
    "% Candidates in Trial": share(data.outcomes, "In Trial"),
    ...Object.fromEntries(Object.keys(data.ageRanges).map((a) => [`% Age Range - ${a}`, share(data.ageRanges, a)])),
    ...Object.fromEntries([1, 2, 3].map((i) => [`% Passed Principal ${i} Ratio - PC${i}`, rate(`PC${i}`)])),
    ...Object.fromEntries([...RATIO_KEYS[CAPSULE_COMBINED], ...RATIO_KEYS[CAPSULE_ISOLATED]].map((k) => [`% Passed Average Unilateral - ${k}`, rate(k)])),
    "% Passed Average Equivalent Prof - XEP": rate("XEP"),
    "% Passed Average Composite Prof - XCP": rate("XCP"),
    "% Passed Average Band Prof - XBP": rate("XBP"),
    "% Passed Stability Proficiency - STA/P": share(data.STAP, "STABLE"),
    "% Passed Average Butler Int - MSIP": rate("MSIP"),
    ...Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [`% Capsules Interaction Class ${i}`, share(data.ic, i)])),
    ...Object.fromEntries([1, 2, 3].map((i) => [`% Passed Average Growth - ΔPC${i}`, rate(`avgDPC${i}`)])),
    ...Object.fromEntries([1, 2, 3].map((i) => [`% Passed Cumulative Growth - ΔPC${i}`, rate(`sumDPC${i}`)])),
    "% Passed Avg Equivalent Growth - ∆GEQ": rate("GEQ"),
    "% Passed Stability Proficiency - STA/G": share(data.STAG, "STABLE"), // template label (Stability in Growth)
    ...Object.fromEntries(PARAMS.map((i) => [`% Passed Effectivity Parameter ${pNum(i)}`, n3(eff?.passFractions?.[i])])),
    ...Object.fromEntries(EFFECTIVITY_TYPES.map((t) => [`% Effectivity Type - ${t}`, eff?.typeBreakdown?.total ? n3(eff.typeBreakdown.percentages?.[t]) : "-"])),
    ...Object.fromEntries(Object.keys(data.frameworkAges).map((a) => [`% FRAMEWORK AGE: ${a}`, share(data.frameworkAges, a)])),
    "Index Rating": text(index.rating),
    "Weighted Index": n3(index.weightedIndex),
  };
  return fillTemplate(CLINICAL_TEMPLATE, { values }).text;
}

/** File name "<Level>_<Name>_<ID>.ez". */
export const reportFileName = (level, name, id) => `${level}_${String(name || "-").replace(/[\\/:*?"<>|]/g, "_")}_${String(id || "-").replace(/[\\/:*?"<>|]/g, "_")}.ez`;

export { getCapsuleById };

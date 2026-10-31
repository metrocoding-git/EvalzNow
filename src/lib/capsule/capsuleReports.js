/**
 * Capsule .ez reports (Capacity_Part17) – Candidate (capsule), Capsule and Clinical levels.
 *
 * PROVISIONAL: Rick will provide the capsule report templates. Until then these follow the layout of the
 * unit .ez reports (same title box, section banners, key/value and table formats, nomenclature, legal notice)
 * with the capsule metrics (PC1/PC2/PC3, capacity ratios, 15 Effectivity parameters, neuro loads / diversity).
 */
import {
  finalize, headerLines, introLines, isoDate, kv, legalBlock, n2, n3, nomenclatureBlock, sectionBanner, subHeader, table, text,
} from "@/app/dashboard/analytics-view/data-reports/helper/reportFormat";
import { EFFECTIVITY_INTRO, EFFECTIVITY_TYPES } from "@/app/dashboard/analytics-view/data-reports/helper/effectivityReport";
import { getAllCapsules, getCapsuleById, getCapsuleRosterByCapsuleId, getCapsuleScoresByCapsuleAndCandidate, loadCapsuleStore } from "@/services/capsuleService";
import { getCapsuleAsUnit, getCapsuleCandidates, getCapsuleMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
import { getCandidateEffectivity, getUnitEffectivity } from "@/services/capsuleEffectivityService";
import { thresholdsOf } from "@/app/dashboard/control-view/capsule/capsuleConfig";
import { CAPSULE_COMBINED, RATIO_KEYS, RATIO_NAMES } from "./capsuleMetrics";
import { GROWTH_LOAD_COLUMNS, computeDiversity, computeLoads, diversityPairs, positiveRows, proficiencyLoadColumns } from "./capsuleNeuro";
import { CLINICAL_CHARTS, buildIndexTable, collectClinicalData } from "./clinicalAnalytics";

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
    kv("Special ID No.", text(candidate.specialIdNo), W), "",
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

/** Capsule-level report (pass percentages over the capsule's candidates). */
export async function buildCapsuleReport(capsuleId) {
  const capsule = await getCapsuleAsUnit(capsuleId);
  const type = capsule.capsuleType;
  const th = thresholdsOf(capsule);
  const candidates = await getCapsuleCandidates(capsule.id);
  const rosters = await getCapsuleRosterByCapsuleId(capsule.id);
  const summary = candidates.length
    ? await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: candidates.map((c) => c.id).join(",") })
    : { averages: [], cumulativeSums: [] };
  const eff = candidates.length ? await getUnitEffectivity(capsule.id, candidates.map((c) => c.id)) : null;
  const avgs = summary.averages || [];
  const passPct = (key, thrKey, lower = false) => {
    const vals = avgs.map((a) => a[key]).filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)));
    const t = Number(thrKey === null ? 0.7 : th[thrKey]);
    return vals.length ? n3(vals.filter((v) => (lower ? Number(v) <= t : Number(v) >= t)).length / vals.length) : "-";
  };
  const outcomes = {};
  rosters.forEach((r) => { outcomes[r.capsuleOutcome || "-"] = (outcomes[r.capsuleOutcome || "-"] || 0) + 1; });
  const { leaders, assessors } = staffNames(capsule.staffAssignments);
  const ratios = RATIO_KEYS[type] || [];
  const stable = (k) => {
    const s = avgs.map((a) => a[k]).filter(Boolean);
    return s.length ? n3(s.filter((v) => v === "STABLE").length / s.length) : "-";
  };

  return finalize([
    headerLines("Capsule"), "", introLines(), "",
    sectionBanner(1), "",
    subHeader("CAPSULE DETAILS :"),
    kv("Capsule Name", text(capsule.capsuleName), W), kv("Capsule ID", text(capsule.capsuleId), W),
    kv("Capsule Start Date", text(capsule.capsuleStartDate), W), kv("Capsule End Date", text(capsule.capsuleEndDate), W),
    kv("Signature Profile", text(capsule.signatureProfile), W), kv("Capsule Type", text(type), W),
    kv("Environment", text(capsule.environment), W), kv("Framework Age", text(capsule.frameworkAge), W),
    kv("Capsule Roster Count", text(candidates.length), W), "",
    ...leaders.map((n, i) => kv(`Assigned Leader #${i + 1}`, n, W)), "",
    ...assessors.map((n, i) => kv(`Assigned Assessor #${i + 1}`, n, W)), "",
    subHeader("CAPSULE ROSTER:"),
    table(["LAST NAME", "FIRST NAME", "CANDIDATE ID", "CAPSULE OUTCOME", "AGE RANGE"],
      candidates.map((c) => [c.lastName, c.firstName, c.candidateId, c.capsuleOutcome, c.ageRange])),
    ...Object.entries(outcomes).map(([k, v]) => kv(`Capsule Outcome % - ${k}`, n3(v / (rosters.length || 1)))), "",
    sectionBanner(2), "",
    subHeader("GRADE SCALE DEFINITION & THRESHOLDS:"),
    capsuleThresholdLines(capsule), "",
    sectionBanner(3), "",
    subHeader("PASS PERCENTAGES:"),
    "     Pass percentages below are based on the average values of each corresponding metric:", "",
    kv("Pass % - PC1", passPct("PC1", null)), kv("Pass % - PC2", passPct("PC2", null)), kv("Pass % - PC3", passPct("PC3", null)),
    ...ratios.map((k) => kv(`Pass % - ${k}`, passPct(k, k))),
    kv("Pass % - XEP", passPct("XEP", "XEP")), kv("Pass % - XCP", passPct("XCP", "XCP")), kv("Pass % - XBP", passPct("XBP", "XBP")),
    kv("Pass % - MSIP", passPct("MSIP", "MSIP", true)), kv("Pass % - ∆GEQ", passPct("GEQ", "ΔGEQ")),
    ...[1, 2, 3].map((i) => kv(`Pass % - Average ΔPC${i}`, passPct(`dPC${i}`, `ΔPC${i}`))), "",
    kv("Stable % - STA/P", stable("STAP")), kv("Stable % - STA/G", stable("STAG")), "",
    subHeader("CANDIDATE AVERAGES:"),
    table(["CANDIDATE ID", "PC1", "PC2", "PC3", "XEP", "XCP", "XBP", "MSIP", "IC", "∆GEQ"],
      candidates.map((c) => {
        const a = avgs.find((x) => String(x.candidateId) === String(c.id)) || {};
        return [c.candidateId, n3(a.PC1), n3(a.PC2), n3(a.PC3), n3(a.XEP), n3(a.XCP), n3(a.XBP), n3(a.MSIP), n2(icValue(a.IC)), n3(a.GEQ)];
      })),
    sectionBanner(4), "",
    subHeader("BENCHMARKS:"),
    table(["BIDs", "BENCHMARK TYPE", "BENCHMARK REF", "BENCHMARK DESCRIPTION"], benchmarkRows(capsule.benchmarks)),
    sectionBanner(5), "",
    subHeader("EFFECTIVITY:"),
    EFFECTIVITY_INTRO,
    effectivityThresholdLines(eff?.thresholds), "",
    ...PARAMS.map((i) => kv(`Pass % Effectivity Parameter ${pNum(i)}`, n3(eff?.passFractions?.[i]))), "",
    effectivityTypeLines(eff?.typeBreakdown), "",
    sectionBanner(6), "",
    nomenclatureBlock(),
    legalBlock(),
  ]);
}

/** Clinical Data Report (all capsules) – index table, rating and chart percentages. */
export async function buildClinicalReport() {
  const data = await collectClinicalData();
  const index = buildIndexTable(data);
  const capsules = await getAllCapsules();
  const charts = CLINICAL_CHARTS.filter((c) => c.type === "pie");
  return finalize([
    headerLines("Clinical"), "", introLines(), "",
    sectionBanner(1), "",
    subHeader("CLINICAL DETAILS :"),
    kv("Capsule Count", text(capsules.length), W),
    kv("Capacity - Combined", text(data.capsuleTypes[CAPSULE_COMBINED]), W),
    kv("Capacity - Isolated", text(capsules.length - data.capsuleTypes[CAPSULE_COMBINED]), W), "",
    sectionBanner(2), "",
    subHeader("SHARED CLINICAL ANALYTICS INDEX TABLE:"),
    table(["METRIC DESCRIPTIONS", "METRIC VALUES"], index.rows.map((r) => [r.description, n3(r.value)])),
    kv("Index Rating", index.rating), kv("Weight Index (WI)", index.weightedIndex.toFixed(3)), "",
    sectionBanner(3), "",
    subHeader("CLINICAL CHART PERCENTAGES:"),
    ...charts.flatMap((c) => {
      const slices = c.data(data);
      return [`     ${c.name}`, ...(slices.length ? slices.map((s) => kv(s.name, `${n3(s.value)}   (Count: ${s.count})`, { indent: 8, width: 39 })) : [kv("No data", "-", { indent: 8, width: 39 })]), ""];
    }),
    sectionBanner(4), "",
    nomenclatureBlock(),
    legalBlock(),
  ]);
}

/** File name "<Level>_<Name>_<ID>.ez". */
export const reportFileName = (level, name, id) => `${level}_${String(name || "-").replace(/[\\/:*?"<>|]/g, "_")}_${String(id || "-").replace(/[\\/:*?"<>|]/g, "_")}.ez`;

export { getCapsuleById };

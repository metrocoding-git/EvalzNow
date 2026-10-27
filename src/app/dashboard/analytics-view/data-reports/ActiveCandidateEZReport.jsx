// Candidate report (.ez) – follows "Candidate Report - CICO / T&P / TPRM (new).ez".
import {
  n2, n3, text, isoDate, headerLines, introLines, sectionBanner, subHeader, kv, table,
  nomenclatureBlock, legalBlock, finalize,
} from "./helper/reportFormat";
import { effectivityRows, effectivityThresholdLines, effectivityTypeLines, EFFECTIVITY_INTRO } from "./helper/effectivityReport";

const TH_WIDTH = 43; // label width of the "GRADE SCALE DEFINITION & THRESHOLDS" block

const CICO = "Communicative I/O";
const TP = "Theory & Practice";
const TPRM = "Third Parameter";

function staffNames(staffAssignments = []) {
  const name = (s) => `${s.staff?.lastName ?? "-"}, ${s.staff?.firstName ?? "-"}`;
  const pad = (arr) => Array.from({ length: 3 }, (_, i) => arr[i] ?? "-");
  return {
    leaders: pad(staffAssignments.filter((s) => s.roleType === "Leader").map(name)),
    assessors: pad(staffAssignments.filter((s) => s.roleType === "Assessor").map(name)),
  };
}

export const getICValue = (unitType, signatureProfile, icString) => {
  if (!icString) return 0;
  const balanced = { "0R0P": 0, "1R1P": 1, "2R2P": 2, "3R3P": 3, "4R4P": 4, "5R5P": 5 };
  if (unitType === CICO || unitType === TP) {
    if (signatureProfile === "Case 1: Solid Balanced" || signatureProfile === "Case 2: Rigorous Balanced") {
      return balanced[icString] ?? 0;
    }
    if (signatureProfile === "Case 3a: Productive-Weighted") {
      const map = { "0R0P": 0, "0R1P": 0.5, "0R2P": 1, "1R2P": 1.5, "2R2P": 2, "2R3P": 2.5, "3R3P": 3, "3R4P": 3.5, "4R4P": 4, "5R5P": 5 };
      return map[icString] ?? 0;
    }
    if (signatureProfile === "Case 3b: Receptive-Weighted") {
      const map = { "0R0P": 0, "1R0P": 0.5, "2R0P": 1, "2R1P": 1.5, "2R2P": 2, "3R2P": 2.5, "3R3P": 3, "4R3P": 3.5, "4R4P": 4, "5R5P": 5 };
      return map[icString] ?? 0;
    }
  }
  if (unitType === TPRM) return balanced[icString] ?? 0;
  return 0;
};

/** Threshold value as entered on the unit (3 decimals; whole numbers such as IC stay whole). */
const thr = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return text(v);
  return Number.isInteger(n) && Math.abs(n) >= 1 ? String(n) : n.toFixed(3);
};

/** Open / Pending / Closed – same rule as the Needs Assessment table in Auxiliary Resultants. */
function actionStatus(na) {
  const ids = [...(na?.benchmarkIds || []), ...(na?.bIds || [])];
  const hasIds = ids.length > 0;
  const hasObs = Boolean(na?.observation && String(na.observation).trim());
  if (hasIds && hasObs) return "Closed";
  if (hasIds || hasObs) return "Pending";
  return "Open";
}

const ppSort = (a, b) => {
  if (a < 0 && b < 0) return b - a;
  if (a < 0) return -1;
  if (b < 0) return 1;
  return a - b;
};

export function thresholdLines(unitMeta) {
  const t = unitMeta || {};
  const line = (label, rule) => kv(label, `PASS → ${rule}`, { width: TH_WIDTH });
  const unilateral = {
    [CICO]: [
      line("Unilateral Proficiency in Reading", `XRR ≥ ${thr(t.XRR)}`),
      line("Unilateral Proficiency in Listening", `XLR ≥ ${thr(t.XLR)}`),
      line("Unilateral Proficiency in Speaking", `XSR ≥ ${thr(t.XSR)}`),
      line("Unilateral Proficiency in Writing", `XWR ≥ ${thr(t.XWR)}`),
    ],
    [TP]: [
      line("Unilateral Proficiency - Theoretical Knowl", `XTR ≥ ${thr(t.XTR)}`),
      line("Unilateral Proficiency - Practical Knowl", `XPR ≥ ${thr(t.XPR)}`),
    ],
    [TPRM]: [
      line("Unilateral Proficiency - Receptive", `XRVSR ≥ ${thr(t.XRVSR)}`),
      line("Unilateral Proficiency - Productive", `XPVSR ≥ ${thr(t.XPVSR)}`),
      line("Unilateral Proficiency - Acuity", `XAVSR ≥ ${thr(t.XAVSR)}`),
    ],
  }[t.unitType] || [line("Unilateral Proficiency", "-")];

  return [
    "     Based on the grade scale definitions of the unit, the pass/fail criteria for the proficiency thresholds, the hybrid thresholds, and the growth",
    "     thresholds of all courses are as follow:",
    "",
    ...unilateral,
    line("Equivalent Proficiency", `XEP ≥ ${thr(t.XEP)}`),
    line("Composite Proficiency", `XCP ≥ ${thr(t.XCP)}`),
    line("Band Proficiency", `XBP ≥ ${thr(t.XBP)}`),
    "",
    line("Receptive Growth Differential", `∆RRN ≥ ${thr(t["ΔRRN"])}`),
    line("Productive Growth Differential", `∆PRN ≥ ${thr(t["ΔPRN"])}`),
    ...(t.unitType === TPRM ? [line("Acuity Growth Differential", `∆ARN ≥ ${thr(t["ΔARN"])}`)] : []),
    line("Equivalent Growth", `∆GEQ ≥ ${thr(t["ΔGEQ"])}`),
    "",
    line("Butler Interaction Proficiency", `MSIP ≤ ${thr(t.MSIP)}`),
    line("Interaction Class", `IC ≥ ${thr(t.IC)}`),
    "",
    "     Interaction Class 0: Failing",
    "     Interaction Class 1: At-Risk",
    "     Interaction Class 2: Acceptable",
    "     Interaction Class 3: Standard",
    "     Interaction Class 4: Advanced",
    "     Interaction Class 5: Exceptional",
    "",
  ];
}

export const PROFICIENCY_TEXT = [
  "     Proficiency, which passes the accountability to the student/worker, is a metric that is used to determine if a candidate can meet or can exceed a predefined benchmark or a baseline",
  "     threshold.  This determination is normally based on the candidate’s ability to demonstrate mastery of core concepts at a fixed point in time. (Static Metric)",
  "",
  "          •	The Unilateral Proficiency is used to determine if a candidate can demonstrate mastery of individual skills.",
  "          •	The Equivalent Proficiency is used to determine if a candidate can demonstrate mastery when skills are resolved into an equivocated scalar.",
  "          •	The Composite Proficiency is used to determine if a candidate can demonstrate mastery across all skills.",
  "          •	The Band Proficiency is used to determine if a candidate can demonstrate mastery by averaging scores across all skills.",
  "",
];

export const GROWTH_TEXT = [
  "     Growth, which passes the accountability to the instructor/manager, refers to the differential changes in skills from one performance point to another performance point.",
  "     These differential changes, which can be correlated with normative measures at a candidate level, a unit level, or an institutional level, indicate the direction of candidate",
  "     progress. (Dynamic Metric)",
  "",
  "     Candidate growth is based on the candidate’s incremental progress from one point in time to another point with respect to time.",
  "",
  "          •	If the differential change in input variables and/or output variables is negative, then the direction of candidate progress decreases due to retarded growth.",
  "          •	If the differential change in input variables and/or output variables is zero, then the direction of candidate progress remains unchanged with no growth.",
  "          •	If the differential change in input variables and/or output variables is positive, then the direction of candidate progress increases due to value-added growth.",
  "",
];

export const HYBRID_TEXT = [
  "          •	The Butler Interaction Proficiency is used to determine if a candidate can demonstrate mastery based on an acceptable interaction among all inclusive variables.",
  "          •	The Interaction Class is an interaction constant based on skills mastery within a pre-defined interaction envelope among all inclusive variables.",
  "",
];

const UNILATERAL_KEYS = { [CICO]: ["XRR", "XLR", "XSR", "XWR"], [TP]: ["XTR", "XPR"], [TPRM]: ["ARN", "XRVSR", "XPVSR", "XAVSR"] };

const LOBES = ["Frontal", "Occipital", "Parietal", "Temporal"];

/**
 * Section 08 – per PP ID tables, in template order:
 *   P/ RMS (L), P/ RMS (R), P/ Load (L), P/ Load (R), G/ RMS (L), G/ RMS (R), G/ Load (L), G/ Load (R).
 * The load of a PP ID is the cumulative cognitive load up to that PP ID (cognitiveLoad.<lobe>.proficiency / growth).
 */
function neuroBlocks(neuro, dayCountByPp) {
  const data = Array.isArray(neuro?.data) ? [...neuro.data].sort((a, b) => ppSort(a.ppId, b.ppId)) : [];
  const lobeLabel = (l) => (l === "Occipital" ? "Occipital Lobe" : l);
  const loadOf = (lobeKey, kind, pp) => {
    const list = neuro?.cognitiveLoad?.[lobeKey]?.[kind];
    const hit = Array.isArray(list) ? list.find((x) => String(x.ppId) === String(pp)) : null;
    return hit ? n3(hit.value) : "-";
  };
  const out = [];
  [["proficiency", "P", "RMS"], ["growth", "G", "deltaRMS"]].forEach(([kind, p, rmsKey]) => {
    const block = (metric, valueOf) => [["Left", "L"], ["Right", "R"]].forEach(([side, s]) => {
      const headers = ["PP ID", "DAYCOUNT", ...LOBES.map((l) => `${p}/ ${metric} (${s}) - ${lobeLabel(l)}`)];
      const rows = data.map((entry) => [
        entry.ppId,
        n2(dayCountByPp.get(entry.ppId) ?? entry.dayCount),
        ...LOBES.map((l) => valueOf(`${l} Lobe - ${side}`, entry)),
      ]);
      out.push(...table(headers, rows));
    });
    block("RMS", (lobeKey, entry) => n3(entry?.lobes?.[lobeKey]?.[rmsKey]));
    block("Load", (lobeKey, entry) => loadOf(lobeKey, kind, entry.ppId));
  });
  return out;
}

/**
 * Needs Assessment Chain – chains shown side by side in columns (original layout):
 *     ||| ASSESSMENT CHAIN 1 |||               ||| ASSESSMENT CHAIN 2 |||
 *  Performance Point ID 1                    Performance Point ID 4
 *  IC #1: <0.500,0.250>                      IC #1: <0.750,0.500>
 */
const CHAIN_COL_WIDTH = 40;
const CHAIN_GAP = "     ";

const hasSelectionData = (sel) =>
  !!sel && (sel.RRN != null || sel.PRN != null || sel.ARN != null ||
    (Array.isArray(sel.benchmarkIds) && sel.benchmarkIds.length > 0) || !!sel.actionStatus);

function singleChainLines(chain, unitType) {
  const selections = (chain?.selections || []).filter(hasSelectionData);
  if (!selections.length) return null;
  const tprm = unitType === TPRM;
  const lines = [];
  selections.forEach((sel, i) => {
    const ic = tprm || sel.ARN != null
      ? `<${n3(sel.RRN)},${n3(sel.PRN)},${n3(sel.ARN)}>`
      : `<${n3(sel.RRN)},${n3(sel.PRN)}>`;
    const bids = Array.isArray(sel.benchmarkIds) && sel.benchmarkIds.length ? sel.benchmarkIds.join(", ") : "-";
    if (i > 0) lines.push("");
    lines.push(
      ` Performance Point ID ${text(sel.ppId)}`,
      ` IC #${text(sel.IC)}: ${ic}`,
      ` Benchmark IDs: ${bids}`,
      ` Action Status: ${text(sel.actionStatus)}`,
      ` Critical Reference Date: ${isoDate(sel.criticalRefDate)}`,
    );
  });
  return lines;
}

function chainBlocks(assessmentChain, unitType) {
  const chains = (Array.isArray(assessmentChain) ? assessmentChain : [])
    .map((chain, idx) => ({ header: `||| ASSESSMENT CHAIN ${idx + 1} |||`, body: singleChainLines(chain, unitType) }))
    .filter((c) => c.body);
  if (!chains.length) return ["     -", ""];
  const headers = "    " + chains.map((c) => c.header.padEnd(CHAIN_COL_WIDTH)).join(CHAIN_GAP);
  const maxLines = Math.max(...chains.map((c) => c.body.length));
  const rows = Array.from({ length: maxLines }, (_, i) =>
    chains.map((c) => (c.body[i] ?? "").padEnd(CHAIN_COL_WIDTH)).join(CHAIN_GAP).trimEnd());
  return [headers.trimEnd(), "", ...rows, ""];
}

/** Benchmarks of the unit (the PP IDs that link them are shown in the Needs Assessment table). */
function benchmarkRows(benchmarks = []) {
  return [...benchmarks]
    .sort((a, b) => Number(a.benchmarkId) - Number(b.benchmarkId))
    .map((b) => [b.benchmarkId, b.benchmarkType, b.benchmarkRef, b.benchmarkDescription]);
}

/** Benchmark IDs linked to one needs assessment entry, sorted and de-duplicated. */
const linkedBids = (na) =>
  [...new Set([...(na?.benchmarkIds || []), ...(na?.bIds || [])].map(Number).filter(Number.isFinite))].sort((a, b) => a - b);

export function buildCandidateEZReport({
  unitMeta = {},
  candidate = {},
  roster,
  scores = [],
  competency,
  neuro,
  engagement,
  candidateMarks,
  needAssessments,
  assessmentChain,
  effortResults,
}) {
  const unitType = unitMeta.unitType;
  const tprm = unitType === TPRM;
  const { leaders, assessors } = staffNames(unitMeta.staffAssignments || []);
  const rosterRow = roster || {};
  const pct = rosterRow.percentages || {};
  const eng = engagement?.percentages || {};

  const results = (Array.isArray(competency?.results) ? competency.results : []).slice().sort((a, b) => ppSort(a.ppId, b.ppId));
  const averages = (Array.isArray(competency?.averages) ? competency.averages[0] : competency?.averages) || {};
  const cumulative = (Array.isArray(competency?.cumulative) ? competency.cumulative[0] : competency?.cumulative) || {};
  const dayCountByPp = new Map(results.map((r) => [r.ppId, r.totalDuration]));
  const needs = Array.isArray(needAssessments) ? needAssessments : [];
  const effectivity = candidate.effectivity || null;

  // --- Section 04 tables
  const uniKeys = UNILATERAL_KEYS[unitType] || [];
  const proficiencyRows = results.map((r) => [r.ppId, n3(r.RRN), n3(r.PRN), ...uniKeys.map((k) => n3(r[k])), n3(r.XEP), n3(r.XCP), n3(r.XBP), text(r.STAP)]);
  const growthRows = results.map((r) => [r.ppId, n2(r.totalDuration), n3(r.deltaRRN), n3(r.deltaPRN), ...(tprm ? [n3(r.deltaARN)] : []), n3(r.GEQ), text(r.STAG)]);
  const hybridRows = results.map((r) => [r.ppId, n2(r.totalDuration), n3(r.MSIP), n2(getICValue(r.unitType || unitType, r.signatureProfile || unitMeta.signatureProfile, r.IC))]);

  // --- Section 06 needs assessment: every PP ID of the candidate's assessment blocks with its
  // action status (OPEN / PENDING / CLOSED) and linked Benchmark IDs. Entries of PP IDs that no
  // longer exist are left out.
  const naByPp = new Map(needs.map((na) => [na.ppId, na]));
  const needsRows = results
    .map((r) => ({ r, na: naByPp.get(r.ppId) }))
    .map(({ r, na }) => {
      const bids = linkedBids(na);
      return [r.ppId, isoDate(r.criticalRefDate), actionStatus(na).toUpperCase(), bids.length ? bids.join(", ") : "-", text(na?.observation?.trim())];
    });

  const marksRows = (Array.isArray(candidateMarks) ? candidateMarks : [])
    .slice().sort((a, b) => a.entryNumber - b.entryNumber)
    .map((m, i) => [i + 1, m.impactType, m.concernIdentified, isoDate(m.identityDate), m.concernResolved, isoDate(m.resolutionDate)]);

  const irregularities = candidate.irregularities ?? scores?.[0]?.candidate?.irregularities ?? [];

  const lines = [
    headerLines("Candidate"),
    "",
    introLines(),
    "",
    sectionBanner(1),
    "",
    subHeader("CANDIDATE DETAILS :"),
    kv("Last Name", text(candidate.lastName), { indent: 2, width: 37 }),
    kv("First Name", text(candidate.firstName), { indent: 2, width: 37 }),
    kv("Candidate ID", text(candidate.candidateId), { indent: 2, width: 37 }),
    kv("Candidate Start Date", text(candidate.candidateStartDate), { indent: 2, width: 37 }),
    kv("Nationality", text(candidate.nationality), { indent: 2, width: 37 }),
    kv("Date of Birth", text(candidate.dateOfBirth), { indent: 2, width: 37 }),
    kv("Special ID No.", text(candidate.specialIdNo), { indent: 2, width: 37 }),
    "",
    subHeader("UNIT DETAILS :"),
    kv("Unit Name", text(unitMeta.unitName), { indent: 2, width: 37 }),
    kv("Unit ID", text(unitMeta.unitId), { indent: 2, width: 37 }),
    kv("Unit Start Date", text(unitMeta.unitStartDate), { indent: 2, width: 37 }),
    kv("Unit End Date", text(unitMeta.unitEndDate), { indent: 2, width: 37 }),
    kv("Signature Profile", text(unitMeta.signatureProfile), { indent: 2, width: 37 }),
    kv("Unit Type", text(unitType), { indent: 2, width: 37 }),
    kv("Unit Roster Count", text(unitMeta.rosterStats?.totalCount), { indent: 2, width: 37 }),
    "",
    ...leaders.map((n, i) => kv(`Assigned Leader #${i + 1}`, n, { indent: 2, width: 37 })),
    "",
    ...assessors.map((n, i) => kv(`Assigned Assessor #${i + 1}`, n, { indent: 2, width: 37 })),
    "",
    sectionBanner(2),
    "",
    subHeader("CANDIDATE IRREGULARITIES:"),
    table(["NOTE #", "IRREGULARITY TYPE", "COMMENTS"], irregularities.map((it, i) => [i + 1, it.type, it.comments])),
    subHeader("ASSESSMENT BLOCKS:"),
    table(["PP ID", "PERIOD TYPE", "DELIVERY", "SHORT DESCRIPTION"],
      (candidate.pps || []).slice().sort((a, b) => ppSort(a.ppId, b.ppId)).map((p) => [p.ppId, p.periodType, p.delivery, p.shortDescription])),
    sectionBanner(3),
    "",
    subHeader("GRADE SCALE DEFINITION & THRESHOLDS:"),
    thresholdLines(unitMeta),
    kv("Unit Outcome for Candidate", text(rosterRow.unitOutcome), { width: TH_WIDTH }),
    "",
    sectionBanner(4),
    "",
    subHeader("TABULATIONS - PROFICIENCY:"),
    PROFICIENCY_TEXT,
    table(["PP ID", "RRN", "PRN", ...uniKeys, "XEP", "XCP", "XBP", "STA/P"], proficiencyRows),
    kv("Average Receptive Ratio - RRN", n3(averages.RRN)),
    kv("Average Productive Ratio - PRN", n3(averages.PRN)),
    ...(tprm ? [kv("Average Acuity Ratio - ARN", n3(averages.ARN))] : []),
    "",
    kv("Average Equivalent Proficiency - XEP", n3(averages.XEP)),
    kv("Average Composite Proficiency - XCP", n3(averages.XCP)),
    kv("Average Band Proficiency - XBP", n3(averages.XBP)),
    "",
    subHeader("TABULATIONS - GROWTH:"),
    GROWTH_TEXT,
    table(["PP ID", "DAYCOUNT", "ΔRRN", "ΔPRN", ...(tprm ? ["ΔARN"] : []), "∆GEQ", "STA/G"], growthRows),
    kv("Cumulative Growth - ΔRRN", n3(cumulative.deltaRRN)),
    kv("Average Growth - ΔRRN", n3(averages.deltaRRN)),
    "",
    kv("Cumulative Growth - ΔPRN", n3(cumulative.deltaPRN)),
    kv("Average Growth - ΔPRN", n3(averages.deltaPRN)),
    "",
    ...(tprm ? [kv("Cumulative Growth - ΔARN", n3(cumulative.deltaARN)), kv("Average Growth - ΔARN", n3(averages.deltaARN)), ""] : []),
    kv("Average Equivalent Growth - ∆GEQ", n3(averages.GEQ)),
    "",
    subHeader("TABULATIONS - HYBRID:"),
    HYBRID_TEXT,
    table(["PP ID", "DAYCOUNT", "MSIP", "IC"], hybridRows),
    kv("Butler Interaction Proficiency - MSIP", n3(averages.MSIP)),
    kv("Average Interaction Class - IC", n2(getICValue(unitType, unitMeta.signatureProfile, averages.IC))),
    "",
    sectionBanner(5),
    "",
    subHeader("BUTLER PRODUCTIVITY & UTILIZATION:"),
    table(["PP ID", "CRITICAL REFERENCE DATE", "DAYCOUNT", "PRODUCTIVITY RATES - CSD", "PRODUCTIVITY RATES - USD"],
      results.map((r) => [r.ppId, isoDate(r.criticalRefDate), n2(r.totalDuration), n3(r.Productivity_CSD), n3(r.Productivity_USD)])),
    kv("Effort -  CSD Reference", n3(effortResults?.data?.CSD ?? effortResults?.CSD)),
    kv("Effort -  USD Reference", n3(effortResults?.data?.USD ?? effortResults?.USD)),
    "",
    subHeader("ATTENDANCE TRACKING:"),
    kv("Attendance % - Present", n3(pct.present)),
    kv("Attendance % - Excused Absences", n3(pct.excusedAbsences)),
    kv("Attendance % - Unexcused Absences", n3(pct.unexcusedAbsences)),
    kv("Attendance % - Excused Tardies", n3(pct.excusedTardies)),
    kv("Attendance % - Unexcused Tardies", n3(pct.unexcusedTardies)),
    "",
    subHeader("ENGAGEMENT TRACKING:"),
    kv("Engagement Level % - High", n3(eng.High)),
    kv("Engagement Level % - Medium", n3(eng.Medium)),
    kv("Engagement Level % - Low", n3(eng.Low)),
    kv("Engagement Level % - Not Applicable", n3(eng["N/A"])),
    "",
    sectionBanner(6),
    "",
    subHeader("BENCHMARKS:"),
    table(["BIDs", "BENCHMARK TYPE", "BENCHMARK REF", "BENCHMARK DESCRIPTION"], benchmarkRows(unitMeta.benchmarks || [])),
    subHeader("CANDIDATE MARKS:"),
    table(["ENTRY", "IMPACT TYPE", "CONCERN IDENTIFIED", "IDENTITY DATE", "CONCERN RESOLVED", "RESOLUTION DATE"], marksRows),
    subHeader("NEEDS ASSESSMENT:"),
    table(["PP ID", "CRITICAL REFERENCE DATE", "ACTION STATUS", "BID", "OBSERVATIONS & GOALS"], needsRows),
    subHeader("NEEDS ASSESSMENT CHAIN:"),
    chainBlocks(assessmentChain, unitType),
    sectionBanner(7),
    "",
    subHeader("RECORD OF ASSIGNMENTS:"),
    table(["PP ID", "DAYCOUNT", "TASK DECLARATION", "ATTAINED SCORE", "MAX SCORE"],
      scores.map((s) => [s.ppId, n2(s.durationHrs), s.remarks, s.attainedScore, s.maxScore])),
    table(["PP ID", "DAYCOUNT", "WORKFLOW STAGE", "ASSESSMENT TYPE", "SCHEDULE IMPACT"],
      scores.map((s) => [s.ppId, n2(s.durationHrs), s.workflowStage, s.assessmentType, s.scheduleImpact])),
    sectionBanner(8),
    "",
    subHeader("NEUROSCIENCE INDICATORS:"),
    neuroBlocks(neuro, dayCountByPp),
    sectionBanner(9),
    "",
    subHeader("EFFECTIVITY:"),
    EFFECTIVITY_INTRO,
    effectivityThresholdLines(effectivity?.thresholds),
    "",
    effectivityRows(effectivity, dayCountByPp),
    effectivityTypeLines(effectivity?.typeBreakdown),
    "",
    sectionBanner(10),
    "",
    nomenclatureBlock(),
    legalBlock(),
  ];

  return finalize(lines);
}

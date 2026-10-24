// Unit report (.ez) – follows "Unit Report - CICO / T&P / TPRM (new).ez".
import {
  n3, text, isoDate, headerLines, introLines, sectionBanner, subHeader, kv, table,
  nomenclatureBlock, legalBlock, finalize,
} from "./helper/reportFormat";
import { getICValue, thresholdLines, PROFICIENCY_TEXT, GROWTH_TEXT, HYBRID_TEXT } from "./ActiveCandidateEZReport";
import { EFFECTIVITY_INTRO, effectivityThresholdLines, effectivityPassLines, effectivityTypeLines } from "./helper/effectivityReport";

const TPRM = "Third Parameter";
const PASS_NOTE = ["     Pass percentages below are based on the average values of each corresponding metric:", ""];
const RATIO_PASS = 0.7;

function staffNames(staffAssignments = []) {
  const name = (s) => `${s.staff?.lastName ?? "-"}, ${s.staff?.firstName ?? "-"}`;
  const pad = (arr) => Array.from({ length: 3 }, (_, i) => arr[i] ?? "-");
  return {
    leaders: pad(staffAssignments.filter((s) => s.roleType === "Leader").map(name)),
    assessors: pad(staffAssignments.filter((s) => s.roleType === "Assessor").map(name)),
  };
}

const parseIds = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : typeof parsed === "string" ? parseIds(parsed) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const avgRowOf = (c) =>
  (c.competencyAverages ?? []).find((a) => a.ppId === "Average") ?? c.competencyAverages?.[0] ?? null;

/** Fraction of candidates whose average value passes. */
function passFraction(candidates, getValue, passes) {
  let total = 0;
  let passed = 0;
  candidates.forEach((c) => {
    const avg = avgRowOf(c);
    if (!avg) return;
    const v = getValue(avg);
    if (v === null || v === undefined || Number.isNaN(v)) return;
    total++;
    if (passes(v)) passed++;
  });
  return total ? passed / total : 0;
}

const uniqueBy = (list, keyFn) => {
  const seen = new Set();
  return list.filter((item) => {
    const k = keyFn(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export async function buildUnitEZReport({ unit = {} }) {
  const {
    unitName, unitId, unitStartDate, unitEndDate, unitType, environment, frameworkAge, signatureProfile,
    XRR, XLR, XSR, XWR, XPR, XTR, XRVSR, XPVSR, XAVSR, XEP, XCP, XBP, MSIP, IC,
    "ΔRRN": deltaRRN, "ΔPRN": deltaPRN, "ΔARN": deltaARN, "ΔGEQ": deltaGEQ,
    rosterStats = {}, staffAssignments = [], benchmarks = [], candidates = [], rosterCandidates = [],
    engageLevelStats, rosterPercentages, tabulationAverages, assessmentSummary, competencyStability, effectivity,
  } = unit;
  const tprm = unitType === TPRM;
  const { leaders, assessors } = staffNames(staffAssignments);
  const isClassroom = String(environment ?? "").trim().toLowerCase() === "classroom";

  const getAvg = (key) => {
    if (Array.isArray(tabulationAverages)) {
      const found = tabulationAverages.find((t) => t.metric === key);
      if (found) return found.value;
    } else if (tabulationAverages && typeof tabulationAverages === "object") {
      return tabulationAverages[key];
    }
    return null;
  };

  const passPct = (key, threshold, cmp = (v, t) => v >= t) => {
    if (threshold === null || threshold === undefined || threshold === "") return null;
    return passFraction(candidates, (avg) => parseFloat(avg[key]), (v) => cmp(v, Number(threshold)));
  };
  const line = (label, value) => kv(label, n3(value));

  const unilateral = {
    "Communicative I/O": [["XRR", XRR], ["XLR", XLR], ["XSR", XSR], ["XWR", XWR]],
    "Theory & Practice": [["XTR", XTR], ["XPR", XPR]],
    [TPRM]: [["XRVSR", XRVSR], ["XPVSR", XPVSR], ["XAVSR", XAVSR]],
  }[unitType] ?? [];

  const msipPass = MSIP != null && MSIP !== "" ? passFraction(candidates, (a) => parseFloat(a.MSIP), (v) => v <= Number(MSIP)) : null;
  const icPass = IC != null && IC !== "" ? passFraction(candidates, (a) => getICValue(unitType, signatureProfile, a.IC), (v) => v >= Number(IC)) : null;

  // Roster
  const rosterSource = rosterCandidates.length ? rosterCandidates : candidates;
  const rosterRows = rosterSource.map((c) => [
    c.lastName, c.firstName, c.candidateId,
    c.candidateStartDate ?? c.startDate,
    c.nationality,
    c.unitOutcome ?? (Array.isArray(c.roster) ? c.roster[0]?.unitOutcome : null),
  ]);

  // Effort per candidate
  const effortRows = candidates.map((c) => [
    c.lastName, c.firstName, c.candidateId ?? c.id,
    n3(c.effortBu?.data?.CSD ?? c.effortBu?.CSD),
    n3(c.effortBu?.data?.USD ?? c.effortBu?.USD),
  ]);

  // Needs assessment status split (Open / Closed / Pending)
  const statusPct = assessmentSummary?.statusPercentages ?? {};

  // Benchmarks with the PP IDs that link them (any candidate's needs assessment)
  const allNeeds = candidates.flatMap((c) => c.needAssessments || []);
  const benchmarkRows = [...benchmarks]
    .sort((a, b) => Number(a.benchmarkId) - Number(b.benchmarkId))
    .map((b) => {
      const pps = [...new Set(allNeeds
        .filter((na) => [...parseIds(na.benchmarkIds), ...parseIds(na.bIds)].map(String).includes(String(b.benchmarkId)))
        .map((na) => na.ppId))].sort((x, y) => x - y);
      return [pps.length ? pps.join(", ") : "-", b.benchmarkId, b.benchmarkType, b.benchmarkRef, b.benchmarkDescription];
    });

  // Leader marks / improvements are unit-level (repeated on every candidate row)
  const leaderMarks = uniqueBy(candidates.flatMap((c) => c.leaderMarks || []), (m) => m.id ?? JSON.stringify([m.entryNumber, m.impactType, m.concernIdentified, m.identityDate]))
    .sort((a, b) => (a.entryNumber ?? 0) - (b.entryNumber ?? 0))
    .map((m, i) => [m.entryNumber ?? i + 1, m.impactType, m.concernIdentified, isoDate(m.identityDate), m.concernResolved, isoDate(m.resolutionDate)]);

  const improvements = uniqueBy(candidates.flatMap((c) => c.unitImprovement || []), (u) => u.id ?? JSON.stringify([u.lesson, u.benchmarkIds, u.bIds]))
    .map((u, i) => {
      const bids = parseIds(u.bIds);
      const linked = parseIds(u.benchmarkIds);
      return [i + 1, bids.length ? bids.join(", ") : "-", u.lesson, linked.length ? linked.join(", ") : "-"];
    });

  const eng = engageLevelStats?.percentages ?? {};

  const lines = [
    headerLines("Unit"),
    "",
    introLines(),
    "",
    sectionBanner(1),
    "",
    subHeader("UNIT DETAILS :"),
    kv("Unit Name", text(unitName), { indent: 2, width: 37 }),
    kv("Unit ID", text(unitId), { indent: 2, width: 37 }),
    kv("Unit Start Date", text(unitStartDate), { indent: 2, width: 37 }),
    kv("Unit End Date", text(unitEndDate), { indent: 2, width: 37 }),
    kv("Signature Profile", text(signatureProfile), { indent: 2, width: 37 }),
    kv("Unit Type", text(unitType), { indent: 2, width: 37 }),
    kv("Environment", text(environment), { indent: 2, width: 37 }),
    // Framework Age only applies to Classroom units (line is left out for Workforce units)
    ...(isClassroom ? [kv("Framework Age (Years)", text(frameworkAge), { indent: 2, width: 37 })] : []),
    kv("Unit Roster Count", text(rosterStats.totalCount), { indent: 2, width: 37 }),
    "",
    ...leaders.map((n, i) => kv(`Assigned Leader #${i + 1}`, n, { indent: 2, width: 37 })),
    "",
    ...assessors.map((n, i) => kv(`Assigned Assessor #${i + 1}`, n, { indent: 2, width: 37 })),
    "",
    sectionBanner(2),
    "",
    subHeader("UNIT ROSTER:"),
    table(["LAST NAME", "FIRST NAME", "CANDIDATE ID", "CANDIDATE START DATE", "NATIONALITY", "UNIT OUTCOME"], rosterRows),
    sectionBanner(3),
    "",
    subHeader("GRADE SCALE DEFINITION & THRESHOLDS:"),
    thresholdLines(unit),
    sectionBanner(4),
    "",
    subHeader("TABULATIONS - PROFICIENCY:"),
    PROFICIENCY_TEXT,
    PASS_NOTE,
    ...unilateral.map(([key, t]) => line(`Pass % Avg Unilateral - ${key}`, passPct(key, t))),
    "",
    line("Pass % Avg Receptive Ratio - RRN", passPct("RRN", RATIO_PASS)),
    line("Pass % Avg Productive Ratio - PRN", passPct("PRN", RATIO_PASS)),
    ...(tprm ? [line("Pass % Avg Acuity Ratio - ARN", passPct("ARN", RATIO_PASS))] : []),
    "",
    line("Pass % Avg Equivalent Proficiency - XEP", passPct("XEP", XEP)),
    line("Pass % Avg Composite Proficiency - XCP", passPct("XCP", XCP)),
    line("Pass % Avg Band Proficiency - XBP", passPct("XBP", XBP)),
    "",
    line("Pass % Stability in Proficiency", competencyStability?.stapStableFraction),
    "",
    subHeader("TABULATIONS - GROWTH:"),
    GROWTH_TEXT,
    PASS_NOTE,
    line("Pass % Average Growth - ΔRRN", passPct("deltaRRN", deltaRRN)),
    line("Pass % Average Growth - ΔPRN", passPct("deltaPRN", deltaPRN)),
    ...(tprm ? [line("Pass % Average Growth - ΔARN", passPct("deltaARN", deltaARN))] : []),
    "",
    line("Pass % Avg Equivalent Growth - ∆GEQ", passPct("GEQ", deltaGEQ)),
    line("Pass % Stability in Growth", competencyStability?.stagStableFraction),
    "",
    subHeader("TABULATIONS - HYBRID:"),
    HYBRID_TEXT,
    PASS_NOTE,
    line("Pass % Avg Butler Int Proficiency - MSIP", msipPass),
    line("Pass % Avg Interaction Class - IC", icPass),
    "",
    sectionBanner(5),
    "",
    subHeader("BUTLER PRODUCTIVITY & UTILIZATION:"),
    PASS_NOTE,
    line("Pass % Avg Productivity Rates - CSD", getAvg("Productivity_CSD")),
    line("Pass % Avg Productivity Rates - USD", getAvg("Productivity_USD")),
    "",
    table(["LAST NAME", "FIRST NAME", "CANDIDATE ID", "EFFORT - CSD", "EFFORT - USD"], effortRows),
    subHeader("ATTENDANCE TRACKING:"),
    line("Attendance % - Present", rosterPercentages?.present),
    line("Attendance % - Excused Absences", rosterPercentages?.excusedAbsences),
    line("Attendance % - Unexcused Absences", rosterPercentages?.unexcusedAbsences),
    line("Attendance % - Excused Tardies", rosterPercentages?.excusedTardies),
    line("Attendance % - Unexcused Tardies", rosterPercentages?.unexcusedTardies),
    "",
    subHeader("ENGAGEMENT TRACKING:"),
    line("Engagement Level % - High", eng.High),
    line("Engagement Level % - Medium", eng.Medium),
    line("Engagement Level % - Low", eng.Low),
    line("Engagement Level % - Not Applicable", eng["N/A"]),
    "",
    subHeader("NEEDS ASSESSMENT TRACKING:"),
    line("Action Status % - Open", statusPct.Open ?? 0),
    line("Action Status % - Closed", statusPct.Closed ?? 0),
    line("Action Status % - Pending", statusPct.Pending ?? 0),
    "",
    sectionBanner(6),
    "",
    subHeader("BENCHMARKS:"),
    table(["PP ID", "BIDs", "BENCHMARK TYPE", "BENCHMARK REF", "BENCHMARK DESCRIPTION"], benchmarkRows),
    subHeader("LEADER MARKS:"),
    table(["ENTRY", "IMPACT TYPE", "CONCERN IDENTIFIED", "IDENTITY DATE", "CONCERN RESOLVED", "RESOLUTION DATE"], leaderMarks),
    subHeader("IMPROVEMENTS & OPTIMIZATION:"),
    table(["ENTRY #", "BIDs", "LESSONS LEARNED", "LINKED BENCHMARKS"], improvements),
    sectionBanner(7),
    "",
    subHeader("EFFECTIVITY:"),
    EFFECTIVITY_INTRO,
    effectivityThresholdLines(effectivity?.thresholds),
    "",
    effectivityPassLines(effectivity?.passFractions),
    "",
    effectivityTypeLines(effectivity?.typeBreakdown),
    "",
    sectionBanner(8),
    "",
    nomenclatureBlock(),
    legalBlock(),
  ];

  return finalize(lines);
}

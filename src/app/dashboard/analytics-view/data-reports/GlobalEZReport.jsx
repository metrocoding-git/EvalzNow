// Global / Institutional report (.ez) – follows "Global_Analytics_Report (new).ez".
import { getIndexRating } from "@/lib/indexRating";
import { text, headerLines, introLines, sectionBanner, subHeader, kv, nomenclatureBlock, legalBlock, finalize } from "./helper/reportFormat";
import { effectivityPassLines, effectivityTypeLines } from "./helper/effectivityReport";

const FRAMEWORK_AGES = ["< 1 year", "1-2 years", "3-5 years", "6-10 years", "> 10 years"];

const assignedWeights = [
  0.500, 1.000, 0.250, 0.250,
  0.500, 0.500, 1.000, 1.000,
  0.500, 0.000, 0.000, 0.500,
  1.000, 0.000, 0.500, 1.000,
  1.000, 0.000, 0.000, 0.500,
  0.500, 1.000, 1.000, 1.000,
  1.000, 0.000, 0.500,
  1.000, 1.000, 1.000, 1.000,
  0.000, 0.000, 0.000, 0.250,
  0.500, 0.750, 1.000,
  1.000, 1.000, 1.000, 1.000,
  1.000, 1.000, 1.000, 1.000,
  0.000, 0.500, 1.000
];

function mainFunction(F6, assignedWeights) {
  let totalAssignedWeight = 0;
  let totalMetricWeight = 0;
  const arrayData = [];

  const length = Math.min(F6.length, assignedWeights.length);

  for (let i = 0; i < length; i++) {
    const metricValue = Number(F6[i]) || 0;
    const assignedWeight = Number(assignedWeights[i]) || 0;
    const metricWeight = metricValue * assignedWeight;

    arrayData.push({
      f6: metricValue.toFixed(3),
      g6: assignedWeight.toFixed(3),
      h6: metricWeight.toFixed(3),
    });

    totalAssignedWeight += assignedWeight;
    totalMetricWeight += metricWeight;
  }

  const weightedIndex =
    totalAssignedWeight > 0
      ? totalMetricWeight / totalAssignedWeight
      : 0;

  // 8-band rating (see src/lib/indexRating.js)
  const rating = getIndexRating(weightedIndex);

  return [
    rating,
    weightedIndex,
    { H6: arrayData },
    Number(totalAssignedWeight.toFixed(3)),
    Number(totalMetricWeight.toFixed(3)),
  ];
}



export function buildGlobalEZReport({ client, totalCandidates, analytics, thresholds, icValue, stableValue, productivityValue, frameworkAge, effectivity }) {

  const candidateStaffRatioPct = (value, total) => {
    const v = Number(value) || 0;
    const t = Number(total) || 0;

    return t > 0 ? (v / t).toFixed(3) : "0.000";
  };

  const totalAttendance =
    (Number(analytics.attendance?.present) || 0) +
    (Number(analytics.attendance?.excusedAbsences) || 0) +
    (Number(analytics.attendance?.unexcusedAbsences) || 0) +
    (Number(analytics.attendance?.excusedTardies) || 0) +
    (Number(analytics.attendance?.unexcusedTardies) || 0);

  const totalSTAP =
    (Number(stableValue?.STAP?.STABLE) || 0) +
    (Number(stableValue?.STAP?.UNSTABLE) || 0);

  const totalSTAG =
    (Number(stableValue?.STAG?.STABLE) || 0) +
    (Number(stableValue?.STAG?.UNSTABLE) || 0);

  const fraction = (value, total) => {
    const v = Number(value) || 0;
    const t = Number(total) || 0;

    return t > 0 ? (v / t).toFixed(3) : "0.000";
  };

  const stapStability = fraction(stableValue?.STAP?.STABLE, totalSTAP);
  const stagStability = fraction(stableValue?.STAG?.STABLE, totalSTAG);

  const pct = (v, total) =>
    total ? (v / total).toFixed(3) : "0.000";

  const fmt = (v) =>
    v === null || v === undefined ? "0.000" : Number(v).toFixed(3);


  const totalAssessmentBlocks = Object.values(analytics.assessmentBlocks || {})
    .reduce((sum, v) => sum + (Number(v) || 0), 0);

  const totalUnitOutcomes = Object.values(analytics.unitOutcomes || {})
    .reduce((sum, v) => sum + (Number(v) || 0), 0);

  const F6 = [
    // Signature Profiles (4)
    pct(analytics.signatureProfiles["Case 1: Solid Balanced"], analytics.totalUnits),
    pct(analytics.signatureProfiles["Case 2: Rigorous Balanced"], analytics.totalUnits),
    pct(analytics.signatureProfiles["Case 3a: Productive-Weighted"], analytics.totalUnits),
    pct(analytics.signatureProfiles["Case 3b: Receptive-Weighted"], analytics.totalUnits),

    // Unit Types (3)
    pct(analytics.unitTypes["Communicative I/O"], analytics.totalUnits),
    pct(analytics.unitTypes["Theory & Practice"], analytics.totalUnits),
    pct(analytics.unitTypes["Third Parameter"], analytics.totalUnits),

    // Effectivity (20)
    candidateStaffRatioPct(analytics.candidateStaffRatio["≤ 10"], analytics.totalUnits),
    candidateStaffRatioPct(analytics.candidateStaffRatio["10–20"], analytics.totalUnits),
    candidateStaffRatioPct(analytics.candidateStaffRatio["> 20"], analytics.totalUnits),

    pct(analytics.benchmarkCounts["BC ≤ 10"], analytics.totalUnits),
    pct(analytics.benchmarkCounts["10 < BC ≤ 25"], analytics.totalUnits),
    pct(analytics.benchmarkCounts["BC > 25"], analytics.totalUnits),

    pct(analytics.assessmentBlocks["AB ≤ 8"], totalAssessmentBlocks),
    pct(analytics.assessmentBlocks["8 < AB ≤ 20"], totalAssessmentBlocks),
    pct(analytics.assessmentBlocks["AB > 20"], totalAssessmentBlocks),

    fraction(analytics.attendance.present, totalAttendance),
    fraction(analytics.attendance.excusedAbsences, totalAttendance),
    fraction(analytics.attendance.unexcusedAbsences, totalAttendance),
    fraction(analytics.attendance.excusedTardies, totalAttendance),
    fraction(analytics.attendance.unexcusedTardies, totalAttendance),

    pct(analytics.needAssessments.Closed, analytics.needAssessments.Total),
    fmt(analytics.candidateMarks.impactScore),
    fmt(analytics.leaderMarks.impactScore),


    pct(analytics.unitOutcomes.Pass, totalUnitOutcomes),
    pct(analytics.unitOutcomes.Fail, totalUnitOutcomes),
    pct(analytics.unitOutcomes.Ongoing, totalUnitOutcomes),

    // Remaining proficiency metrics (4)
    fmt(thresholds.regularMetrics.XEP.successRate),
    fmt(thresholds.regularMetrics.XCP.successRate),
    fmt(thresholds.regularMetrics.XBP.successRate),
    stapStability,

    // Hybrid (7)
    fmt(thresholds.regularMetrics.MSIP.successRate),
    fmt(icValue[0]),
    fmt(icValue[1]),
    fmt(icValue[2]),
    fmt(icValue[3]),
    fmt(icValue[4]),
    fmt(icValue[5]),

    // Growth (8)
    fmt(thresholds.averageDeltaMetrics.avgDeltaRRN.successRate),
    fmt(thresholds.averageDeltaMetrics.avgDeltaPRN.successRate),
    fmt(thresholds.averageDeltaMetrics.avgDeltaARN.successRate),

    fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaRRN.successRate),
    fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaPRN.successRate),
    fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaARN.successRate),

    fmt(thresholds.regularMetrics.GEQ.successRate),
    stagStability,

    // Utilization (3)
    fmt(productivityValue.low),
    fmt(productivityValue.mid),
    fmt(productivityValue.high),
  ].map(Number);

  const indexResult = mainFunction(F6, assignedWeights);

  const indexRating = indexResult[0];
  const weightedIndex = indexResult[1];

  const kvg = (label, value) => kv(label, value, { indent: 2, width: 42 });
  const kvc = (label, value) => kv(label, value, { indent: 2, width: 37 });
  const sub = (title) => subHeader(title, "  ");
  const fw = frameworkAge || null; // null -> no Classroom units -> "-"

  const lines = [
    headerLines("Global / Institutional"),
    "",
    introLines(),
    "",
    sectionBanner(1),
    "",
    sub("CLIENT DETAILS :"),
    kvc("Executive ID", text(client?.executiveId)),
    kvc("Company Name", text(client?.companyName)),
    kvc("Company Contact Number", text(client?.companyContactNumber)),
    kvc("Institutional Type", text(client?.institutionalType)),
    kvc("Country", text(client?.country)),
    kvc("Company Size", text(client?.companySize?.candidate)),
    "",
    kvc("Total Unit Count", text(analytics.totalUnits)),
    kvc("Total Candidate Count", text(totalCandidates)),
    "",
    sectionBanner(2),
    "",
    sub("SIGNATURE PROFILE SELECTIONS:"),
    kvg("Global Percentage of Case 1 Profiles", pct(analytics.signatureProfiles["Case 1: Solid Balanced"], analytics.totalUnits)),
    kvg("Global Percentage of Case 2 Profiles", pct(analytics.signatureProfiles["Case 2: Rigorous Balanced"], analytics.totalUnits)),
    kvg("Global Percentage of Case 3a Profiles", pct(analytics.signatureProfiles["Case 3a: Productive-Weighted"], analytics.totalUnits)),
    kvg("Global Percentage of Case 3b Profiles", pct(analytics.signatureProfiles["Case 3b: Receptive-Weighted"], analytics.totalUnits)),
    "",
    sub("UNIT TYPE SELECTIONS:"),
    kvg("Global Percentage of CI/CO", pct(analytics.unitTypes["Communicative I/O"], analytics.totalUnits)),
    kvg("Global Percentage of T&P", pct(analytics.unitTypes["Theory & Practice"], analytics.totalUnits)),
    kvg("Global Percentage of Third Parameter", pct(analytics.unitTypes["Third Parameter"], analytics.totalUnits)),
    "",
    sub("EFFECTIVITY OF UNITS:"),
    kvg("% Units Cand-to-Lead, CTL ≤ 10", candidateStaffRatioPct(analytics.candidateStaffRatio["≤ 10"], analytics.totalUnits)),
    kvg("% Units Cand-to-Lead, 10 < CTL ≤ 20", candidateStaffRatioPct(analytics.candidateStaffRatio["10–20"], analytics.totalUnits)),
    kvg("% Units Cand-to-Lead, CTL > 20", candidateStaffRatioPct(analytics.candidateStaffRatio["> 20"], analytics.totalUnits)),
    "",
    kvg("% Benchmark Counts, BC ≤ 10", pct(analytics.benchmarkCounts["BC ≤ 10"], analytics.totalUnits)),
    kvg("% Benchmark Counts, 10 < BC ≤ 25", pct(analytics.benchmarkCounts["10 < BC ≤ 25"], analytics.totalUnits)),
    kvg("% Benchmark Counts, BC > 25", pct(analytics.benchmarkCounts["BC > 25"], analytics.totalUnits)),
    "",
    kvg("% Assessment Blocks, AB ≤ 8", pct(analytics.assessmentBlocks["AB ≤ 8"], totalAssessmentBlocks)),
    kvg("% Assessment Blocks, 8 < AB ≤ 20", pct(analytics.assessmentBlocks["8 < AB ≤ 20"], totalAssessmentBlocks)),
    kvg("% Assessment Blocks, AB > 20", pct(analytics.assessmentBlocks["AB > 20"], totalAssessmentBlocks)),
    "",
    kvg("% Attendance - Present", fraction(analytics.attendance.present, totalAttendance)),
    kvg("% Attendance - Excused Absences", fraction(analytics.attendance.excusedAbsences, totalAttendance)),
    kvg("% Attendance - Unexcused Absences", fraction(analytics.attendance.unexcusedAbsences, totalAttendance)),
    kvg("% Attendance - Excused Tardies", fraction(analytics.attendance.excusedTardies, totalAttendance)),
    kvg("% Attendance - Unexcused Tardies", fraction(analytics.attendance.unexcusedTardies, totalAttendance)),
    "",
    kvg("% Action Status - Closed", pct(analytics.needAssessments.Closed, analytics.needAssessments.Total)),
    kvg("% Positive Candidate Marks", fmt(analytics.candidateMarks.impactScore)),
    kvg("% Positive Leader Marks", fmt(analytics.leaderMarks.impactScore)),
    "",
    kvg("% Passing Candidates", pct(analytics.unitOutcomes.Pass, totalUnitOutcomes)),
    kvg("% Failed Candidates", pct(analytics.unitOutcomes.Fail, totalUnitOutcomes)),
    kvg("% Ongoing Candidates", pct(analytics.unitOutcomes.Ongoing, totalUnitOutcomes)),
    "",
    sectionBanner(3),
    "",
    sub("PROFICIENCY OUTCOMES OF ALL UNITS:"),
    kvg("% Passed Average Unilateral - XRR", fmt(thresholds.regularMetrics.XRR.successRate)),
    kvg("% Passed Average Unilateral - XLR", fmt(thresholds.regularMetrics.XLR.successRate)),
    kvg("% Passed Average Unilateral - XWR", fmt(thresholds.regularMetrics.XWR.successRate)),
    kvg("% Passed Average Unilateral - XSR", fmt(thresholds.regularMetrics.XSR.successRate)),
    "",
    kvg("% Passed Average Unilateral - XTR", fmt(thresholds.regularMetrics.XTR.successRate)),
    kvg("% Passed Average Unilateral - XPR", fmt(thresholds.regularMetrics.XPR.successRate)),
    "",
    kvg("% Passed Average Unilateral - XRVSR", fmt(thresholds.regularMetrics.XRVSR.successRate)),
    kvg("% Passed Average Unilateral - XPVSR", fmt(thresholds.regularMetrics.XPVSR.successRate)),
    kvg("% Passed Average Unilateral - XAVSR", fmt(thresholds.regularMetrics.XAVSR.successRate)),
    "",
    kvg("% Passed Average Equivalent Prof - XEP", fmt(thresholds.regularMetrics.XEP.successRate)),
    kvg("% Passed Average Composite Prof - XCP", fmt(thresholds.regularMetrics.XCP.successRate)),
    kvg("% Passed Average Band Prof - XBP", fmt(thresholds.regularMetrics.XBP.successRate)),
    kvg("% Passed Stability Proficiency - STA/P", stapStability),
    "",
    sub("HYBRID OUTCOMES OF ALL UNITS:"),
    kvg("% Passed Average Butler Int - MSIP", fmt(thresholds.regularMetrics.MSIP.successRate)),
    "",
    ...[0, 1, 2, 3, 4, 5].map((c) => kvg(`% Units Interaction Class ${c}`, fmt(icValue?.[c]))),
    "",
    sub("GROWTH OUTCOMES OF ALL UNITS:"),
    kvg("% Passed Average Growth - ∆RR", fmt(thresholds.averageDeltaMetrics.avgDeltaRRN.successRate)),
    kvg("% Passed Average Growth - ∆PR", fmt(thresholds.averageDeltaMetrics.avgDeltaPRN.successRate)),
    kvg("% Passed Average Growth - ∆AR", fmt(thresholds.averageDeltaMetrics.avgDeltaARN.successRate)),
    "",
    kvg("% Passed Cumulative Growth - ∆RR", fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaRRN.successRate)),
    kvg("% Passed Cumulative Growth - ∆PR", fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaPRN.successRate)),
    kvg("% Passed Cumulative Growth - ∆AR", fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaARN.successRate)),
    "",
    kvg("% Passed Avg Equivalent Growth - ∆GEQ", fmt(thresholds.regularMetrics.GEQ.successRate)),
    kvg("% Passed Stability Proficiency - STA/G", stagStability),
    "",
    sub("UTILIZATION OUTCOMES:"),
    kvg("Productivity, UR < 0.300", fmt(productivityValue?.low)),
    kvg("Productivity, 0.300 ≤ UR ≤ 0.600", fmt(productivityValue?.mid)),
    kvg("Productivity, UR > 0.600", fmt(productivityValue?.high)),
    "",
    sub("EFFECTIVITY OUTCOMES:"),
    effectivityPassLines(effectivity?.passFractions, { label: (n) => `% Passed Effectivity Parameter ${n}`, indent: 2 }),
    "",
    effectivityTypeLines(effectivity?.typeBreakdown, { label: (t) => `% Effectivity Type - ${t}`, indent: 2 }),
    "",
    sub("FRAMEWORK/CURRICULUM AGE:"),
    ...FRAMEWORK_AGES.map((age) => kvg(`% FRAMEWORK AGE: ${age}`, fw ? fmt(fw[age]) : "-")),
    "",
    sub("CONCLUSIONS:"),
    kvg("Index Rating", indexRating),
    kvg("Weighted Index", fmt(weightedIndex)),
    "",
    nomenclatureBlock(),
    legalBlock(),
  ];

  return finalize(lines);
}

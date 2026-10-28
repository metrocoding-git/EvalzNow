/**
 * Clinical Analytics (Capacity_Part15) – institutional level over ALL capsules.
 * Same rules as the server Global Analytics (all units); the two are never mixed.
 *
 * Index table: Metric Values (groupings out of 100%), fixed Assigned Weights,
 * Metric Weight = Value × Weight, Weighted Index = Σ Metric Weights / Σ Assigned Weights,
 * Index Rating from the 8 bands of src/lib/indexRating.js.
 */
import { getAllCapsules, loadCapsuleStore } from "@/services/capsuleService";
import { getCapsuleCandidates, getCapsuleMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
import { thresholdsOf } from "@/app/dashboard/control-view/capsule/capsuleConfig";
import { getIndexRating } from "@/lib/indexRating";
import { CAPSULE_COMBINED, CAPSULE_ISOLATED, RATIO_KEYS } from "./capsuleMetrics";

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const share = (part, total) => (total ? part / total : null);
const idsOf = (v) => {
  let x = v;
  for (let i = 0; i < 2 && typeof x === "string"; i++) {
    try { x = JSON.parse(x || "[]"); } catch { return []; }
  }
  return Array.isArray(x) ? x : [];
};

/** Metrics compared with the capsule thresholds (pass: value ≥ threshold, MSIP: value ≤ threshold). */
const PASS_METRICS = [
  { key: "XEP", threshold: "XEP" },
  ...RATIO_KEYS[CAPSULE_COMBINED].map((k) => ({ key: k, threshold: k, type: CAPSULE_COMBINED })),
  ...RATIO_KEYS[CAPSULE_ISOLATED].map((k) => ({ key: k, threshold: k, type: CAPSULE_ISOLATED })),
  { key: "XCP", threshold: "XCP" },
  { key: "XBP", threshold: "XBP" },
  { key: "MSIP", threshold: "MSIP", lower: true },
  { key: "GEQ", threshold: "ΔGEQ" },
  { key: "avgDPC1", threshold: "ΔPC1" }, { key: "avgDPC2", threshold: "ΔPC2" }, { key: "avgDPC3", threshold: "ΔPC3" },
  { key: "sumDPC1", threshold: "ΔPC1" }, { key: "sumDPC2", threshold: "ΔPC2" }, { key: "sumDPC3", threshold: "ΔPC3" },
];

/** IC class (Case 1: Solid Balanced → the R value of "xRyP"). */
const icClass = (ic) => {
  const m = String(ic || "").match(/(\d)R(\d)P/);
  return m ? Number(m[1]) : null;
};

/** Raw counts over all capsules. */
export async function collectClinicalData() {
  const capsules = await getAllCapsules();
  const store = loadCapsuleStore();
  const out = {
    totalCapsules: capsules.length,
    capsuleTypes: { [CAPSULE_COMBINED]: 0, [CAPSULE_ISOLATED]: 0 },
    candidateLeaderRatio: { "CTL ≤ 10": 0, "10 < CTL ≤ 20": 0, "CTL > 20": 0 },
    benchmarkCounts: { "BC ≤ 10": 0, "10 < BC ≤ 25": 0, "BC > 25": 0 },
    assessmentBlocks: { "AB ≤ 8": 0, "8 < AB ≤ 20": 0, "AB > 20": 0 },
    attendance: { present: 0, excusedAbsences: 0, unexcusedAbsences: 0, excusedTardies: 0, unexcusedTardies: 0 },
    needAssessments: { Total: 0, Open: 0, Pending: 0, Closed: 0 },
    candidateMarks: { positiveMarks: 0, totalMarks: 0 },
    leaderMarks: { positiveMarks: 0, totalMarks: 0 },
    pass: Object.fromEntries(PASS_METRICS.map((m) => [m.key, { successCount: 0, totalInstances: 0 }])),
    ic: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    STAP: { STABLE: 0, UNSTABLE: 0 },
    STAG: { STABLE: 0, UNSTABLE: 0 },
  };
  const capsuleIds = new Set(capsules.map((c) => String(c.id)));

  for (const capsule of capsules) {
    if (out.capsuleTypes[capsule.capsuleType] !== undefined) out.capsuleTypes[capsule.capsuleType] += 1;
    const candidates = await getCapsuleCandidates(capsule.id);

    // Candidate-to-Leader ratio (capsules without a Leader are not counted)
    const leaders = (capsule.staffAssignments || []).filter((s) => s.roleType === "Leader").length;
    if (leaders > 0) {
      const ratio = candidates.length / leaders;
      out.candidateLeaderRatio[ratio <= 10 ? "CTL ≤ 10" : ratio <= 20 ? "10 < CTL ≤ 20" : "CTL > 20"] += 1;
    }

    const bc = (capsule.benchmarks || []).length;
    out.benchmarkCounts[bc <= 10 ? "BC ≤ 10" : bc <= 25 ? "10 < BC ≤ 25" : "BC > 25"] += 1;

    // Assessment blocks per candidate, positive PP IDs only
    candidates.forEach((cand) => {
      const n = store.blocks.filter((b) => String(b.capsuleId) === String(capsule.id)
        && String(b.candidate_id) === String(cand.id) && Number(b.ppId) > 0).length;
      out.assessmentBlocks[n <= 8 ? "AB ≤ 8" : n <= 20 ? "8 < AB ≤ 20" : "AB > 20"] += 1;
    });

    // Thresholds of the capsule, averages of every candidate
    if (!candidates.length) continue;
    const th = thresholdsOf(capsule);
    const summary = await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: candidates.map((c) => c.id).join(",") });
    candidates.forEach((cand) => {
      const avg = (summary.averages || []).find((a) => String(a.candidateId) === String(cand.id));
      if (!avg) return;
      const cum = (summary.cumulativeSums || []).find((a) => String(a.candidateId) === String(cand.id)) || {};
      const values = {
        ...avg,
        avgDPC1: avg.dPC1, avgDPC2: avg.dPC2, avgDPC3: avg.dPC3,
        sumDPC1: cum.dPC1, sumDPC2: cum.dPC2, sumDPC3: cum.dPC3,
      };
      PASS_METRICS.forEach((m) => {
        if (m.type && m.type !== capsule.capsuleType) return;
        const v = toNum(values[m.key]);
        const t = toNum(th[m.threshold]);
        if (v === null || t === null) return;
        out.pass[m.key].totalInstances += 1;
        if (m.lower ? v <= t : v >= t) out.pass[m.key].successCount += 1;
      });
      const c = icClass(avg.IC);
      if (c !== null && out.ic[c] !== undefined) out.ic[c] += 1;
      if (out.STAP[avg.STAP] !== undefined) out.STAP[avg.STAP] += 1;
      if (out.STAG[avg.STAG] !== undefined) out.STAG[avg.STAG] += 1;
    });
  }

  store.rosters.filter((r) => capsuleIds.has(String(r.capsuleId))).forEach((r) => {
    Object.keys(out.attendance).forEach((k) => { out.attendance[k] += Number(r[k === "present" ? "presentCount" : k]) || 0; });
  });

  // Needs assessments: Total = all assessment blocks, Closed = benchmark(s) + observation, Pending = other rows
  out.needAssessments.Total = store.blocks.filter((b) => capsuleIds.has(String(b.capsuleId))).length;
  (store.auxNeedAssessments || []).filter((n) => capsuleIds.has(String(n.unitId))).forEach((n) => {
    const closed = idsOf(n.bIds ?? n.benchmarkIds).length > 0 && String(n.observation || "").trim();
    out.needAssessments[closed ? "Closed" : "Pending"] += 1;
  });
  out.needAssessments.Open = Math.max(0, out.needAssessments.Total - out.needAssessments.Pending - out.needAssessments.Closed);

  const marks = (list, target) => list.filter((m) => capsuleIds.has(String(m.unitId))).forEach((m) => {
    target.totalMarks += 1;
    if (m.impactType === "Positive") target.positiveMarks += 1;
  });
  marks(store.auxCandidateMarks || [], out.candidateMarks);
  marks(store.auxLeaderMarks || [], out.leaderMarks);
  return out;
}

const rate = (p) => (p && p.totalInstances ? p.successCount / p.totalInstances : null);
const total = (o) => Object.values(o).reduce((t, v) => t + (Number(v) || 0), 0);

/** The Shared Clinical Analytics Index Table rows (description, value resolver, assigned weight). */
export const INDEX_ROWS = [
  ["Global Percentage of Capacity - Combined", (d) => share(d.capsuleTypes[CAPSULE_COMBINED], d.totalCapsules), 0.25],
  ["Global Percentage of Capacity - Isolated", (d) => share(d.capsuleTypes[CAPSULE_ISOLATED], d.totalCapsules), 0.75],
  ["Global Percentage of Capsules with Candidate-to-Leader Ratio, CTL ≤ 10", (d) => share(d.candidateLeaderRatio["CTL ≤ 10"], d.totalCapsules), 1],
  ["Global Percentage of Capsules with Candidate-to-Leader Ratio, 10 < CTL ≤ 20", (d) => share(d.candidateLeaderRatio["10 < CTL ≤ 20"], d.totalCapsules), 0.5],
  ["Global Percentage of Capsules with Candidate-to-Leader Ratio, CTL > 20", (d) => share(d.candidateLeaderRatio["CTL > 20"], d.totalCapsules), 0],
  ["Global Percentage of Benchmark Counts, BC ≤ 10", (d) => share(d.benchmarkCounts["BC ≤ 10"], d.totalCapsules), 0],
  ["Global Percentage of Benchmark Counts, 10 < BC ≤ 25", (d) => share(d.benchmarkCounts["10 < BC ≤ 25"], d.totalCapsules), 0.5],
  ["Global Percentage of Benchmark Counts, BC > 25", (d) => share(d.benchmarkCounts["BC > 25"], d.totalCapsules), 1],
  ["Global Percentage of Assessment Blocks, AB ≤ 8", (d) => share(d.assessmentBlocks["AB ≤ 8"], total(d.assessmentBlocks)), 0],
  ["Global Percentage of Assessment Blocks, 8 < AB ≤ 20", (d) => share(d.assessmentBlocks["8 < AB ≤ 20"], total(d.assessmentBlocks)), 0.5],
  ["Global Percentage of Assessment Blocks, AB > 20", (d) => share(d.assessmentBlocks["AB > 20"], total(d.assessmentBlocks)), 1],
  ["Global Percentage of Attendance - Present", (d) => share(d.attendance.present, total(d.attendance)), 1],
  ["Global Percentage of Attendance - Excused Absences", (d) => share(d.attendance.excusedAbsences, total(d.attendance)), 0],
  ["Global Percentage of Attendance - Unexcused Absences", (d) => share(d.attendance.unexcusedAbsences, total(d.attendance)), 0],
  ["Global Percentage of Attendance - Excused Tardies", (d) => share(d.attendance.excusedTardies, total(d.attendance)), 0.5],
  ["Global Percentage of Attendance - Unexcused Tardies", (d) => share(d.attendance.unexcusedTardies, total(d.attendance)), 0.5],
  ["Global Percentage Closed Items for All Courses", (d) => {
    const { Open, Pending, Closed } = d.needAssessments;
    return share(Closed, Open + Pending + Closed);
  }, 1],
  ["Global Percentage of Positive Candidate Marks", (d) => share(d.candidateMarks.positiveMarks, d.candidateMarks.totalMarks), 1],
  ["Global Percentage of Positive Leader Marks", (d) => share(d.leaderMarks.positiveMarks, d.leaderMarks.totalMarks), 1],
  ["Global Percentage of Average Passed Equivalent Proficiency - XEQ", (d) => rate(d.pass.XEP), 1],
  ["Global Percentage of Average Passed Composite Proficiency - XCP", (d) => rate(d.pass.XCP), 1],
  ["Global Percentage of Average Passed Band Proficiency - XBP", (d) => rate(d.pass.XBP), 1],
  ["Global Percentages of Stable Proficiency - STA/P", (d) => share(d.STAP.STABLE, total(d.STAP)), 1],
  ["Global Percentage of Average Passed Butler Interaction Proficiency - MSIP", (d) => rate(d.pass.MSIP), 0],
  ...[0, 0, 0.25, 0.5, 0.75, 1].map((w, i) => [
    `Global Percentage of Average Interaction Class ${i}`, (d) => share(d.ic[i], total(d.ic)), w,
  ]),
  ["Global Percentage of Average Passed Equivalent Growth - ∆GEQ", (d) => rate(d.pass.GEQ), 1],
  ...[1, 2, 3].map((i) => [`Global Percentage of Passed Average Growth - ∆PC${i}`, (d) => rate(d.pass[`avgDPC${i}`]), 1]),
  ...[1, 2, 3].map((i) => [`Global Percentage of Passed Cumulative Growth - ∆PC${i}`, (d) => rate(d.pass[`sumDPC${i}`]), 1]),
  ["Global Percentages of Stable Growth - STA/G", (d) => share(d.STAG.STABLE, total(d.STAG)), 1],
];

/** Index table + Weighted Index + Index Rating. */
export function buildIndexTable(data) {
  const rows = INDEX_ROWS.map(([description, resolve, weight]) => {
    const raw = data ? resolve(data) : null;
    const value = raw === null || raw === undefined || Number.isNaN(raw) ? null : Number(raw);
    return { description, value, weight, metricWeight: value === null ? null : value * weight };
  });
  const totalWeight = rows.reduce((t, r) => t + r.weight, 0);
  const totalMetricWeight = rows.reduce((t, r) => t + (r.metricWeight || 0), 0);
  const weightedIndex = totalWeight > 0 ? totalMetricWeight / totalWeight : 0;
  return { rows, totalWeight, totalMetricWeight, weightedIndex, rating: getIndexRating(weightedIndex) };
}

const slices = (obj, order = Object.keys(obj), label = (k) => k) => {
  const t = order.reduce((s, k) => s + (Number(obj[k]) || 0), 0);
  return order.map((k) => ({ name: label(k), count: Number(obj[k]) || 0, value: t ? Number(((Number(obj[k]) || 0) / t).toFixed(3)) : 0 }));
};
const passSlices = (p) => (p && p.totalInstances
  ? [{ name: "Pass", count: p.successCount, value: Number((p.successCount / p.totalInstances).toFixed(3)) },
    { name: "Fail", count: p.totalInstances - p.successCount, value: Number((1 - p.successCount / p.totalInstances).toFixed(3)) }]
  : []);
const posNeg = (m) => (m.totalMarks
  ? [{ name: "Positive", count: m.positiveMarks, value: Number((m.positiveMarks / m.totalMarks).toFixed(3)) },
    { name: "Negative", count: m.totalMarks - m.positiveMarks, value: Number((1 - m.positiveMarks / m.totalMarks).toFixed(3)) }]
  : []);
const ATTENDANCE_LABELS = {
  present: "Present", excusedAbsences: "Excused Absences", unexcusedAbsences: "Unexcused Absences",
  excusedTardies: "Excused Tardies", unexcusedTardies: "Unexcused Tardies",
};

/** The 34 charts (pie slices) + the index table entity. */
export const CLINICAL_CHARTS = [
  { name: "Shared Clinical Analytics Index Table", icon: "🟦", type: "table" },
  { name: "Global Capsule Type Percentages", data: (d) => slices(d.capsuleTypes) },
  { name: "Global Candidate-to-Leader Percentages", data: (d) => slices(d.candidateLeaderRatio) },
  { name: "Global Benchmark Count Percentages", data: (d) => slices(d.benchmarkCounts) },
  { name: "Global Assessment Block Count Percentages", data: (d) => slices(d.assessmentBlocks) },
  { name: "Global Attendance Percentages", data: (d) => slices(d.attendance, undefined, (k) => ATTENDANCE_LABELS[k]) },
  { name: "Global Open Action Item Percentages", data: (d) => slices(d.needAssessments, ["Open", "Pending", "Closed"]) },
  { name: "Global Percentage of Positive Candidate Marks", data: (d) => posNeg(d.candidateMarks) },
  { name: "Global Percentage of Positive Leader Marks", data: (d) => posNeg(d.leaderMarks) },
  { name: "Global Percentages of Average Equivalent Proficiency - XEP", data: (d) => passSlices(d.pass.XEP) },
  ...[...RATIO_KEYS[CAPSULE_COMBINED], ...RATIO_KEYS[CAPSULE_ISOLATED]].map((k) => ({
    name: `Global Percentages of Average Unilateral Proficiency - ${k}`, data: (d) => passSlices(d.pass[k]),
  })),
  { name: "Global Percentages of Average Composite Proficiency - XCP", data: (d) => passSlices(d.pass.XCP) },
  { name: "Global Percentages of Average Band Proficiency - XBP", data: (d) => passSlices(d.pass.XBP) },
  { name: "Global Percentages of Stability in Proficiency - STA/P", data: (d) => slices(d.STAP, ["STABLE", "UNSTABLE"], (k) => (k === "STABLE" ? "Stable" : "Unstable")) },
  { name: "Global Percentages of Average Butler Interaction Proficiency - MSIP", data: (d) => passSlices(d.pass.MSIP) },
  { name: "Global Percentages of Average Interaction Class - IC", data: (d) => slices(d.ic, undefined, (k) => `IC ${k}`) },
  { name: "Global Percentages of Equivalent Growth - GEQ", data: (d) => passSlices(d.pass.GEQ) },
  ...[1, 2, 3].map((i) => ({ name: `Global Percentages of Average Growth - ∆PC${i}`, data: (d) => passSlices(d.pass[`avgDPC${i}`]) })),
  ...[1, 2, 3].map((i) => ({ name: `Global Percentages of Cumulative Growth - ∆PC${i}`, data: (d) => passSlices(d.pass[`sumDPC${i}`]) })),
  { name: "Global Percentages of Stability in Growth - STA/G", data: (d) => slices(d.STAG, ["STABLE", "UNSTABLE"], (k) => (k === "STABLE" ? "Stable" : "Unstable")) },
].map((c, i) => ({ icon: "🔵", type: "pie", ...c, id: i + 1 }));

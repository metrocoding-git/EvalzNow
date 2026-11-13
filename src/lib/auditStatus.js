/**
 * Audit Status – one .ez file per Unit / Capsule, built from Rick's Audit Status templates
 * (src/lib/audit/auditTemplates.js, filled by src/lib/audit/auditFill.js). File name: Audit_<Name>_<ID>.ez
 *
 *  PRELIMINARY ALERTS          all units (unit files) / all capsules (capsule files) of the client:
 *                              Candidate-to-Leader Ratio > 20, Benchmarks Count ≤ 10, Assessment Blocks ≤ 8
 *  DETAILS - AUDITS AND ALERTS the unit / capsule of the file:
 *    data summary, candidates with Attendance - Present < 0.900, open Needs Assessment items (a PP ID with
 *    no BID and no observation), negative candidate marks, leaders with negative leader marks,
 *    failed candidates (units), missing data (no assessment blocks, or a PP ID without a score for every
 *    competency / capacity), critical underperformance (candidate averages / cumulative values against the
 *    unit / capsule thresholds or the numbers written in the template) and secondary underperformance
 *    (average effectivity parameters above the template numbers).
 */
import { n2, n3 } from "@/app/dashboard/analytics-view/data-reports/helper/reportFormat";
import { getICValue } from "@/app/dashboard/analytics-view/data-reports/ActiveCandidateEZReport";
import { getAllUnits } from "@/services/unitService";
import { getDataReportByClient } from "@/services/dataReportService";
import { getAllCapsules, getCapsuleRosterByCapsuleId, loadCapsuleStore } from "@/services/capsuleService";
import { getCapsuleAsUnit, getCapsuleCandidates, getCapsuleMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
import { getUnitEffectivity } from "@/services/capsuleEffectivityService";
import { capacitiesOf, thresholdsOf } from "@/app/dashboard/control-view/capsule/capsuleConfig";
import { CAPSULE_COMBINED } from "@/lib/capsule/capsuleMetrics";
import { fillAudit } from "@/lib/audit/auditFill";
import {
  AUDIT_CAPSULE_COMBINED, AUDIT_CAPSULE_ISOLATED, AUDIT_UNIT_CICO, AUDIT_UNIT_TP, AUDIT_UNIT_TPRM,
} from "@/lib/audit/auditTemplates";

const safeName = (v) => String(v || "-").replace(/[\\/:*?"<>|]/g, "_");
export const auditFileName = (name, id) => `Audit_${safeName(name)}_${safeName(id)}.ez`;

const UNIT_TEMPLATES = { "Communicative I/O": AUDIT_UNIT_CICO, "Theory & Practice": AUDIT_UNIT_TP, "Third Parameter": AUDIT_UNIT_TPRM };
const UNIT_COMPETENCIES = {
  "Communicative I/O": ["Reading", "Listening", "Speaking", "Writing"],
  "Theory & Practice": ["Theory", "Practice"],
  "Third Parameter": ["Receptive", "Productive", "Acuity"],
};

const num = (v) => {
  if (v === null || v === undefined || v === "" || v === "-") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const idsOf = (v) => {
  let x = v;
  for (let i = 0; i < 2 && typeof x === "string"; i++) {
    try { x = JSON.parse(x || "[]"); } catch { return []; }
  }
  return Array.isArray(x) ? x.filter((e) => e !== null && e !== "") : [];
};
/** Needs Assessment of a PP ID is open when it has neither a BID nor an observation. */
const isOpen = (na) => !na || (idsOf(na.benchmarkIds).length === 0 && idsOf(na.bIds).length === 0 && !String(na.observation ?? "").trim());
const capsuleIC = (ic) => {
  const m = String(ic || "").match(/(\d)R(\d)P/);
  return m ? Number(m[1]) : num(ic);
};
const staffName = (s) => `${s?.lastName ?? "-"}, ${s?.firstName ?? "-"}`;
const staffNames = (assignments = []) => {
  const pad = (arr) => Array.from({ length: 3 }, (_, i) => arr[i] ?? "-");
  return {
    leaders: pad(assignments.filter((s) => s.roleType === "Leader").map((s) => staffName(s.staff))),
    assessors: pad(assignments.filter((s) => s.roleType === "Assessor").map((s) => staffName(s.staff))),
  };
};
const leaderCount = (assignments = []) => assignments.filter((s) => s.roleType === "Leader").length;
const positivePpCount = (ppIds) => new Set(ppIds.map(Number).filter((p) => p > 0)).size;

/** Preliminary alert rows: [[name, id], …] of the entities that meet each condition. */
function preliminary(entities) {
  const pick = (test) => entities.filter(test).map((e) => [e.name, e.code]);
  return {
    // Candidate-to-Leader Ratio > 20 (Rick, Issue 01); no leader at all with candidates = no ratio limit → listed
    CTL20: pick((e) => e.candidates > 0 && (e.leaders === 0 || e.candidates / e.leaders > 20)),
    BC10: pick((e) => e.benchmarks <= 10),
    AB8: pick((e) => e.blocks <= 8),
    total: entities.length,
  };
}

/**
 * Section resolver shared by units and capsules.
 * people: [{ row: [last, first, id], value(key) → number|null, attendance, open, negative, failed, missing, params[] }]
 */
function resolver({ prelim, people, leaders, threshold }) {
  const cmp = (op, v, t) => (op === ">" ? v > t : op === "≤" ? v <= t : v < t);
  return ({ key, op, fixed }) => {
    if (key === "CTL20" || key === "BC10" || key === "AB8") return { threshold: null, rows: prelim[key] };
    if (key === "ATTENDANCE") return { threshold: null, rows: people.filter((p) => p.attendance !== null && p.attendance < (fixed ?? 0.9)).map((p) => p.row) };
    if (key === "OPEN_NEEDS") return { threshold: null, rows: people.filter((p) => p.open).map((p) => p.row) };
    if (key === "NEG_CANDIDATE_MARKS") return { threshold: null, rows: people.filter((p) => p.negative).map((p) => p.row) };
    if (key === "NEG_LEADER_MARKS") return { threshold: null, rows: leaders };
    if (key === "FAILED") return { threshold: null, rows: people.filter((p) => p.failed).map((p) => p.row) };
    if (key === "MISSING") return { threshold: null, rows: people.filter((p) => p.missing).map((p) => p.row) };
    if (key.startsWith("PARAM_")) {
      const i = Number(key.slice(6)) - 1;
      return {
        threshold: null,
        rows: people.filter((p) => num(p.params?.[i]) !== null && fixed !== null && cmp(op, num(p.params[i]), fixed))
          .map((p) => [...p.row, n3(p.params[i])]),
      };
    }
    const base = key.replace(/^CUM_/, "");
    const t = fixed ?? num(threshold(base));
    if (t === null) return { threshold: "-", rows: [] };
    const fmt = base === "IC" ? n2 : n3;
    return {
      threshold: n3(t), // also fills a "0.XXX" on the count line when the title has a number
      rows: people.map((p) => ({ p, v: num(p.value(key)) }))
        .filter(({ v }) => v !== null && cmp(op, v, t))
        .map(({ p, v }) => [...p.row, fmt(v)]),
    };
  };
}

/** Leaders with a negative leader mark: [[last, first, staff id], …] (once per leader). */
function negativeLeaders(marks, assignments) {
  const seen = new Set();
  const rows = [];
  marks.filter((m) => m.impactType === "Negative").forEach((m) => {
    const a = assignments.find((s) => String(s.id) === String(m.staffLookupId));
    const key = a ? String(a.id) : `mark-${m.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push([a?.staff?.lastName ?? "-", a?.staff?.firstName ?? "-", a?.staff?.staffId ?? "-"]);
  });
  return rows;
}

// ---------------------------------------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------------------------------------

/** All units of the client with their report data (one API call; reused for every unit file). */
export async function loadUnitAuditContext(clientId) {
  const res = clientId ? await getDataReportByClient(clientId) : { units: [] };
  const units = (res?.units || []).filter((u) => UNIT_TEMPLATES[u.unitType]);
  const entities = units.map((u) => ({
    name: u.unitName, code: u.unitId,
    candidates: (u.rosterCandidates?.length ? u.rosterCandidates : u.candidates || []).length,
    leaders: leaderCount(u.staffAssignments),
    benchmarks: (u.benchmarks || []).length,
    blocks: positivePpCount((u.candidates || []).flatMap((c) => (c.pps || []).map((p) => p.ppId))),
  }));
  return { units, prelim: preliminary(entities) };
}

function unitPeople(unit) {
  const comps = UNIT_COMPETENCIES[unit.unitType] || [];
  return (unit.candidates || []).map((c) => {
    const avg = c.competencyAverages?.[0] || {};
    const cum = c.competencyCumalative?.[0] || {};
    const roster = c.roster?.[0] || {};
    const total = num(roster.totalTally) ?? ["presentCount", "excusedAbsences", "unexcusedAbsences", "excusedTardies", "unexcusedTardies"]
      .reduce((t, k) => t + (num(roster[k]) || 0), 0);
    const pps = (c.pps || []).map((p) => Number(p.ppId));
    const needs = new Map((c.needAssessments || []).map((n) => [Number(n.ppId), n]));
    const scores = c.scores || [];
    const missing = !pps.length || pps.some((pp) => comps.some((comp) => !scores.some((s) => Number(s.ppId) === pp && s.competency === comp)));
    const value = (key) => {
      const k = key.replace(/Δ/g, "Δ");
      if (k === "IC") return avg.IC ? getICValue(unit.unitType, unit.signatureProfile, avg.IC) : null;
      if (k === "ΔGEQ") return avg.GEQ;
      if (k.startsWith("CUM_Δ")) return cum[`delta${k.slice(5)}`];
      if (k.startsWith("Δ")) return avg[`delta${k.slice(1)}`];
      if (k.startsWith("PROD_")) return avg[`Productivity_${k.slice(5)}`];
      return avg[k];
    };
    return {
      row: [c.lastName, c.firstName, c.candidateId ?? c.candidateCode],
      value,
      attendance: total ? (num(roster.presentCount) || 0) / total : null,
      open: pps.some((pp) => isOpen(needs.get(pp))),
      negative: (c.candidateMarks || []).some((m) => m.impactType === "Negative"),
      failed: roster.unitOutcome === "Fail",
      missing,
      params: c.effectivity?.average?.parameters || [],
    };
  });
}

/** Audit file of one unit. ctx: loadUnitAuditContext(clientId) (loaded when not given). */
export async function buildUnitAudit(unitDbId, ctx = null) {
  const context = ctx || await loadUnitAuditContext(typeof window === "undefined" ? null : window.sessionStorage.getItem("activeClientId"));
  const unit = context.units.find((u) => String(u.id) === String(unitDbId));
  if (!unit) throw new Error("Unit not found for the audit (only CICO, T&P and TPRM units have an audit template)");
  const { leaders, assessors } = staffNames(unit.staffAssignments);
  const rosterCount = (unit.rosterCandidates?.length ? unit.rosterCandidates : unit.candidates || []).length;
  const leaderMarks = (unit.candidates || []).flatMap((c) => c.leaderMarks || []);
  const uniqueMarks = [...new Map(leaderMarks.map((m) => [m.id ?? JSON.stringify(m), m])).values()];
  const values = {
    "Unit Name": unit.unitName, "Unit ID": unit.unitId, "Unit Start Date": unit.unitStartDate, "Unit End Date": unit.unitEndDate,
    "Signature Profile": unit.signatureProfile, "Unit Type": unit.unitType, "Unit Roster Count": rosterCount, Environment: unit.environment,
    ...Object.fromEntries(leaders.map((n, i) => [`Assigned Leader #${i + 1}`, n])),
    ...Object.fromEntries(assessors.map((n, i) => [`Assigned Assessor #${i + 1}`, n])),
    "Total Unit Count": context.prelim.total,
  };
  const resolve = resolver({
    prelim: context.prelim,
    people: unitPeople(unit),
    leaders: negativeLeaders(uniqueMarks, unit.staffAssignments || []),
    threshold: (key) => unit[key],
  });
  return fillAudit(UNIT_TEMPLATES[unit.unitType], { values, resolve }).text;
}

// ---------------------------------------------------------------------------------------------------------
// Capsules
// ---------------------------------------------------------------------------------------------------------

/** All capsules of the active client (capsule snapshot; reused for every capsule file). */
export async function loadCapsuleAuditContext() {
  const store = await loadCapsuleStore();
  const capsules = store.capsules || [];
  const entities = [];
  for (const c of capsules) {
    const roster = (store.rosters || []).filter((r) => String(r.capsuleId) === String(c.id));
    entities.push({
      name: c.capsuleName, code: c.capsuleId,
      candidates: new Set(roster.map((r) => String(r.candidateId))).size,
      leaders: leaderCount(c.staffAssignments),
      benchmarks: (c.benchmarks || []).length,
      blocks: positivePpCount((store.blocks || []).filter((b) => String(b.capsuleId) === String(c.id)).map((b) => b.ppId)),
    });
  }
  return { store, prelim: preliminary(entities) };
}

/** Audit file of one capsule. ctx: loadCapsuleAuditContext() (loaded when not given). */
export async function buildCapsuleAudit(capsuleId, ctx = null) {
  const { store, prelim } = ctx || await loadCapsuleAuditContext();
  const capsule = await getCapsuleAsUnit(capsuleId);
  const th = thresholdsOf(capsule);
  const candidates = await getCapsuleCandidates(capsule.id);
  const rosters = await getCapsuleRosterByCapsuleId(capsule.id);
  const ids = candidates.map((c) => c.id);
  const summary = ids.length
    ? await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: ids.join(",") })
    : { averages: [], cumulativeSums: [] };
  const eff = ids.length ? await getUnitEffectivity(capsule.id, ids).catch(() => null) : null;
  const mine = (list) => (list || []).filter((x) => String(x.unitId ?? x.capsuleId) === String(capsule.id));
  const blocks = (store.blocks || []).filter((b) => String(b.capsuleId) === String(capsule.id));
  const scores = (store.scores || []).filter((s) => String(s.capsuleId) === String(capsule.id));
  const needs = mine(store.auxNeedAssessments);
  const marks = mine(store.auxCandidateMarks);
  const capacities = capacitiesOf(capsule.capsuleType).map((c) => c.name);

  const people = candidates.map((c) => {
    const avg = (summary.averages || []).find((a) => String(a.candidateId) === String(c.id)) || {};
    const cum = (summary.cumulativeSums || []).find((a) => String(a.candidateId) === String(c.id)) || {};
    const roster = rosters.find((r) => String(r.candidateId) === String(c.id)) || {};
    const total = ["presentCount", "excusedAbsences", "unexcusedAbsences", "excusedTardies", "unexcusedTardies"].reduce((t, k) => t + (num(roster[k]) || 0), 0);
    const pps = blocks.filter((b) => String(b.candidate_id) === String(c.id)).map((b) => Number(b.ppId));
    const mineScores = scores.filter((s) => String(s.candidate_id) === String(c.id));
    const naOf = (pp) => needs.find((n) => String(n.candidateId) === String(c.id) && Number(n.ppId) === pp);
    const value = (key) => {
      if (key === "IC") return capsuleIC(avg.IC);
      if (key === "ΔGEQ") return avg.GEQ;
      if (key.startsWith("CUM_ΔPC")) return cum[`dPC${key.slice(7)}`];
      if (key.startsWith("ΔPC")) return avg[`dPC${key.slice(3)}`];
      if (key.startsWith("PROD_")) return avg[`Productivity_${key.slice(5)}`];
      return avg[key];
    };
    return {
      row: [c.lastName, c.firstName, c.candidateId],
      value,
      attendance: total ? (num(roster.presentCount) || 0) / total : null,
      open: pps.some((pp) => isOpen(naOf(pp))),
      negative: marks.some((m) => String(m.candidateId) === String(c.id) && m.impactType === "Negative"),
      failed: (c.capsuleOutcome ?? roster.capsuleOutcome) === "Fail",
      missing: !pps.length || pps.some((pp) => capacities.some((cap) => !mineScores.some((s) => Number(s.ppId) === pp && s.capacity === cap))),
      params: (eff?.candidates || []).find((e) => String(e.candidateId) === String(c.id))?.average?.parameters || [],
    };
  });

  const { leaders, assessors } = staffNames(capsule.staffAssignments);
  const values = {
    "Capsule Name": capsule.capsuleName, "Capsule ID": capsule.capsuleId,
    "Capsule Start Date": capsule.capsuleStartDate, "Capsule End Date": capsule.capsuleEndDate,
    "Signature Profile": capsule.signatureProfile, "Capsule Type": capsule.capsuleType,
    "Capsule Roster Count": candidates.length, Environment: capsule.environment,
    ...Object.fromEntries(leaders.map((n, i) => [`Assigned Leader #${i + 1}`, n])),
    ...Object.fromEntries(assessors.map((n, i) => [`Assigned Assessor #${i + 1}`, n])),
    "Total Capsule Count": prelim.total,
  };
  const resolve = resolver({
    prelim,
    people,
    leaders: negativeLeaders(mine(store.auxLeaderMarks), capsule.staffAssignments || []),
    threshold: (key) => th[key],
  });
  const template = capsule.capsuleType === CAPSULE_COMBINED ? AUDIT_CAPSULE_COMBINED : AUDIT_CAPSULE_ISOLATED;
  return fillAudit(template, { values, resolve }).text;
}

export const listUnits = (clientId) => getAllUnits(clientId);
export const listCapsules = () => getAllCapsules();

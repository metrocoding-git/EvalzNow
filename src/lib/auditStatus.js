/**
 * Audit Status (Capacity_Part18) – one .ez file per Unit / Capsule.
 *
 * PROVISIONAL: Rick will provide the Audit Templates. Until then each file lists the set-up completeness
 * checks of the unit / capsule (details, thresholds, staff, benchmarks, roster, assessment blocks, scores,
 * needs-assessment status) in the .ez report layout. File name: Audit_<Name>_<ID>.ez
 */
import { finalize, headerLines, isoDate, kv, n3, sectionBanner, subHeader, table, text } from "@/app/dashboard/analytics-view/data-reports/helper/reportFormat";
import { getAllUnits, getUnitById } from "@/services/unitService";
import { getUniRostertByUnitId } from "@/services/unitRosterService";
import { getAllCapsules, getCapsuleById, getCapsuleRosterByCapsuleId, loadCapsuleStore } from "@/services/capsuleService";
import { thresholdsOf } from "@/app/dashboard/control-view/capsule/capsuleConfig";

const W = { indent: 2, width: 37 };
const status = (ok) => (ok ? "COMPLETE" : "INCOMPLETE");
const safeName = (v) => String(v || "-").replace(/[\\/:*?"<>|]/g, "_");
export const auditFileName = (name, id) => `Audit_${safeName(name)}_${safeName(id)}.ez`;

function checksBlock(checks) {
  const done = checks.filter((c) => c.ok).length;
  return [
    table(["CHECK", "STATUS", "DETAIL"], checks.map((c) => [c.label, status(c.ok), c.detail])),
    kv("Audit Completion", `${done} / ${checks.length}  (${n3(checks.length ? done / checks.length : 0)})`),
    kv("Audit Status", done === checks.length ? "PASSED" : "OPEN ITEMS"),
    "",
  ];
}

function document(level, details, checks, extra = []) {
  return finalize([
    headerLines(`${level} Audit`), "",
    sectionBanner(1), "",
    subHeader(`${level.toUpperCase()} DETAILS :`),
    ...details.map(([l, v]) => kv(l, text(v), W)), "",
    sectionBanner(2), "",
    subHeader("AUDIT STATUS:"),
    checksBlock(checks),
    ...extra,
  ]);
}

/** Audit of one capsule (browser capsule store). */
export async function buildCapsuleAudit(capsuleId) {
  const capsule = await getCapsuleById(capsuleId);
  const store = loadCapsuleStore();
  const roster = await getCapsuleRosterByCapsuleId(capsule.id);
  const candidateIds = [...new Set(roster.map((r) => String(r.candidateId)))];
  const th = thresholdsOf(capsule);
  const staff = capsule.staffAssignments || [];
  const blocks = store.blocks.filter((b) => String(b.capsuleId) === String(capsule.id));
  const scores = store.scores.filter((s) => String(s.capsuleId) === String(capsule.id));
  const withBlocks = candidateIds.filter((id) => blocks.some((b) => String(b.candidate_id) === id)).length;
  const withScores = candidateIds.filter((id) => scores.some((s) => String(s.candidate_id) === id)).length;
  const blocksWithoutScores = blocks.filter((b) => !scores.some((s) => String(s.blockId) === String(b.id))).length;
  const needs = (store.auxNeedAssessments || []).filter((n) => String(n.unitId) === String(capsule.id));
  const thresholdKeys = Object.keys(th);
  const missingTh = thresholdKeys.filter((k) => th[k] === null || th[k] === undefined || th[k] === "");

  const checks = [
    { label: "Capsule Details", ok: !!(capsule.capsuleName && capsule.capsuleId && capsule.capsuleType && capsule.capsuleStartDate), detail: "Name, ID, Type, Start Date" },
    { label: "Thresholds", ok: missingTh.length === 0, detail: missingTh.length ? `Missing: ${missingTh.join(", ")}` : `${thresholdKeys.length} set` },
    { label: "Assigned Leader(s)", ok: staff.some((s) => s.roleType === "Leader"), detail: `${staff.filter((s) => s.roleType === "Leader").length}` },
    { label: "Assigned Assessor(s)", ok: staff.some((s) => s.roleType === "Assessor"), detail: `${staff.filter((s) => s.roleType === "Assessor").length}` },
    { label: "Benchmarks", ok: (capsule.benchmarks || []).length > 0, detail: `${(capsule.benchmarks || []).length}` },
    { label: "Capsule Roster", ok: candidateIds.length > 0, detail: `${candidateIds.length} candidate(s)` },
    { label: "Assessment Blocks", ok: candidateIds.length > 0 && withBlocks === candidateIds.length, detail: `${withBlocks} / ${candidateIds.length} candidates` },
    { label: "Insert Scores", ok: candidateIds.length > 0 && withScores === candidateIds.length && blocksWithoutScores === 0, detail: `${withScores} / ${candidateIds.length} candidates, ${blocksWithoutScores} block(s) without scores` },
    { label: "Capsule Outcomes", ok: roster.length > 0 && roster.every((r) => r.capsuleOutcome), detail: `${roster.filter((r) => r.capsuleOutcome).length} / ${roster.length}` },
  ];
  const closed = needs.filter((n) => String(n.observation || "").trim() && String(n.bIds ?? n.benchmarkIds ?? "[]").length > 2).length;
  return document("Capsule", [
    ["Capsule Name", capsule.capsuleName], ["Capsule ID", capsule.capsuleId], ["Capsule Type", capsule.capsuleType],
    ["Capsule Start Date", isoDate(capsule.capsuleStartDate)], ["Capsule End Date", isoDate(capsule.capsuleEndDate)],
    ["Signature Profile", capsule.signatureProfile], ["Environment", capsule.environment],
  ], checks, [
    subHeader("NEEDS ASSESSMENT STATUS:"),
    kv("Assessment Blocks", String(blocks.length)),
    kv("Needs Assessment Entries", String(needs.length)),
    kv("Closed Entries", String(closed)),
    kv("Pending Entries", String(needs.length - closed)),
    kv("Open (no entry)", String(Math.max(0, blocks.length - needs.length))),
  ]);
}

/** Audit of one unit (API data). */
export async function buildUnitAudit(unitDbId) {
  const unit = await getUnitById(unitDbId);
  const roster = await getUniRostertByUnitId(unitDbId).catch(() => []);
  const staff = unit.staffAssignments || unit.staffLookup || [];
  const thresholdKeys = ["XEP", "XCP", "XBP", "MSIP", "ΔGEQ", "ΔRRN", "ΔPRN"];
  const missingTh = thresholdKeys.filter((k) => unit[k] === null || unit[k] === undefined || unit[k] === "");
  const candidateCount = new Set((roster || []).map((r) => r.candidateId)).size;
  const checks = [
    { label: "Unit Details", ok: !!(unit.unitName && unit.unitId && unit.unitType && unit.unitStartDate), detail: "Name, ID, Type, Start Date" },
    { label: "Thresholds", ok: missingTh.length === 0, detail: missingTh.length ? `Missing: ${missingTh.join(", ")}` : "Set" },
    { label: "Assigned Leader(s)", ok: staff.some((s) => s.roleType === "Leader"), detail: `${staff.filter((s) => s.roleType === "Leader").length}` },
    { label: "Assigned Assessor(s)", ok: staff.some((s) => s.roleType === "Assessor"), detail: `${staff.filter((s) => s.roleType === "Assessor").length}` },
    { label: "Benchmarks", ok: (unit.benchmarks || []).length > 0, detail: `${(unit.benchmarks || []).length}` },
    { label: "Unit Roster", ok: candidateCount > 0, detail: `${candidateCount} candidate(s)` },
    { label: "Unit Outcomes", ok: (roster || []).length > 0 && roster.every((r) => r.unitOutcome), detail: `${(roster || []).filter((r) => r.unitOutcome).length} / ${(roster || []).length}` },
  ];
  return document("Unit", [
    ["Unit Name", unit.unitName], ["Unit ID", unit.unitId], ["Unit Type", unit.unitType],
    ["Unit Start Date", isoDate(unit.unitStartDate)], ["Unit End Date", isoDate(unit.unitEndDate)],
    ["Signature Profile", unit.signatureProfile], ["Environment", unit.environment],
  ], checks);
}

export const listUnits = (clientId) => getAllUnits(clientId);
export const listCapsules = () => getAllCapsules();

/**
 * Capsule answers for the server helpers the auxiliary controller calls (same req / res shapes).
 */
import { getCapsuleById, getCapsuleRosterByCapsuleId, getCapsuleScoresByCapsuleAndCandidate } from "@/services/capsuleService";
import { getCapsuleCandidates } from "@/services/capsuleAnalyticsService";

export { getPpCompetencyRatioMultipleCandidate } from "../distributions/capsuleControllerAdapters";

/** Same as evalznow-server src/utils/jsonIds.js */
export function toIdArray(value) {
  let v = value;
  for (let i = 0; i < 2 && typeof v === "string"; i++) {
    try { v = JSON.parse(v || "[]"); } catch { return []; }
  }
  return Array.isArray(v) ? v : [];
}

/** insertScore.controller getInsertScoresByUnitAndCandidate – insert scores with unit + candidate. */
export async function getInsertScoresByUnitAndCandidate(req, res) {
  const { unitId, candidate_id } = req.params;
  const [capsule, scores, candidates] = await Promise.all([
    getCapsuleById(unitId), getCapsuleScoresByCapsuleAndCandidate(unitId, candidate_id), getCapsuleCandidates(unitId),
  ]);
  const candidate = candidates.find((c) => String(c.id) === String(candidate_id)) || null;
  const unit = { id: capsule.id, unitName: capsule.capsuleName, unitStartDate: capsule.capsuleStartDate, unitType: "Third Parameter" };
  return res.status(200).json(scores.map((s) => ({
    ...s,
    unitId: capsule.id,
    assessmentBlockId: s.assessmentBlockId ?? s.blockId,
    candidate_id: s.candidate_id,
    candidate: candidate || s.candidate,
    unit,
    durationHrs: s.durationDays,
    remarks: s.taskDeclaration,
  })));
}

/** unitRoster.controller getUnitRostersByUnitIdAndCandidateId – roster rows (unitOutcome = capsule outcome). */
export async function getUnitRostersByUnitIdAndCandidateId(req, res) {
  const { unitId, candidateId } = req.params;
  const rows = await getCapsuleRosterByCapsuleId(unitId);
  return res.status(200).json(rows
    .filter((r) => String(r.candidateId) === String(candidateId))
    .map((r) => ({ ...r, unitId: r.capsuleId, unitOutcome: r.capsuleOutcome })));
}

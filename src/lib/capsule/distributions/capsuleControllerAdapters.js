/**
 * Browser stand-ins for the two server controller calls the distribution modules make,
 * answered from the capsule data (same request / response shapes as the server).
 */
import { getCapsuleAsUnit, getCapsuleSummaryForUnitScreens } from "@/services/capsuleAnalyticsService";

/** Stand-in for tabulationTable.controller getPpCompetencyRatioMultipleCandidate(req, res). */
export async function getPpCompetencyRatioMultipleCandidate(req, res) {
  try {
    const data = await getCapsuleSummaryForUnitScreens({ ...(req.query || {}) });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error computing capsule ratios", error: err.message });
  }
}

/** Stand-in for unit.controller getUnitById(req, res). */
export async function getUnitById(req, res) {
  try {
    const capsule = await getCapsuleAsUnit(req.params?.id);
    return res.status(200).json(capsule);
  } catch (err) {
    return res.status(404).json({ message: "Capsule not found" });
  }
}

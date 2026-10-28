/**
 * Which entity is open in Setup View / Analytics View: a Unit or a Capsule.
 *
 * Units keep using sessionStorage "selectedUnitId" (unchanged). Capsules use "selectedCapsuleId".
 * "activeEntityType" says which of the two was activated last; old sessions without it are units.
 */
const KEY = "activeEntityType";

const ss = () => (typeof window === "undefined" ? null : window.sessionStorage);

export function getActiveEntityType() {
  const s = ss();
  if (!s) return "unit";
  return s.getItem(KEY) === "capsule" && s.getItem("selectedCapsuleId") ? "capsule" : "unit";
}

export function isCapsuleActive() {
  return getActiveEntityType() === "capsule";
}

export function getActiveCapsuleId() {
  const s = ss();
  return s ? s.getItem("selectedCapsuleId") : null;
}

export function activateUnit(unitId) {
  const s = ss();
  if (!s) return;
  if (unitId !== undefined && unitId !== null) s.setItem("selectedUnitId", unitId);
  s.setItem(KEY, "unit");
}

export function activateCapsule(capsuleId) {
  const s = ss();
  if (!s) return;
  s.setItem("selectedCapsuleId", capsuleId);
  s.setItem(KEY, "capsule");
}

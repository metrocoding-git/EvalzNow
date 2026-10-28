/**
 * Staff names for capsule staff assignments (leaders / assessors) in the UI phase.
 * Capsules store only staff ids; names come from the client's staff list (real API).
 */
import { getAllStaffs } from "@/services/staffService";

let directory = [];
let loading = null;

export function getStaffDirectory() {
  return directory;
}

export function ensureStaffDirectory() {
  if (typeof window === "undefined") return Promise.resolve(directory);
  if (!loading) {
    loading = getAllStaffs(window.sessionStorage.getItem("activeClientId"))
      .then((list) => { directory = Array.isArray(list) ? list : []; return directory; })
      .catch(() => { loading = null; return directory; });
  }
  return loading;
}

/** staffAssignments with stable ids (capsuleId * 1000 + n) and staff details. */
export function enrichStaffAssignments(capsule) {
  return (capsule?.staffAssignments || []).map((s, i) => {
    const staffId = s.staffId ?? s.staff?.id;
    const staff = directory.find((x) => String(x.id) === String(staffId)) || s.staff || { id: staffId };
    return { ...s, id: s.id ?? Number(capsule.id) * 1000 + i + 1, staffId, staff };
  });
}

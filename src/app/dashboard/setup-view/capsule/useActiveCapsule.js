"use client";
import { useCallback, useEffect, useState } from "react";
import { getActiveCapsuleId } from "@/lib/activeEntity";
import { getCapsuleById, getCapsuleMarkerNames, getCapsuleRosterByCapsuleId } from "@/services/capsuleService";
import { CLINICAL_MARKERS } from "../../control-view/capsule/capsuleConfig";

/** Active capsule + its roster candidates + clinical marker names (custom CM89–CM100). */
export default function useActiveCapsule() {
  const [capsule, setCapsule] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [markerNames, setMarkerNames] = useState({});
  const [loading, setLoading] = useState(true);

  const reloadMarkers = useCallback(async (id) => {
    setMarkerNames(await getCapsuleMarkerNames(id));
  }, []);

  useEffect(() => {
    const id = getActiveCapsuleId();
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const [c, roster] = await Promise.all([getCapsuleById(id), getCapsuleRosterByCapsuleId(id)]);
        setCapsule(c);
        const seen = new Map();
        roster.forEach((r) => r.candidate && !seen.has(r.candidate.id) && seen.set(r.candidate.id, r.candidate));
        setCandidates([...seen.values()]);
        await reloadMarkers(id);
      } catch {
        setCapsule(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadMarkers]);

  const markerName = useCallback(
    (i) => (markerNames[i] && String(markerNames[i]).trim()) || CLINICAL_MARKERS[i - 1],
    [markerNames]
  );

  return { capsule, candidates, markerNames, markerName, reloadMarkers, loading };
}

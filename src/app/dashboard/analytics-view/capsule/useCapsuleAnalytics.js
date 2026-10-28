"use client";
import { useCallback, useEffect, useState } from "react";
import { getActiveCapsuleId } from "@/lib/activeEntity";
import { getCapsuleById } from "@/services/capsuleService";
import { getCapsuleCandidates, getCapsuleMultipleCandidateSummary, getCapsuleThresholds } from "@/services/capsuleAnalyticsService";

export const EMPTY_FILTERS = { ppIdFrom: "", ppIdTo: "", criticalDateFrom: "", criticalDateTo: "", thresholdEnabled: false };

/**
 * State shared by the capsule analytics screens: active capsule, its candidates, Candidate / Capsule level,
 * the selected candidate(s), the Secondary Input Area filters and the computed tabulation data.
 */
export default function useCapsuleAnalytics({ defaultLevel = "candidate" } = {}) {
  const [capsule, setCapsule] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [level, setLevel] = useState(defaultLevel);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [resetSignal, setResetSignal] = useState(0);
  const [data, setData] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = getActiveCapsuleId();
    if (!id) { setLoading(false); setReady(true); return; }
    (async () => {
      try {
        const [c, list, th] = await Promise.all([getCapsuleById(id), getCapsuleCandidates(id), getCapsuleThresholds(id)]);
        setCapsule(c);
        const sorted = [...list].sort((a, b) => String(a.lastName || "").localeCompare(String(b.lastName || "")));
        setCandidates(sorted);
        setThresholds(th);
        setActiveCandidateId(sorted[0]?.id ?? null);
      } catch {
        setCapsule(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const candidateParam = level === "capsule" ? selectedCandidateIds.join(",") : activeCandidateId;

  useEffect(() => {
    if (!capsule || !candidateParam) { setData({ results: [] }); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    getCapsuleMultipleCandidateSummary({
      capsuleId: capsule.id,
      candidate_id: candidateParam,
      ppIdFrom: filters.ppIdFrom === "" ? undefined : filters.ppIdFrom,
      ppIdTo: filters.ppIdTo === "" ? undefined : filters.ppIdTo,
      criticalRefDateFrom: filters.criticalDateFrom || undefined,
      criticalRefDateTo: filters.criticalDateTo || undefined,
    })
      .then((d) => alive && setData(d))
      .catch(() => alive && setData({ results: [] }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [capsule, candidateParam, filters]);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setResetSignal((n) => n + 1);
  }, []);

  const toggleCandidate = useCallback((id, checked) => {
    setSelectedCandidateIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }, []);

  return {
    capsule, candidates, thresholds, level, setLevel, activeCandidateId, setActiveCandidateId,
    selectedCandidateIds, toggleCandidate, filters, setFilters, resetFilters, resetSignal, data, loading, ready,
    activeCandidate: candidates.find((c) => c.id === activeCandidateId) || null,
  };
}

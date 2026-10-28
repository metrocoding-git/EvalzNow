"use client";
import React, { useEffect, useState } from "react";
import CapsuleAnalyticsShell from "../CapsuleAnalyticsShell";
import PlotSelections from "./PlotSelections";
import { getEffectivityOptions } from "@/services/capsuleEffectivityService";

function EffectivityBody({ ctx }) {
  const { capsule, candidates, level, activeCandidateId, selectedCandidateIds, filters, resetFilters } = ctx;
  const [options, setOptions] = useState(null);
  useEffect(() => { getEffectivityOptions().then(setOptions); }, []);
  const capsuleLevel = level === "capsule";
  if (!activeCandidateId) return null;
  return (
    <PlotSelections
      selectedSort={capsuleLevel ? "activateUnitLevel" : "activateCandidateLevel"}
      unitId={capsule.id}
      unitType={capsule.capsuleType}
      candidateId={capsuleLevel ? selectedCandidateIds : activeCandidateId}
      candidates={candidates}
      filters={filters}
      options={options}
      onResetFilters={resetFilters}
    />
  );
}

/** Analytics View → Effectivity Add-on for the active capsule (Capacity_Part14a / 14b). */
export default function CapsuleEffectivity() {
  return (
    <CapsuleAnalyticsShell>
      {(ctx) => <EffectivityBody ctx={ctx} />}
    </CapsuleAnalyticsShell>
  );
}

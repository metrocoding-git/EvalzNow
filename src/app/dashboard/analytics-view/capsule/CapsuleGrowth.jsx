"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CapsuleAnalyticsShell from "./CapsuleAnalyticsShell";
import PlotPanel from "./PlotPanel";
import CapsuleProjectionTable from "./CapsuleProjectionTable";
import { PPTables, SeriesChart, SharePie, splitPP, stabilitySlices } from "./charts";
import { GrowthProjectionChart } from "../growth-metrics/components/ProjectionGraph";
import { calculateProjectionValues } from "../growth-metrics/components/PlotSelections";
import { getCapsuleProjection } from "@/services/capsuleService";

/** Growth entities (Capacity_Part9). Growth charts use positive PP IDs and start at 0. */
export function growthEntities(level) {
  if (level === "capsule") {
    return [
      { name: "Equivalent Growth Differentials (ΔGEQ)", key: "GEQ", type: "scatter", x: "days" },
      { name: "Principal 1 Growth Differentials (ΔPC1)", key: "dPC1", type: "scatter", x: "days" },
      { name: "Principal 2 Growth Differentials (ΔPC2)", key: "dPC2", type: "scatter", x: "days" },
      { name: "Principal 3 Growth Differentials (ΔPC3)", key: "dPC3", type: "scatter", x: "days" },
      { name: "Performance Ratio (PC1)", key: "PC1", type: "scatter", x: "days" },
      { name: "Performance Ratio (PC2)", key: "PC2", type: "scatter", x: "days" },
      { name: "Performance Ratio (PC3)", key: "PC3", type: "scatter", x: "days" },
      { name: "Stability in Growth (STA-G)", key: "STAG", type: "pie" },
    ];
  }
  return [
    { name: "Equivalent Growth Differentials (ΔGEQ)", key: "GEQ", type: "line", x: "days" },
    { name: "Principal 1 Growth Differentials (ΔPC1)", key: "dPC1", type: "line", x: "days" },
    { name: "Principal 2 Growth Differentials (ΔPC2)", key: "dPC2", type: "line", x: "days" },
    { name: "Principal 3 Growth Differentials (ΔPC3)", key: "dPC3", type: "line", x: "days" },
    { name: "Performance Ratio (PC1)", key: "PC1", type: "line", x: "days" },
    { name: "Performance Ratio (PC2)", key: "PC2", type: "line", x: "days" },
    { name: "Performance Ratio (PC3)", key: "PC3", type: "line", x: "days" },
    { name: "Stability in Growth (STA-G)", key: "STAG", type: "pie" },
    ...[1, 2, 3, 4, 5].flatMap((n) => [1, 2, 3].map((p) => ({
      name: `Growth Target ${n} Trends - PC${p}`, key: `PC${p}GT${n}`, type: "line", x: "pp",
    }))),
    { name: "Growth Projections - ∆PC1", key: "dPC1", type: "line", projection: "deltaRRN" },
    { name: "Growth Projections - ∆PC2", key: "dPC2", type: "line", projection: "deltaPRN" },
    { name: "Growth Projections - ∆PC3", key: "dPC3", type: "line", projection: "deltaARN" },
  ];
}

/** Projection curves from the saved Projection Table session (same as unit Growth Metrics). */
function projectionCurves(points) {
  const sel = ["First PP Selection", "Second PP Selection", "Third PP Selection"]
    .map((c) => points.find((p) => p.callout === c)).filter(Boolean);
  if (sel.length !== 3) return null;
  const [x1, x2, x3] = sel.map((m) => Number(m.dayCount));
  const x4 = x3 + 31;
  const curve = (k) => {
    const [y1, y2, y3] = sel.map((m) => parseFloat(m[k]));
    return calculateProjectionValues(y1, y2, y3, 0, x1, x2, x3, x4).map((item) => {
      const xValue = item.i || item.j || item.k;
      return {
        dayCount: Number(xValue.toFixed(3)), originalX: xValue,
        l: item.l1 || item.l2 || item.l3 || 0, s: item.s1 || item.s2 || item.s3 || 0,
      };
    });
  };
  return { deltaRRN: curve("deltaRRN"), deltaPRN: curve("deltaPRN"), deltaARN: curve("deltaARN"), thirdDay: x3 };
}

function GrowthBody({ ctx }) {
  const { capsule, level, data, thresholds, filters, resetFilters, activeCandidateId } = ctx;
  const results = data.results || [];
  const entities = useMemo(() => growthEntities(level), [level]);
  const [projection, setProjection] = useState(null);
  const [showProjectionTable, setShowProjectionTable] = useState(false);
  const [tabResetSignal, setTabResetSignal] = useState(0);

  const loadProjection = useCallback(async () => {
    if (!capsule || !activeCandidateId) { setProjection(null); return; }
    const sessions = await getCapsuleProjection(capsule.id, activeCandidateId);
    setProjection(sessions[0]?.points ? projectionCurves(sessions[0].points) : null);
  }, [capsule, activeCandidateId]);
  useEffect(() => { loadProjection(); }, [loadProjection]);

  const xKey = (e) => (e.x === "pp" ? "ppId" : "cumulativeDuration");
  const thresholdOf = (e) => {
    if (!filters.thresholdEnabled) return null;
    if (e.key?.includes("GT")) return 0.7;
    return thresholds?.[e.key] ?? null;
  };

  const renderChart = (e, p) => {
    if (e.type === "pie") return <SharePie entity={e} slices={stabilitySlices(results, "STAG")} />;
    if (e.projection) {
      if (!projection) {
        return <div className="flex justify-center h-full text-gray-400 text-sm italic py-8">NO PROJECTION SAVED – USE THE PROJECTIONS TAB</div>;
      }
      return (
        <div className="flex flex-col h-full p-2 bg-white">
          <h2 className="text-lg font-semibold mb-2 text-center">🔵 {e.name}</h2>
          <div className="flex-1 flex items-center justify-center">
            <GrowthProjectionChart data={projection[e.projection]} thirdPPDayCount={projection.thirdDay} title={e.name} properties={p} />
          </div>
        </div>
      );
    }
    const days = e.x !== "pp";
    return (
      <SeriesChart
        entity={e}
        series={splitPP(results, e.key, xKey(e))}
        props={p}
        threshold={thresholdOf(e)}
        scatter={e.type === "scatter"}
        xLabel={days ? "Days" : "PP ID"}
        showNegative={false}
        startAtZero={days}
      />
    );
  };

  const renderTable = (e) => {
    if (e.type === "pie" || e.projection) return null;
    const label = e.name.match(/\(([^)]+)\)/)?.[1] || e.key;
    return <PPTables series={splitPP(results, e.key, xKey(e))} valueLabel={label} xLabel={e.x === "pp" ? null : "Day Count"} showNegative={false} />;
  };

  const projectionData = results.filter((r) => r.ppId > 0).map((r) => ({
    ppId: r.ppId, RR: r.PC1, PR: r.PC2, AR: r.PC3, IC: r.IC, "ΔRR": r.dPC1, "ΔPR": r.dPC2, "ΔAR": r.dPC3, dayCount: r.cumulativeDuration,
  }));

  return (
    <>
      <PlotPanel
        entities={entities}
        renderChart={renderChart}
        renderTable={renderTable}
        onReset={resetFilters}
        level={level}
        // Same as the unit Growth Metrics: clicking "Projections" opens the Projection Table directly
        extraTabs={level === "candidate" ? [{ label: "Projections", onSelect: () => setShowProjectionTable(true) }] : []}
        tabResetSignal={tabResetSignal}
      />
      {showProjectionTable && <CapsuleProjectionTable
        visible
        unitId={capsule.id}
        candidateId={activeCandidateId}
        projectionData={projectionData}
        unitType="Third Parameter"
        signatureProfile={capsule.signatureProfile}
        onRefreshProjections={loadProjection}
        onClose={() => { setShowProjectionTable(false); setTabResetSignal((n) => n + 1); }}
      />}
    </>
  );
}

/** Cumulative / Average growth fields for PC1–PC3 (Candidate Level, as on the unit side). */
function GrowthSummaryFields({ ctx }) {
  if (ctx.level !== "candidate") return null;
  const sum = ctx.data.cumulativeSums?.[0] || {};
  const avg = ctx.data.cumulativeAverages?.[0] || {};
  const f = (v) => (v === null || v === undefined ? (0).toFixed(3) : Number(v).toFixed(3));
  return (
    <div className="mt-2 flex flex-col gap-3">
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
          <div>
            <strong>Cumulative Growth For Principal {n} Ratio:</strong>
            <input readOnly value={f(sum[`dPC${n}`])} className="border px-2 py-1 w-full" />
          </div>
          <div>
            <strong>Average Growth For Principal {n} Ratio:</strong>
            <input readOnly value={f(avg[`dPC${n}`])} className="border px-2 py-1 w-full" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Analytics View → Growth Metrics for the active capsule (Capacity_Part9). */
export default function CapsuleGrowth() {
  return (
    <CapsuleAnalyticsShell secondary={{ extra: (_v, _set, ctx) => <GrowthSummaryFields ctx={ctx} /> }}>
      {(ctx) => <GrowthBody ctx={ctx} />}
    </CapsuleAnalyticsShell>
  );
}

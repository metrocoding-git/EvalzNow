"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Label, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CapsuleAnalyticsShell from "./CapsuleAnalyticsShell";
import PlotPanel from "./PlotPanel";
import { ChartTitle, Dot, SharePie } from "./charts";
import { getCapsuleMarkerNames, getCapsuleScoresByCapsuleAndCandidate } from "@/services/capsuleService";
import { CLINICAL_MARKERS, capacitiesOf } from "../../control-view/capsule/capsuleConfig";

const YES_NO_COLORS = { Yes: "#10b981", No: "#ef4444" };
const n2 = (v) => (v === null || v === undefined ? "-" : Number(v).toFixed(2));

/** Per PP ID totals of one capacity: attained / maximum score and number of insert-score rows. */
function capacityTotals(scores, capacityName) {
  const map = new Map();
  scores.filter((s) => s.capacity === capacityName).forEach((s) => {
    const pp = Number(s.ppId);
    const t = map.get(pp) || { ppId: pp, rows: 0, a: 0, m: 0 };
    t.rows += 1;
    t.a += Number(s.attainedScore) || 0;
    t.m += Number(s.maxScore) || 0;
    map.set(pp, t);
  });
  return [...map.values()];
}

function filterScores(scores, f) {
  return scores.filter((s) => {
    const pp = Number(s.ppId);
    if (f.ppIdFrom !== "" && f.ppIdFrom != null && pp < Number(f.ppIdFrom)) return false;
    if (f.ppIdTo !== "" && f.ppIdTo != null && pp > Number(f.ppIdTo)) return false;
    const d = String(s.criticalRefDate || "").slice(0, 10);
    if (f.criticalDateFrom && d < f.criticalDateFrom) return false;
    if (f.criticalDateTo && d > f.criticalDateTo) return false;
    return true;
  });
}

function ScoresChart({ entity, totals, code, label, p }) {
  const neg = totals.filter((t) => t.ppId < 0).sort((a, b) => b.ppId - a.ppId);
  const pos = totals.filter((t) => t.ppId > 0).sort((a, b) => a.ppId - b.ppId);
  const lines = [
    { name: `Negative PP ID: A${code}`, data: neg.map((t) => ({ x: t.ppId, value: t.a })), color: "#ef4444" },
    { name: `Negative PP ID: M${code}`, data: neg.map((t) => ({ x: t.ppId, value: t.m })), color: "#f59e0b" },
    { name: `Positive PP ID: A${code}`, data: pos.map((t) => ({ x: t.ppId, value: t.a })), color: "#10b981" },
    { name: `Positive PP ID: M${code}`, data: pos.map((t) => ({ x: t.ppId, value: t.m })), color: "#3b82f6" },
  ];
  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: p.shadeArea }}>
      <ChartTitle entity={entity} />
      <div className="w-full h-[68vh] flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={["auto", "auto"]} allowDecimals={false}>
              {(p.showLabel || p.labelType !== "X Type") && <Label value="PP ID" position="insideBottom" offset={-10} />}
            </XAxis>
            <YAxis type="number" dataKey="value" domain={[0, "auto"]}>
              {(p.showLabel || p.labelType !== "Y Type") && <Label value={`${label} Score`} angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />}
            </YAxis>
            <Tooltip formatter={(v) => n2(v)} labelFormatter={(x) => `PP ID: ${x}`} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
            {lines.map((l) => (
              <Line key={l.name} name={l.name} data={l.data} dataKey="value" type="linear" stroke={l.color} strokeWidth={p.lineThickness}
                dot={(dp) => Dot(dp, l.color, p)} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ScoringTrendsBody({ ctx }) {
  const { capsule, activeCandidateId, filters, resetFilters } = ctx;
  const [scores, setScores] = useState([]);
  const [markerNames, setMarkerNames] = useState({});

  useEffect(() => {
    if (!capsule || !activeCandidateId) { setScores([]); return; }
    getCapsuleScoresByCapsuleAndCandidate(capsule.id, activeCandidateId).then(setScores);
  }, [capsule, activeCandidateId]);
  useEffect(() => { if (capsule) getCapsuleMarkerNames(capsule.id).then(setMarkerNames); }, [capsule]);

  const rows = useMemo(() => filterScores(scores, filters), [scores, filters]);
  const capacities = capacitiesOf(capsule?.capsuleType);

  const entities = useMemo(() => [
    ...CLINICAL_MARKERS.map((n, i) => ({
      name: `${(markerNames[i + 1] || "").trim() || n} (CM${i + 1})`, type: "pie", marker: i, displayId: i + 1,
    })),
    ...capacities.map((c, i) => ({
      name: `${c.name} Scores vs PP ID`, type: "line", capacity: c, displayId: 101 + i,
    })),
  ], [markerNames, capacities]);

  const renderChart = (e, p) => {
    if (e.type === "pie") {
      const yes = rows.filter((r) => (r.nm || [])[e.marker] === "Yes").length;
      return <SharePie entity={e} slices={[
        { name: "Yes", count: yes, color: YES_NO_COLORS.Yes },
        { name: "No", count: rows.length - yes, color: YES_NO_COLORS.No },
      ]} />;
    }
    return <ScoresChart entity={e} totals={capacityTotals(rows, e.capacity.name)} code={e.capacity.code} label={e.capacity.name} p={p} />;
  };

  const renderTable = (e) => {
    if (e.type === "pie") return null;
    const totals = capacityTotals(rows, e.capacity.name);
    const code = e.capacity.code;
    const table = (title, list) => (
      <div>
        <h3 className="text-gray-600 font-semibold mb-2 ml-2">{title}</h3>
        <table className="text-xs border border-gray-300" style={{ width: "max-content", minWidth: "100%" }}>
          <thead className="bg-gray-100">
            <tr>{["PP ID", "Row Count", `A${code}`, `M${code}`].map((h) => <th key={h} className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.length ? list.map((t) => (
              <tr key={t.ppId} className="hover:bg-blue-50">
                <td className="text-center border border-gray-300 px-2 py-1">{t.ppId}</td>
                <td className="text-center border border-gray-300 px-2 py-1">{t.rows}</td>
                <td className="text-center border border-gray-300 px-2 py-1">{n2(t.a)}</td>
                <td className="text-center border border-gray-300 px-2 py-1">{n2(t.m)}</td>
              </tr>
            )) : <tr><td colSpan={4} className="text-center text-gray-500 border border-gray-300 px-2 py-1">NO DATA AVAILABLE</td></tr>}
          </tbody>
        </table>
      </div>
    );
    return (
      <>
        {table("Positive PP IDs", totals.filter((t) => t.ppId > 0).sort((a, b) => a.ppId - b.ppId))}
        {table("Negative PP IDs", totals.filter((t) => t.ppId < 0).sort((a, b) => b.ppId - a.ppId))}
      </>
    );
  };

  return (
    <PlotPanel entities={entities} renderChart={renderChart} renderTable={renderTable} onReset={resetFilters} level="candidate" />
  );
}

/** Analytics View → Scoring Trends for the active capsule (Capacity_Part6). */
export default function CapsuleScoringTrends() {
  return (
    <CapsuleAnalyticsShell levels={false} secondary={{ thresholds: false }}>
      {(ctx) => <ScoringTrendsBody ctx={ctx} />}
    </CapsuleAnalyticsShell>
  );
}

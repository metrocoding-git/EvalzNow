"use client";
import React, { useMemo } from "react";
import {
  CartesianGrid, Label, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import CapsuleAnalyticsShell from "./CapsuleAnalyticsShell";
import PlotPanel from "./PlotPanel";
import { ChartTitle, Dot, PPTables, SeriesChart, SharePie, fmt3, splitPP, stabilitySlices } from "./charts";
import { PC_WEIGHTS, RATIO_KEYS, RATIO_NAMES } from "@/lib/capsule/capsuleMetrics";

const BOUND_COLORS = ["#8b0000", "#00008b"]; // dark red / dark blue, alternating (Capacity_Part8)

export function proficiencyEntities(capsuleType, level) {
  const scatter = level === "capsule";
  const t = scatter ? "scatter" : "line";
  const list = [
    { name: "Equivalent Proficiency (XEP)", key: "XEP", type: t },
    ...(RATIO_KEYS[capsuleType] || []).map((k) => ({ name: `${RATIO_NAMES[k]} (${k})`, key: k, type: t })),
    { name: "Composite Proficiency (XCP)", key: "XCP", type: t },
    { name: "Band Proficiency (XBP)", key: "XBP", type: t },
    { name: "Butler Interaction Proficiency (MSIP)", key: "MSIP", type: t },
    { name: "Stability in Proficiency (STA-P)", key: "STAP", type: "pie" },
  ];
  if (!scatter) {
    ["PC1", "PC2", "PC3"].forEach((pc) => list.push({ name: `Compression - ${pc} Cross Plot`, pc, type: "compression" }));
  }
  return list;
}

/** Metric points and bounds of a compression cross plot (positive PP IDs only). */
export function compressionData(capsuleType, pc, results, thresholds) {
  const metrics = Object.entries(PC_WEIGHTS[capsuleType]?.[pc] || {}).filter(([, w]) => w > 0);
  const points = [];
  results.filter((r) => r.ppId > 0).sort((a, b) => a.ppId - b.ppId).forEach((r) => {
    metrics.forEach(([k, w]) => {
      if (r[k] === null || r[k] === undefined) return;
      points.push({ ppId: r.ppId, metric: k, x: Number(r[k]), value: +w.toFixed(3) });
    });
  });
  const bounds = metrics.map(([k, w], i) => ({
    metric: k, comp: +w.toFixed(3), threshold: thresholds?.[k] ?? 0.7, color: BOUND_COLORS[i % 2],
  }));
  return { points, bounds };
}

function CompressionChart({ entity, data, p }) {
  const { points, bounds } = data;
  const maxX = Math.max(1, ...points.map((pt) => pt.x), ...bounds.map((b) => b.threshold));
  const maxY = Math.max(...bounds.map((b) => b.comp), 0.1);
  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: p.shadeArea }}>
      <ChartTitle entity={entity} />
      <div className="w-full h-[68vh] flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={[0, Math.ceil(maxX * 10) / 10]} tickFormatter={(v) => Number(v).toFixed(2)}>
              <Label value="Metric Values [Please see Capsule Control]" position="insideBottom" offset={-10} />
            </XAxis>
            <YAxis type="number" dataKey="value" domain={[0, Math.ceil(maxY * 1.15 * 100) / 100]} tickFormatter={(v) => Number(v).toFixed(3)}>
              <Label value="Compression %" angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />
            </YAxis>
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const pt = payload[0].payload;
              return (
                <div className="bg-white p-2 border rounded shadow text-xs">
                  <div><strong>PP ID:</strong> {pt.ppId}</div>
                  <div><strong>{pt.metric}:</strong> {fmt3(pt.x)}</div>
                  <div><strong>%Comp:</strong> {fmt3(pt.value)}</div>
                </div>
              );
            }} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} itemSorter={null} />
            <Scatter name="Metric Points" data={points} fill={p.positiveLineColor} shape={(sp) => Dot(sp, p.positiveLineColor, p)} isAnimationActive={false} />
            {/* Bound of each metric: y = %Comp for 0 < x < threshold, x = threshold for 0 < y < %Comp */}
            {bounds.map((b) => (
              <Scatter
                key={b.metric}
                name={`${b.metric} Bound`}
                data={[{ x: 0, value: b.comp }, { x: b.threshold, value: b.comp }, { x: b.threshold, value: 0 }]}
                line={{ stroke: b.color, strokeDasharray: "6 4", strokeWidth: 2 }}
                lineType="joint"
                fill={b.color}
                legendType="plainline"
                shape={() => null}
                isAnimationActive={false}
                tooltipType="none"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProficiencyBody({ ctx }) {
  const { capsule, level, data, thresholds, filters, resetFilters } = ctx;
  const results = data.results || [];
  const entities = useMemo(() => proficiencyEntities(capsule.capsuleType, level), [capsule.capsuleType, level]);

  const renderChart = (e, p) => {
    if (e.type === "pie") return <SharePie entity={e} slices={stabilitySlices(results, "STAP")} />;
    if (e.type === "compression") {
      return <CompressionChart entity={e} data={compressionData(capsule.capsuleType, e.pc, results, thresholds)} p={p} />;
    }
    const th = filters.thresholdEnabled ? thresholds?.[e.key] ?? null : null;
    return <SeriesChart entity={e} series={splitPP(results, e.key)} props={p} threshold={th} scatter={e.type === "scatter"} />;
  };

  const renderTable = (e) => {
    if (e.type === "pie") return null;
    if (e.type === "compression") {
      const { points } = compressionData(capsule.capsuleType, e.pc, results, thresholds);
      if (!points.length) return null;
      return (
        <table className="text-xs border border-gray-300" style={{ width: "max-content", minWidth: "100%" }}>
          <thead className="bg-gray-100">
            <tr>{["PP ID", "Metric", "Value", "%Comp"].map((h) => <th key={h} className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">{h}</th>)}</tr>
          </thead>
          <tbody>
            {points.map((pt, i) => (
              <tr key={i} className="hover:bg-blue-50">
                <td className="text-center border border-gray-300 px-2 py-1">{pt.ppId}</td>
                <td className="text-center border border-gray-300 px-2 py-1">{pt.metric}</td>
                <td className="text-center border border-gray-300 px-2 py-1">{fmt3(pt.x)}</td>
                <td className="text-center border border-gray-300 px-2 py-1">{fmt3(pt.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <PPTables series={splitPP(results, e.key)} valueLabel={e.key} />;
  };

  return <PlotPanel entities={entities} renderChart={renderChart} renderTable={renderTable} onReset={resetFilters} level={level} />;
}

/** Analytics View → Proficiency Metrics for the active capsule (Capacity_Part8). */
export default function CapsuleProficiency() {
  return (
    <CapsuleAnalyticsShell>
      {(ctx) => <ProficiencyBody ctx={ctx} />}
    </CapsuleAnalyticsShell>
  );
}

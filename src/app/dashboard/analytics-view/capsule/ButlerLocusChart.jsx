"use client";
import React from "react";
import { CartesianGrid, Label, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Butler Locus models ("New Hybrid Models" sheet – Candidate Level only):
 *  Sharp:   ∆VAR1 = (-4/3) VAR + 1 (dark red), ∆VAR2 = (-20/3) VAR + 5 (dark blue), ∆VAR3 = -20 VAR + 15 (dark green)
 *  Rounded: ∆VAR = (1 - (VAR / a)^2)^(1/100) with a = 0.75 (dark red), 0.70 (dark blue), 0.60 (dark green)
 *  Both mirrored for -∆VAR. Y-Axis: [-1, 1], X-Axis: [0, 1]. Data points: positive PP IDs of the candidate.
 */
export const BUTLER_LOCUS_CHARTS = [
  ["PC1", "RRN", "deltaRRN", "Principals: ∆PC1 vs. PC1"],
  ["PC2", "PRN", "deltaPRN", "Principals: ∆PC2 vs. PC2"],
  ["PC3", "ARN", "deltaARN", "Principals: ∆PC3 vs. PC3"],
  ["XEP", "XEP", "GEQ", "Equivalent ∆GEQ vs. XEP"],
].flatMap(([short, xKey, yKey, label], i) => [
  { id: `BL${i * 2 + 1}`, name: `Butler Locus (Sharp) - ${label}`, icon: "🔵", type: "butler", model: "sharp", xKey, yKey, xLabel: short, yLabel: yKey === "GEQ" ? "∆GEQ" : `∆${short}` },
  { id: `BL${i * 2 + 2}`, name: `Butler Locus (Rounded) - ${label}`, icon: "🔵", type: "butler", model: "rounded", xKey, yKey, xLabel: short, yLabel: yKey === "GEQ" ? "∆GEQ" : `∆${short}` },
]);

const COLORS = ["#8b0000", "#00008b", "#006400"];
const r4 = (v) => +v.toFixed(4);

/** Model curves as point lists (upper and lower branch per curve). */
export function locusCurves(model) {
  if (model === "sharp") {
    const lines = [[-4 / 3, 1], [-20 / 3, 5], [-20, 15]];
    return lines.flatMap(([m, b], i) => {
      // ∆VAR = m·VAR + b clipped to |∆VAR| ≤ 1 (0 ≤ VAR ≤ 0.75); y = 1 at VAR = (1 - b) / m
      const start = Math.max(0, (1 - b) / m);
      const up = [{ x: r4(start), y: r4(m * start + b) }, { x: 0.75, y: 0 }];
      return [
        { name: `∆VAR${i + 1}`, color: COLORS[i], points: up },
        { name: `-∆VAR${i + 1}`, color: COLORS[i], points: up.map((p) => ({ x: p.x, y: -p.y })), hideLegend: true },
      ];
    });
  }
  return [0.75, 0.7, 0.6].flatMap((a, i) => {
    const up = [];
    for (let v = 0; v <= a + 1e-9; v += 0.001) {
      up.push({ x: r4(Math.min(v, a)), y: r4(Math.pow(Math.max(0, 1 - Math.pow(Math.min(v, a) / a, 2)), 1 / 100)) });
    }
    up.push({ x: a, y: 0 });
    return [
      { name: `∆VAR${i + 1}`, color: COLORS[i], points: up },
      { name: `-∆VAR${i + 1}`, color: COLORS[i], points: up.map((p) => ({ x: p.x, y: -p.y })), hideLegend: true },
    ];
  });
}

export function butlerPoints(chart, rows) {
  return rows
    .filter((r) => Number(r.ppId) > 0)
    .map((r) => ({ ppId: r.ppId, x: Number(r[chart.xKey]), y: Number(r[chart.yKey]) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

export default function ButlerLocusChart({ chart, rows, properties = {} }) {
  const curves = locusCurves(chart.model);
  const points = butlerPoints(chart, rows);
  const pointColor = properties.positiveLineColor || "#10b981";
  const r = properties.symbolScaleSize || 3;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" domain={[0, 1]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]} allowDataOverflow>
          <Label value={chart.xLabel} position="insideBottom" offset={-10} />
        </XAxis>
        <YAxis type="number" dataKey="y" domain={[-1, 1]} ticks={[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]} allowDataOverflow tickFormatter={(v) => Number(v).toFixed(2)}>
          <Label value={chart.yLabel} angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />
        </YAxis>
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const p = payload[0].payload;
          if (p.ppId === undefined) return null;
          return (
            <div className="bg-white p-2 border rounded shadow text-xs">
              <div><strong>PP ID:</strong> {p.ppId}</div>
              <div><strong>{chart.xLabel}:</strong> {p.x.toFixed(3)}</div>
              <div><strong>{chart.yLabel}:</strong> {p.y.toFixed(3)}</div>
            </div>
          );
        }} />
        <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20 }} itemSorter={null} />
        {curves.map((c) => (
          <Scatter
            key={c.name}
            name={c.name}
            data={c.points}
            line={{ stroke: c.color, strokeWidth: 2 }}
            lineType="joint"
            fill={c.color}
            shape={() => null}
            legendType={c.hideLegend ? "none" : "plainline"}
            isAnimationActive={false}
          />
        ))}
        <Scatter name="Positive PP IDs" data={points} fill={pointColor} isAnimationActive={false}
          shape={(sp) => (sp.cx == null ? null : <circle cx={sp.cx} cy={sp.cy} r={r} fill={pointColor} />)} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

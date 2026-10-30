"use client";
import React from "react";
import { CartesianGrid, Label, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Butler Locus models ("New Hybrid Models" sheet – CANDIDATE LEVEL ONLY, ONLY FOR +PP IDs).
 * Shared by the unit Hybrid Metrics (∆RR vs RR, ∆PR vs PR, ∆AR vs AR, ∆GEQ vs XEP) and the capsule
 * Hybrid Metrics (∆PC1 vs PC1, ∆PC2 vs PC2, ∆PC3 vs PC3, ∆GEQ vs XEP).
 *  Sharp:   ∆VAR1 = (-4/3) VAR + 1 (dark red), ∆VAR2 = (-20/3) VAR + 5 (dark blue), ∆VAR3 = -20 VAR + 15 (dark green)
 *  Rounded: ∆VAR = (1 - (VAR / a)^2)^(1/100) with a = 0.75 (dark red), 0.70 (dark blue), 0.60 (dark green)
 *  Both mirrored for -∆VAR. Y-Axis: [-1, 1], X-Axis: [0, 1].
 * The model curves are a fixed background (not in the legend, not changed by the Property Editor);
 * the legend and the Property Editor are for the "Positive PP IDs" points from the tabulation table.
 */

/**
 * Chart entities with numeric IDs continuing the screen's list.
 * models: [{ short: "RR", label: "Receptive: ∆RR vs. RR", xKey, yKey, yLabel? }]
 */
export function butlerLocusCharts(models, startId) {
  return models.flatMap((m, i) => ["Sharp", "Rounded"].map((model, j) => ({
    id: String(startId + i * 2 + j),
    name: `Butler Locus (${model}) - ${m.label}`,
    icon: "🔵",
    type: "butler",
    model: model.toLowerCase(),
    xKey: m.xKey,
    yKey: m.yKey,
    xLabel: m.xLabel || m.short,
    yLabel: m.yLabel || `∆${m.short}`,
  })));
}

const COLORS = ["#8b0000", "#00008b", "#006400"];
const r4 = (v) => +v.toFixed(4);

/** Model curves as point lists (upper and lower branch per curve). */
export function locusCurves(model) {
  if (model === "sharp") {
    const lines = [[-4 / 3, 1], [-20 / 3, 5], [-20, 15]];
    return lines.flatMap(([m, b], i) => {
      // ∆VAR = m·VAR + b clipped to |∆VAR| ≤ 1 (0 ≤ VAR ≤ 0.75)
      const start = Math.max(0, (1 - b) / m);
      const up = [{ x: r4(start), y: r4(m * start + b) }, { x: 0.75, y: 0 }];
      return [
        { name: `∆VAR${i + 1}`, color: COLORS[i], points: up },
        { name: `-∆VAR${i + 1}`, color: COLORS[i], points: up.map((p) => ({ x: p.x, y: -p.y })) },
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
      { name: `-∆VAR${i + 1}`, color: COLORS[i], points: up.map((p) => ({ x: p.x, y: -p.y })) },
    ];
  });
}

const num = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

/** Positive PP ID points {ppId, x, y} of a chart. */
export function butlerPoints(chart, rows) {
  return (rows || [])
    .filter((r) => Number(r.ppId) > 0)
    .map((r) => ({ ppId: r.ppId, x: num(r[chart.xKey]), y: num(r[chart.yKey]) }))
    .filter((p) => p.x !== null && p.y !== null)
    .sort((a, b) => a.ppId - b.ppId);
}

/** Same symbol shapes as the Hybrid Metrics Property Editor (circle / square / triangle / diamond). */
function symbol(style, cx, cy, color, size) {
  if (cx == null || cy == null) return null;
  switch (style) {
    case "square":
      return <rect x={cx - size} y={cy - size} width={size * 2} height={size * 2} fill={color} />;
    case "triangle":
      return <polygon points={`${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`} fill={color} />;
    case "diamond":
      return <polygon points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`} fill={color} />;
    default:
      return <circle cx={cx} cy={cy} r={size} fill={color} />;
  }
}

/** Table tab of a Butler Locus chart: one table, positive PP IDs only. */
export function ButlerLocusTable({ chart, rows }) {
  const points = butlerPoints(chart, rows);
  const th = "whitespace-nowrap border border-gray-300 px-2 py-1 text-center";
  const td = "whitespace-nowrap text-center border border-gray-300 px-2 py-1";
  return (
    <div>
      <h3 className="text-gray-600 font-semibold mb-2 ml-2">Positive PP IDs</h3>
      <table className="text-xs border border-gray-300" style={{ width: "max-content", minWidth: "100%" }}>
        <thead className="bg-gray-100">
          <tr><th className={th}>PP ID</th><th className={th}>{chart.xLabel}</th><th className={th}>{chart.yLabel}</th></tr>
        </thead>
        <tbody>
          {points.length ? points.map((p) => (
            <tr key={p.ppId} className="hover:bg-blue-50">
              <td className={td}>{p.ppId}</td><td className={td}>{p.x.toFixed(3)}</td><td className={td}>{p.y.toFixed(3)}</td>
            </tr>
          )) : (
            <tr><td colSpan={3} className="text-center text-gray-500 border border-gray-300 px-2 py-1">NO POSITIVE DATA AVAILABLE</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ButlerLocusChart({ chart, rows, properties = {} }) {
  const p = properties;
  const curves = locusCurves(chart.model);
  const points = butlerPoints(chart, rows);
  const color = p.positiveLineColor || "#10b981";
  const size = Number(p.symbolScaleSize) || 3;
  const visible = p.positiveVisibility !== false;
  const showX = p.showLabel !== false || p.labelType !== "X Type";
  const showY = p.showLabel !== false || p.labelType !== "Y Type";
  return (
    <div className="w-full h-full" style={{ backgroundColor: p.shadeArea || "#ffffff" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" domain={[0, 1]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]} allowDataOverflow>
            {showX && <Label value={chart.xLabel} position="insideBottom" offset={-10} />}
          </XAxis>
          <YAxis type="number" dataKey="y" domain={[-1, 1]} ticks={[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]} allowDataOverflow tickFormatter={(v) => Number(v).toFixed(2)}>
            {showY && <Label value={chart.yLabel} angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />}
          </YAxis>
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const pt = payload[0].payload;
            if (pt.ppId === undefined) return null;
            return (
              <div className="bg-white p-2 border rounded shadow text-xs">
                <div><strong>PP ID:</strong> {pt.ppId}</div>
                <div><strong>{chart.xLabel}:</strong> {pt.x.toFixed(3)}</div>
                <div><strong>{chart.yLabel}:</strong> {pt.y.toFixed(3)}</div>
              </div>
            );
          }} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20 }} />
          {curves.map((c) => (
            <Scatter
              key={c.name}
              name={c.name}
              data={c.points}
              line={{ stroke: c.color, strokeWidth: 2 }}
              lineType="joint"
              fill={c.color}
              shape={() => null}
              legendType="none"
              tooltipType="none"
              isAnimationActive={false}
            />
          ))}
          <Scatter
            name="Positive PP IDs"
            data={points}
            fill={color}
            hide={!visible}
            legendType="circle"
            shape={(sp) => symbol(p.symbolStyle, sp.cx, sp.cy, color, size)}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

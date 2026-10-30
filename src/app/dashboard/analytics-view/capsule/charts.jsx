"use client";
import React from "react";
import {
  CartesianGrid, Cell, Label, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";

/** Default chart properties – same defaults as the unit Plot Selections (used by the shared PropertyEditor). */
export const DEFAULT_CHART_PROPERTIES = {
  positiveVisibility: true,
  negativeVisibility: true,
  layer: 1,
  reference: false,
  showLabel: true,
  labelType: "X Type",
  lineStyle: "solid",
  lineColor: "#3b82f6",
  lineThickness: 2,
  symbolStyle: "circle",
  symbolColor: "#3b82f6",
  positiveSymbolColor: "#10b981",
  negativeSymbolColor: "#ef4444",
  symbolFrequency: 1,
  symbolScaleSize: 3,
  shadeArea: "#ffffff",
  positiveLineColor: "#10b981",
  negativeLineColor: "#ef4444",
};

export const fmt3 = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? "-" : Number(v).toFixed(3));
const dash = (style) => (style === "dashed" ? "6 4" : style === "dotted" ? "2 4" : style === "dashdot" ? "8 4 2 4" : "0");
const isNum = (v) => v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));

/** Split rows into negative / positive PP ID series of {x, value}. */
export function splitPP(rows, key, xKey = "ppId") {
  const pick = (r) => ({ ppId: r.ppId, x: Number(r[xKey]), value: Number(r[key]), candidateId: r.candidateId });
  const neg = rows.filter((r) => r.ppId < 0 && isNum(r[key]) && isNum(r[xKey])).sort((a, b) => b.ppId - a.ppId).map(pick);
  const pos = rows.filter((r) => r.ppId > 0 && isNum(r[key]) && isNum(r[xKey])).sort((a, b) => a.ppId - b.ppId).map(pick);
  return { neg, pos };
}

export function Dot(props, color, p) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  const r = p.symbolScaleSize;
  switch (p.symbolStyle) {
    case "square": return <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill={color} />;
    case "triangle": return <polygon points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`} fill={color} />;
    case "diamond": return <polygon points={`${cx},${cy - r} ${cx - r},${cy} ${cx},${cy + r} ${cx + r},${cy}`} fill={color} />;
    default: return <circle cx={cx} cy={cy} r={r} fill={color} />;
  }
}

export function ChartTitle({ entity }) {
  return <h2 className="text-lg font-semibold mb-2 text-center">{entity.icon || "🔵"} {entity.name}</h2>;
}

const TooltipBox = ({ active, payload, xLabel, yLabel }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white p-2 border rounded shadow text-xs">
      {p.candidateId !== undefined && p.candidateLabel && <div><strong>Candidate:</strong> {p.candidateLabel}</div>}
      <div><strong>{xLabel} (X):</strong> {typeof p.x === "number" && xLabel !== "PP ID" ? p.x.toFixed(2) : p.x}</div>
      <div><strong>{yLabel} (Y):</strong> {fmt3(p.value)}</div>
    </div>
  );
};

const yDomain = (threshold) => [
  (min) => (threshold == null ? min : Math.min(min, threshold)),
  (max) => (threshold == null ? max : Math.max(max, threshold)),
];

/**
 * Entity vs PP ID (or vs Days) – Candidate Level line chart / Capsule Level scatter chart,
 * negative PP IDs red, positive PP IDs green, optional threshold line (dash-dot black).
 */
<<<<<<< HEAD
export function SeriesChart({ entity, series, props: p, threshold, scatter = false, xLabel = "PP ID", showNegative = true, startAtZero = false, legend = true }) {
  const yLabel = entity.yLabel || entity.name;
=======
export function SeriesChart({ entity, series, props: p, threshold, scatter = false, xLabel = "PP ID", showNegative = true, startAtZero = false }) {
  const yLabel = entity.name;
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
  const domainX = startAtZero ? [0, "auto"] : ["auto", "auto"];
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" dataKey="x" domain={domainX} tickFormatter={(v) => (xLabel === "PP ID" ? v : Number(v).toFixed(2))}>
        {(p.showLabel || p.labelType !== "X Type") && <Label value={xLabel} position="insideBottom" offset={-10} textAnchor="middle" />}
      </XAxis>
      <YAxis type="number" dataKey="value" domain={yDomain(threshold)} tickFormatter={(v) => Number(v).toFixed(3)}>
        {(p.showLabel || p.labelType !== "Y Type") && <Label value={yLabel} angle={-90} position="insideLeft" textAnchor="middle" offset={-10} />}
      </YAxis>
      <Tooltip content={<TooltipBox xLabel={xLabel} yLabel={yLabel} />} />
<<<<<<< HEAD
      {legend && <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />}
=======
      <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
      {threshold != null && (
        <ReferenceLine y={threshold} stroke="#000000" strokeWidth={2} strokeDasharray="7 4 1 4" />
      )}
    </>
  );
  const negName = "Negative PP IDs";
  const posName = showNegative ? "Positive PP IDs" : yLabel;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: p.shadeArea }}>
      <ChartTitle entity={entity} />
      <div className="w-full h-[68vh] flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {scatter ? (
            <ScatterChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
              {common}
              {showNegative && (
                <Scatter name={negName} data={series.neg} hide={!p.negativeVisibility} fill={p.negativeLineColor}
                  shape={(sp) => Dot(sp, p.negativeLineColor, p)} isAnimationActive={false} />
              )}
              <Scatter name={posName} data={series.pos} hide={!p.positiveVisibility} fill={p.positiveLineColor}
                shape={(sp) => Dot(sp, p.positiveLineColor, p)} isAnimationActive={false} />
            </ScatterChart>
          ) : (
            <LineChart margin={{ top: 20, right: 30, left: 30, bottom: 50 }}>
              {common}
              {showNegative && p.negativeVisibility && (
                <Line name={negName} type="linear" dataKey="value" data={series.neg} stroke={p.negativeLineColor}
                  strokeDasharray={dash(p.negativeLineStyle)} strokeWidth={p.negativeLineThickness ?? p.lineThickness}
                  dot={(dp) => (dp.index % p.symbolFrequency !== 0 ? null : Dot(dp, p.symbolColor, p))} isAnimationActive={false} />
              )}
              {p.positiveVisibility && (
                <Line name={posName} type="linear" dataKey="value" data={series.pos} stroke={p.positiveLineColor}
                  strokeDasharray={dash(p.positiveLineStyle)} strokeWidth={p.positiveLineThickness ?? p.lineThickness}
                  dot={(dp) => (dp.index % p.symbolFrequency !== 0 ? null : Dot(dp, p.symbolColor, p))} isAnimationActive={false} />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Pie chart with 3-decimal shares and counts in the tooltip (as Stability pies on the unit side). */
export function SharePie({ entity, slices }) {
  const total = slices.reduce((t, s) => t + (s.count || 0), 0);
  const data = slices.map((s) => ({ ...s, value: total > 0 ? Number((s.count / total).toFixed(3)) : 0 }));
  return (
    <div className="flex flex-col h-full p-4 bg-white overflow-hidden">
      <h2 className="text-lg font-semibold mb-2 text-center flex-shrink-0">{entity.icon || "🔵"} {entity.name}</h2>
      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 italic">NO DATA AVAILABLE</div>
      ) : (
        <div className="flex-1 min-h-0 h-[68vh]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 30, left: 30, bottom: 70 }}>
              <Tooltip formatter={(value, name, pr) => [`${Number(value).toFixed(3)} Count: ${pr?.payload?.count} `, name]} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", paddingTop: "4px" }} />
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%"
                label={({ value }) => Number(value).toFixed(3)} labelLine isAnimationActive={false}>
                {data.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/** "Positive PP IDs" / "Negative PP IDs" tables of the Table tab. */
export function PPTables({ series, valueLabel, xLabel = null, showNegative = true }) {
  const table = (title, rows, emptyText) => (
    <div>
      <h3 className="text-gray-600 font-semibold mb-2 ml-2">{title}</h3>
      <table className="text-xs border border-gray-300" style={{ width: "max-content", minWidth: "100%" }}>
        <thead className="bg-gray-100">
          <tr>
            <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center w-20">PP ID</th>
            {xLabel && <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center w-20">{xLabel}</th>}
            <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center w-20">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={i} className="hover:bg-blue-50">
              <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">{r.ppId}</td>
              {xLabel && <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">{Number(r.x).toFixed(2)}</td>}
              <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">{fmt3(r.value)}</td>
            </tr>
          )) : (
            <tr><td colSpan={xLabel ? 3 : 2} className="text-center text-gray-500 border border-gray-300 px-2 py-1">{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
<<<<<<< HEAD
  // Tables are always shown (empty rows say there is no data), as on the unit screens
=======
  if (!series.pos.length && !series.neg.length) {
    return <div className="text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>;
  }
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
  return (
    <>
      {table("Positive PP IDs", series.pos, "NO POSITIVE DATA AVAILABLE")}
      {showNegative && table("Negative PP IDs", series.neg, "NO NEGATIVE DATA AVAILABLE")}
    </>
  );
}

export const STABILITY_COLORS = { STABLE: "#10b981", UNSTABLE: "#ef4444" };

/** STABLE / UNSTABLE pie slices of a status key (STAP or STAG). */
export function stabilitySlices(rows, key) {
  const vals = rows.filter((r) => r.ppId > 0 || key === "STAP").map((r) => r[key]).filter(Boolean);
  return ["STABLE", "UNSTABLE"].map((name) => ({ name, count: vals.filter((v) => v === name).length, color: STABILITY_COLORS[name] }));
}

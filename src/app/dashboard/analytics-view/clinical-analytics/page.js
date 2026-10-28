"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FolderOutput } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { saveAs } from "file-saver";
import { html2canvas } from "@/lib/exportLibs";
import { CLINICAL_CHARTS, buildIndexTable, collectClinicalData } from "@/lib/capsule/clinicalAnalytics";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF4560", "#00BFFF", "#FF69B4", "#7FFF00", "#FFD700",
];
const f3 = (v) => (v === null || v === undefined ? "" : Number(v).toFixed(3));

const renderPieLabel = ({ cx, cy, midAngle, outerRadius, value, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#111" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${name}: ${Number(value || 0).toFixed(3)}`}
    </text>
  );
};

const escapeCSV = (value) => {
  const str = String(value ?? "");
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

/**
 * Analytics View → Clinical Analytics (Capacity_Part15): tracks ALL capsules (Global Analytics tracks all units;
 * the data is never mixed). Shared Clinical Analytics Index Table + 34 pie charts.
 */
export default function ClinicalAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(CLINICAL_CHARTS[0]);
  const [showExport, setShowExport] = useState(false);
  const chartRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    collectClinicalData()
      .then(setData)
      .catch((e) => { console.error("Clinical analytics:", e); setData(null); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const close = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const index = useMemo(() => buildIndexTable(data), [data]);
  const isTable = selected?.type === "table";

  const exportAsJPG = async () => {
    if (!chartRef.current) return;
    try {
      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(chartRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false, scrollX: 0, scrollY: 0 });
      canvas.toBlob((blob) => saveAs(blob, "Plot Extraction.jpg"), "image/jpeg", 0.95);
    } catch (err) {
      alert("Failed to export as JPG: " + err.message);
    }
  };

  const exportAsCSV = () => {
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const lines = [
      "EvalzNow – A Novel Human Capital Assessment Method",
      "Capacity Accounting for Education and Industry",
      "Hybrid Proficiency & Growth Monitoring",
      `Clinical Analytics Export Date: ${date}`,
      " ",
      ["Metric Descriptions", "Metric Values"].map(escapeCSV).join(","),
      ...index.rows.map((r) => [r.description, f3(r.value)].map(escapeCSV).join(",")),
      ["Index Rating", index.rating].map(escapeCSV).join(","),
      ["Weight Index (WI)", index.weightedIndex.toFixed(4)].map(escapeCSV).join(","),
    ];
    saveAs(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), "Clinical Analytics Index Table.csv");
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-start w-full h-full text-gray-500 uppercase">Loading...</div>;
    if (isTable) {
      return (
        <div className="text-xs text-gray-600 mt-2 w-full overflow-auto mb-17">
          <table className="table-auto w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-2 py-1 text-center">Metric Descriptions</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Metric Values</th>
              </tr>
            </thead>
            <tbody>
              {index.rows.map((r) => (
                <tr key={r.description} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1">{r.description}</td>
                  <td className="border border-gray-300 px-2 py-1 text-center">{f3(r.value)}</td>
                </tr>
              ))}
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-right"><strong>Index Rating</strong></td>
                <td className="border border-gray-300 px-2 py-1 text-center">{index.rating}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-right"><strong>Weight Index (WI)</strong></td>
                <td className="border border-gray-300 px-2 py-1 font-mono text-center">{index.weightedIndex.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    const pie = data ? selected.data(data) : [];
    if (!pie.length || pie.reduce((s, d) => s + d.value, 0) === 0) {
      return <div className="flex justify-center items-start w-full h-full text-gray-400 uppercase">No data available</div>;
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label={renderPieLabel} labelLine isAnimationActive={false}>
            {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${Number(value).toFixed(3)} Count: ${Math.round(props?.payload?.count ?? 0)}`, name]} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingBottom: 20 }} itemSorter={() => 0} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden m-1">
        <div className="flex-1 overflow-auto bg-white">
          <div className="flex flex-col h-full overflow-hidden w-full">
            <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
              <span className="pl-2 text-md">Plot Selections</span>
              <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
            </h2>
            <div className="flex h-[78vh] w-full my-2">
              <div className="w-6/12 lg:w-5/12 flex flex-col border-2 h-full border-gray-200 p-1">
                <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700">
                  <h2 className="text-sm font-semibold">Plots</h2>
                  <div className="relative" ref={exportRef}>
                    <button onClick={() => setShowExport((p) => !p)} title="Export Graph" className="text-blue-600 hover:text-red-800 cursor-pointer pt-2">
                      <FolderOutput className="w-4 h-4 hover:text-blue-600" />
                    </button>
                    {showExport && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px]">
                        <button
                          onClick={() => { if (isTable) exportAsCSV(); else exportAsJPG(); setShowExport(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          {isTable ? "Export as CSV" : "Export as JPG"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-full overflow-hidden w-full my-2">
                  <div className="h-full flex flex-col border border-gray-200">
                    <div className="flex-1 overflow-auto p-1 mb-5">
                      <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                        <div className="col-span-10 px-1 py-1 text-left">Entities</div>
                        <div className="col-span-2 py-1 text-left">ID</div>
                      </div>
                      <div>
                        {CLINICAL_CHARTS.map((item) => (
                          <div
                            key={item.id}
                            className={`grid grid-cols-12 items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer ${selected?.id === item.id ? "bg-blue-100 font-medium" : ""}`}
                            onClick={() => setSelected(item)}
                          >
                            <div className="col-span-10 text-xs text-gray-700 truncate" title={item.name}>{item.icon} {item.name}</div>
                            <div className="col-span-2 pl-3 text-xs text-gray-400">{item.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 ml-1">
                <div ref={chartRef} className="m-5 flex flex-col h-full">
                  <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">{selected.icon} {selected.name}</h2>
                  <div className="flex-1 flex overflow-auto p-2">{renderContent()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

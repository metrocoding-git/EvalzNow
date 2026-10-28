"use client";
import React from "react";
import CapsuleAnalyticsShell from "./CapsuleAnalyticsShell";
import { RATIO_KEYS, RATIO_NAMES } from "@/lib/capsule/capsuleMetrics";

/** Column → [row key, tooltip] (Capacity_Part7). Ratio columns are added per capsule type. */
const BASE_BEFORE = [
  ["PP ID", "ppId", ""],
  ["Critical Reference Date", "criticalRefDate", ""],
  ["Day Count (Days)", "cumulativeDuration", ""],
  ["Productivity_CSD", "Productivity_CSD", "Productivity Score at Candidate Start Date"],
  ["Productivity_NSD", "Productivity_NSD", "Productivity Score at Capsule Start Date"],
  ["PC1", "PC1", "Principal 1 Ratio"],
  ["PC2", "PC2", "Principal 2 Ratio"],
  ["PC3", "PC3", "Principal 3 Ratio"],
];
const BASE_AFTER = [
  ["XEP", "XEP", "Equivalent Proficiency"],
  ["XCP", "XCP", "Composite Proficiency"],
  ["XBP", "XBP", "Band Proficiency"],
  ["MSIP", "MSIP", "Butler Interaction Proficiency"],
  ["STA/P", "STAP", "Stability in Proficiency"],
  ["IC", "IC", "Interaction Class"],
  ["ΔPC1", "dPC1", "Principal 1 Growth Differential"],
  ["ΔPC2", "dPC2", "Principal 2 Growth Differential"],
  ["ΔPC3", "dPC3", "Principal 3 Growth Differential"],
  ["ΔGEQ", "GEQ", "Equivalent Growth Differential"],
  ["STA/G", "STAG", "Stability in Growth"],
  ...[1, 2, 3, 4, 5].flatMap((n) => [1, 2, 3].map((p) => [`PC${p}GT${n}`, `PC${p}GT${n}`, `Principal ${p} Ratio Component for Growth Target ${n}`])),
];

const TEXT_KEYS = new Set(["ppId", "criticalRefDate", "STAP", "IC", "STAG"]);

export function tabulationColumns(capsuleType) {
  return [
    ...BASE_BEFORE,
    ...(RATIO_KEYS[capsuleType] || []).map((k) => [k, k, RATIO_NAMES[k]]),
    ...BASE_AFTER,
  ];
}

export function formatCell(key, value, summary = false) {
  if (TEXT_KEYS.has(key)) return value ?? "-";
  if (key === "cumulativeDuration") {
    if (summary) return "-";
    const n = parseFloat(value);
    return Number.isNaN(n) ? "-" : n.toFixed(2);
  }
  const n = parseFloat(value);
  return value === null || value === undefined || value === "" || Number.isNaN(n) ? "-" : n.toFixed(3);
}

function TabulationViewer({ ctx }) {
  const { capsule, activeCandidate, data } = ctx;
  const cols = tabulationColumns(capsule.capsuleType);
  const results = data.results || [];
  const summaries = [
    ["Average", data.averages?.[0]],
    ["Std Dev", data.stdDevs?.[0]],
    ["Std Error", data.stdErrs?.[0]],
  ].filter(([, r]) => r);

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className="pl-2 text-md text-gray-800">Tabulation Viewer</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2 mx-1 min-w-0">
        <div className="w-full flex flex-col border-2 h-full border-gray-200 min-w-0">
          <div className="flex items-center justify-between mb-1 px-1 mx-1 mt-1 text-gray-700">
            <h2 className="text-sm font-semibold">Candidate Display</h2>
          </div>
          <div className="h-full overflow-hidden w-full flex flex-col gap-1 mb-11 min-w-0">
            <div className="flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1">
                {activeCandidate && (
                  <div className="px-3">
                    <div className="items-center justify-center px-4">
                      <div className="p-1 rounded-lg mt-1 space-y-1">
                        {[
                          ["First Name:", activeCandidate.firstName],
                          ["Last Name:", activeCandidate.lastName],
                          ["Candidate ID:", activeCandidate.candidateId],
                          ["Candidate Start Date:", activeCandidate.startDate ? String(activeCandidate.startDate).slice(0, 10) : null],
                          ["Capsule Start Date:", capsule.capsuleStartDate],
                        ].filter(([, v]) => v).map(([l, v]) => (
                          <div key={l} className="grid grid-cols-5 text-xs text-gray-400"><span>{l}</span><span>{v}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0 border border-gray-200 min-w-0">
              <h2 className="text-sm font-semibold mx-1 p-1 text-gray-700">Candidate Tabulation Tables</h2>
              <div className="flex-1 mx-1 overflow-x-auto min-w-0">
                <div className="h-full max-h-[calc(100vh-320px)] overflow-y-auto">
                  <table className="w-full text-left text-xs border-separate border-spacing-0">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        {cols.map(([h, , tip]) => (
                          <th key={h} className="whitespace-nowrap text-center border border-black px-2 py-1 group relative bg-gray-200">
                            {h}
                            {tip && (
                              <div className="absolute hidden group-hover:block z-50 top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                {tip}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.length ? results.map((row) => (
                        <tr key={row.ppId} className="cursor-pointer hover:bg-gray-100">
                          {cols.map(([h, key]) => (
                            <td key={h} className="border text-center border-black px-2 py-1 whitespace-nowrap">{formatCell(key, row[key])}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr><td colSpan={cols.length} className="text-center py-4">No data available</td></tr>
                      )}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-30 bg-gray-200">
                      {summaries.map(([label, row]) => (
                        <tr key={label} className="bg-gray-200 font-semibold">
                          {cols.map(([h, key]) => (
                            <td key={h} className="border border-black text-center px-2 py-1 whitespace-nowrap bg-gray-200">
                              {key === "ppId" ? label
                                : key === "criticalRefDate" ? "-"
                                : label === "Average" ? formatCell(key, row[key], true)
                                : TEXT_KEYS.has(key) || key.includes("GT") ? "-"
                                : formatCell(key, row[key], true)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Analytics View → Tabulation Tables for the active capsule (Capacity_Part7). */
export default function CapsuleTabulationTables() {
  return (
    <CapsuleAnalyticsShell levels={false} onlyCandidateList>
      {(ctx) => <TabulationViewer ctx={ctx} />}
    </CapsuleAnalyticsShell>
  );
}

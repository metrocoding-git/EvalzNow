"use client";
import React, { useEffect, useState } from "react";
import useActiveCapsule from "./useActiveCapsule";
import { CapsuleSidebar } from "./CapsuleInsertScores";
import { getCapsuleBinTotals, getCapsulePpSummary } from "@/services/capsuleService";
import { capacitiesOf } from "../../control-view/capsule/capsuleConfig";

const th = "whitespace-nowrap text-center border-1 border-gray-400 px-2 py-1";
const td = "whitespace-nowrap text-center border-1 border-gray-400 px-2 py-1";
const n2 = (v) => (v === null || v === undefined || v === "" ? "" : Number(v).toFixed(2));

/** Header with a hover tooltip (same as the unit bin-total headers). */
const TipTh = ({ abbr, full }) => (
  <th className={`relative group ${th} bg-gray-50`}>
    {abbr}
    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-150 top-full right-0 mt-2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
      {full}
    </div>
  </th>
);

/** "Attained Frontal (L) Score" style names (Capacity_Part5). */
const scoreName = (kind, capacityName) =>
  `${kind} ${capacityName.replace(" Lobe", "")} Score`;

/** Setup View → Preview when a capsule is active (Capacity_Part5). */
export default function CapsulePreview() {
  const { capsule, candidates } = useActiveCapsule();
  const [selected, setSelected] = useState(null);
  const [bins, setBins] = useState([]);
  const [summary, setSummary] = useState([]);
  const [tab, setTab] = useState("Indirect");
  const [selectedRow, setSelectedRow] = useState(null);

  const capacities = capacitiesOf(capsule?.capsuleType);

  useEffect(() => {
    if (!selected && candidates.length) setSelected(candidates[0]);
  }, [candidates, selected]);

  useEffect(() => {
    if (!capsule || !selected) return;
    getCapsuleBinTotals(capsule.id, selected.id, capacities).then(setBins);
    getCapsulePpSummary(capsule.id, selected.id, capacities).then(setSummary);
  }, [capsule, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = summary
    .filter((r) => (tab === "Indirect" ? r.ppId < 0 : r.ppId > 0))
    .sort((a, b) => Math.abs(a.ppId) - Math.abs(b.ppId));

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-1/2 lg:w-4/12 flex flex-col border-1 h-full border-gray-200">
        <CapsuleSidebar
          capsule={capsule}
          candidates={candidates}
          selected={selected}
          onSelect={setSelected}
          columns={["lastName", "firstName", "candidateId"]}
        />
      </div>

      <div className="flex-1 bg-white flex flex-col border-l border-gray-200 ml-1 overflow-y-auto">
        <h2 className="text-md font-bold bg-gray-100 p-0.5 flex items-center border-b border-gray-200">
          <span className="pl-2 text-md text-gray-800">Preliminary Checkpoints</span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>

        {selected && capsule && (
          <>
            <div className="h-1/2 border border-gray-300 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-400 px-2 py-1 text-gray-700 flex-shrink-0">
                <h2 className="text-sm font-semibold">Master PP ID Bin Totals</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full table-auto text-xs text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={th}>Master PP ID Callout</th>
                      <th className={th}>Capsule Name</th>
                      <th className={th}>Capsule ID</th>
                      <th className={th}>Capsule Type</th>
                      {capacities.map((c) => (
                        <React.Fragment key={c.code}>
                          <TipTh abbr={`A${c.code}`} full={scoreName("Attained", c.name)} />
                          <TipTh abbr={`M${c.code}`} full={scoreName("Maximum", c.name)} />
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bins.map((r) => (
                      <tr key={r.ppId}>
                        <td className={td}>{r.ppId}</td>
                        <td className={td}>{r.capsuleName}</td>
                        <td className={td}>{r.capsuleId}</td>
                        <td className={td}>{r.capsuleType}</td>
                        {capacities.map((c) => (
                          <React.Fragment key={c.code}>
                            <td className={td}>{n2(r[`A${c.code}`])}</td>
                            <td className={td}>{n2(r[`M${c.code}`])}</td>
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-1/2 min-h-0 overflow-hidden border border-gray-300 m-1 flex flex-col">
              <div className="flex space-x-2 border-b p-1 bg-gray-100">
                {["Indirect", "Direct"].map((t) => (
                  <button
                    key={t}
                    className={`px-3 py-1 text-sm cursor-pointer ${tab === t ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold" : "hover:bg-gray-100"}`}
                    onClick={() => { setTab(t); setSelectedRow(null); }}
                  >
                    {t} Performance Point (Master)
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-1">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={th}>Master PP ID Callout</th>
                      <th className={th}>Short Description</th>
                      <th className={th}>Duration</th>
                      <th className={th}>Critical Reference Date</th>
                      <th className={th}>Missing Capacities</th>
                      <th className={th}>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.ppId} onClick={() => setSelectedRow(i)} className={`cursor-pointer ${selectedRow === i ? "bg-gray-200" : "hover:bg-gray-50"}`}>
                        <td className={td}>{r.ppId}</td>
                        <td className={td}>{r.shortDescription || "N/A"}</td>
                        <td className={td}>{n2(r.totalDuration)}</td>
                        <td className={td}>{r.latestCriticalRefDate ? new Date(`${r.latestCriticalRefDate}T00:00:00`).toLocaleDateString("en-US") : ""}</td>
                        <td className={td}>{r.missingCapacity || "None"}</td>
                        <td className={td}>{r.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, FolderOutput, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ClinicalMarkers from "./ClinicalMarkers";
import { CLINICAL_FIELDS, SELECT_FIELDS, emptyNm } from "./ScoreFields";
import {
  deleteCapsuleScore, getCapsuleBlocksByCapsuleAndCandidate, getCapsuleScoresByCapsule,
  getCapsuleScoresByCapsuleAndCandidate, updateCapsuleScore,
} from "@/services/capsuleService";
import { useFormStatus } from "@/context/FormStatusContext";
import { NEURO_MARKER_COUNT } from "../../control-view/capsule/capsuleConfig";

const th = "whitespace-nowrap text-center border-1 border-gray-400 px-2 py-1";
const td = "whitespace-nowrap border p-1 text-center";
const fmt2 = (v) => (v === null || v === undefined || v === "" ? "-" : Number(v).toFixed(2));

export const SCORE_COLUMNS = [
  { label: "First Name", get: (r) => r.candidate?.firstName ?? "" },
  { label: "Last Name", get: (r) => r.candidate?.lastName ?? "" },
  { label: "CID", get: (r) => r.candidate?.candidateId ?? "" },
  { label: "PP ID", get: (r) => r.ppId ?? "" },
  { label: "Duration", get: (r) => fmt2(r.durationDays) },
  { label: "Critical Reference Date", get: (r) => r.criticalRefDate?.slice(0, 10) ?? "" },
  { label: "Task Declaration", get: (r) => r.taskDeclaration ?? "" },
  ...SELECT_FIELDS.map((f) => ({ label: f.label, get: (r) => r[f.key] ?? "" })),
  { label: "Capacity", get: (r) => r.capacity ?? "" },
  { label: "Attained Score", get: (r) => fmt2(r.attainedScore) },
  { label: "Maximum Score", get: (r) => fmt2(r.maxScore) },
  ...CLINICAL_FIELDS.map((f) => ({ label: f.label, get: (r) => r[f.key] ?? "" })),
  ...Array.from({ length: NEURO_MARKER_COUNT }, (_, i) => ({
    label: `CM${i + 1}`,
    get: (r) => (r.nm || emptyNm())[i] || "No",
  })),
];

const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

/** CSV of all candidates of the active capsule – same columns as the table. */
async function exportCapsuleScores(capsule) {
  const all = await getCapsuleScoresByCapsule(capsule.id);
  if (!all.length) {
    toast.error("No table data available to export");
    return;
  }
  const order = (rows, dir) =>
    rows.sort((a, b) => {
      const pa = Number(a.ppId), pb = Number(b.ppId);
      if (pa !== pb) return dir * (pa - pb);
      return String(a.criticalRefDate).localeCompare(String(b.criticalRefDate));
    });
  const indirect = order(all.filter((r) => Number(r.ppId) < 0), -1);
  const direct = order(all.filter((r) => Number(r.ppId) > 0), 1);
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const lines = [
    "EvalzNow – A Novel Human Capital Assessment Method",
    "Capacity Accounting for Education and Industry",
    "Hybrid Proficiency & Growth Monitoring",
    `Data Extraction Date: ${date}`,
    "",
    SCORE_COLUMNS.map((c) => escapeCSV(c.label)).join(","),
    ...[...indirect, ...direct].map((r) => SCORE_COLUMNS.map((c) => escapeCSV(c.get(r))).join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Capacity Accounting Data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Right panel of the capsule Insert Scores tab (same layout as unit "Competency Accounting"). */
export default function CapacityAccounting({
  capsule, candidateId, activeTab, setActiveTab, selectedRow, setSelectedRow, onAdd, refreshTrigger,
  markerNames, onMarkersChanged,
}) {
  const [scores, setScores] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { setFormStatus } = useFormStatus();

  const load = async () => {
    if (!capsule?.id || !candidateId) { setScores([]); return; }
    setScores(await getCapsuleScoresByCapsuleAndCandidate(capsule.id, candidateId));
  };
  useEffect(() => { load(); }, [capsule?.id, candidateId, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(
    () => scores.filter((r) => (activeTab === "Indirect" ? Number(r.ppId) < 0 : Number(r.ppId) > 0)),
    [scores, activeTab]
  );

  useEffect(() => {
    if (selectedRow) setSelectedIndex(rows.findIndex((r) => r.id === selectedRow.id));
    else setSelectedIndex(null);
  }, [rows, selectedRow]);

  const handleDelete = async () => {
    if (!selectedRow) return;
    setFormStatus("Processing");
    await deleteCapsuleScore(selectedRow.id);
    setSelectedRow(null);
    await load();
    setFormStatus("Score Deleted");
  };

  // Move Up / Down: the row takes the PP ID (block) and Critical Reference Date of its neighbour (as for units)
  const move = async (dir) => {
    if (selectedIndex === null || selectedIndex < 0) return;
    const target = rows[selectedIndex + dir];
    if (!target) return;
    const blocks = await getCapsuleBlocksByCapsuleAndCandidate(capsule.id, candidateId);
    const block = blocks.find((b) => String(b.id) === String(target.blockId));
    const saved = await updateCapsuleScore(selectedRow.id, {
      blockId: target.blockId, ppId: block ? block.ppId : target.ppId, criticalRefDate: target.criticalRefDate,
    });
    setSelectedRow(saved);
    await load();
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-md font-bold bg-gray-100 p-0.5 flex items-center border-b border-gray-200">
        <span className="pl-2 text-md">Insert Scores for Capacity Accounting</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>

      {/* Scoring & Monitoring Markers */}
      <div className="h-1/3 border border-gray-300 flex flex-col m-1">
        <div className="flex items-center border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1">
          <h2 className="text-sm font-semibold mx-1">Scoring &amp; Monitoring Markers</h2>
        </div>
        <div className="flex-1 overflow-auto px-3 pb-2">
          <ClinicalMarkers capsuleId={capsule?.id} markerNames={markerNames} onChanged={onMarkersChanged} />
        </div>
      </div>

      {/* Capacity Accounting */}
      <div className="h-2/3 border border-gray-300 flex flex-col m-1 min-h-0">
        <div className="flex items-center border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1">
          <h2 className="text-sm font-semibold mx-1">Capacity Accounting</h2>
        </div>
        <div className="flex items-center justify-between border-b p-1 bg-gray-100 mx-2">
          <div className="flex space-x-2">
            {["Indirect", "Direct"].map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1 text-sm cursor-pointer ${activeTab === tab
                  ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold"
                  : "hover:bg-gray-100"}`}
                onClick={() => { setActiveTab(tab); setSelectedRow(null); }}
              >
                {tab} Performance Points (Sub)
              </button>
            ))}
          </div>
          <div className="mr-1">
            <button onClick={() => exportCapsuleScores(capsule)} title="Export As CSV" className="p-1 text-gray-600 hover:text-black cursor-pointer">
              <FolderOutput className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { onAdd(); setFormStatus("Creating..."); }} title="Create Task" className="p-1 text-gray-600 hover:text-black cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
            </button>
            {selectedRow && (
              <>
                <button onClick={handleDelete} title="Delete" className="p-1 text-black hover:text-red-800 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(-1)} title="Move Up" className="text-gray-600 hover:text-black cursor-pointer p-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(1)} title="Move Down" className="text-gray-600 hover:text-black cursor-pointer p-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-2 overflow-auto min-h-0">
          <table className="w-full text-left text-xs mb-7">
            <thead className="bg-gray-100 sticky top-0">
              <tr>{SCORE_COLUMNS.map((c) => <th key={c.label} className={th}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedRow?.id === row.id ? "bg-gray-200" : ""}`}
                  onClick={() => setSelectedRow(row)}
                >
                  {SCORE_COLUMNS.map((c) => <td key={c.label} className={td}>{c.get(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

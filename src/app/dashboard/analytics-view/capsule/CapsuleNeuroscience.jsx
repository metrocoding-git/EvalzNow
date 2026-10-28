"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { FileSpreadsheet, X } from "lucide-react";
import { saveAs } from "file-saver";
import { ensureExportLibs } from "@/lib/exportLibs";
import * as exportLibs from "@/lib/exportLibs";
import CapsuleAnalyticsShell from "./CapsuleAnalyticsShell";
import PlotPanel from "./PlotPanel";
import { PPTables, SeriesChart, SharePie, fmt3 } from "./charts";
import { thresholdsOf } from "../../control-view/capsule/capsuleConfig";
import {
  GROWTH_LOAD_COLUMNS, computeDiversity, computeLoads, diversityPairs, neuroEntities, positiveRows, proficiencyLoadColumns,
} from "@/lib/capsule/capsuleNeuro";
import FrontalLobe from "../../../../../public/icons/Frontal_Lobe.png";
import ParietalLobe from "../../../../../public/icons/Parietal_Lobe.png";
import OccipitalLobe from "../../../../../public/icons/Occipital_Lobe.png";
import TemporalLobe from "../../../../../public/icons/Temporal_Lobe.png";

const LOBE_IMAGES = [
  { id: "1", name: "Frontal Lobe", image: FrontalLobe },
  { id: "2", name: "Parietal Lobe", image: ParietalLobe },
  { id: "3", name: "Occipital Lobe", image: OccipitalLobe },
  { id: "4", name: "Temporal Lobe", image: TemporalLobe },
];
const STATUS_COLORS = { Typical: "#10b981", Divergent: "#ef4444" };
const TABLE_TABS = ["Loads - Proficiency", "Loads - Growth", "Neurodiversity", "Anatomy"];

const th = "whitespace-nowrap text-center border border-gray-300 px-2 py-1";
const td = "whitespace-nowrap text-center border border-gray-300 px-2 py-1";

function DataTable({ headers, rows }) {
  return (
    <table className="table-auto min-w-max text-xs border border-gray-300">
      <thead className="bg-gray-100 sticky top-0 z-10">
        <tr>{headers.map((h) => <th key={h} className={th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((r, i) => (
          <tr key={i} className="hover:bg-blue-50">{r.map((c, j) => <td key={j} className={td}>{c}</td>)}</tr>
        )) : (
          <tr><td colSpan={headers.length} className="text-center text-gray-500 border border-gray-300 px-2 py-2">NO DATA AVAILABLE</td></tr>
        )}
      </tbody>
    </table>
  );
}

/** Table data of the three tabs (also used by the Excel extraction). */
function tableModels(profCols, profLoads, growthLoads, pairs, diversity) {
  return {
    "Loads - Proficiency": {
      headers: ["PP ID Callout", "Target", ...profCols.map((c) => c.column)],
      rows: profLoads.map((r) => [r.ppId, "Proficiency", ...profCols.map((c) => fmt3(r[c.key]))]),
    },
    "Loads - Growth": {
      headers: ["PP ID Callout", "Target", ...GROWTH_LOAD_COLUMNS.map((c) => c.column)],
      rows: growthLoads.map((r) => [r.ppId, "Growth", ...GROWTH_LOAD_COLUMNS.map((c) => fmt3(r[c.key]))]),
    },
    Neurodiversity: {
      headers: ["PP ID Callout", ...pairs.flatMap((p) => [p.label, `Status ${p.no}`])],
      rows: diversity.map((r) => [r.ppId, ...pairs.flatMap((p) => [fmt3(r[p.key]), r[p.statusKey] ?? "-"])]),
    },
  };
}

async function extractTables(models, capsule, candidate) {
  await ensureExportLibs();
  const wb = new exportLibs.ExcelJS.Workbook();
  Object.entries(models).forEach(([name, m]) => {
    const ws = wb.addWorksheet(name);
    ws.addRow([`Capsule: ${capsule.capsuleName} (${capsule.capsuleId})`]);
    ws.addRow([`Candidate: ${candidate ? `${candidate.lastName || ""} ${candidate.firstName || ""} (${candidate.candidateId || candidate.id})` : "-"}`]);
    ws.addRow([]);
    const head = ws.addRow(m.headers);
    head.font = { bold: true };
    m.rows.forEach((r) => ws.addRow(r.map((c) => (c !== "-" && !Number.isNaN(Number(c)) && typeof c !== "number" ? Number(c) : c))));
    ws.columns.forEach((col) => { col.width = 16; });
  });
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Neuro Tools Tables.xlsx");
}

function NeuroToolsTable({ models, capsule, candidate }) {
  const [tab, setTab] = useState(TABLE_TABS[0]);
  const [lobe, setLobe] = useState("");
  const [showImage, setShowImage] = useState(false);
  const lobeData = LOBE_IMAGES.find((l) => l.id === lobe);

  return (
    <div className="flex flex-col h-full min-h-0 p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">🟦 Neuro Tools Table</h2>
        <button
          onClick={() => extractTables(models, capsule, candidate).catch((e) => alert("Extraction failed: " + e.message))}
          title="Extract Tables"
          className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          <FileSpreadsheet className="w-4 h-4" /> Extract Tables
        </button>
      </div>
      <div className="flex space-x-2 border-b p-2">
        {TABLE_TABS.map((t) => (
          <button
            key={t}
            className={`px-3 py-1 text-sm cursor-pointer ${tab === t
              ? "text-black bg-white border-t-2 border-blue-400 shadow-sm"
              : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-2 max-h-[64vh]">
        {models[tab] && <DataTable headers={models[tab].headers} rows={models[tab].rows} />}
        {tab === "Anatomy" && (
          <div className="mb-4 flex items-center gap-4 text-xs">
            <select value={lobe} onChange={(e) => setLobe(e.target.value)} className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 uppercase">
              <option value="" disabled>Select a lobe</option>
              {LOBE_IMAGES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <button
              onClick={() => (lobe ? setShowImage(true) : alert("Please select a lobe first"))}
              className="px-3 py-2 text-xs bg-gray-200 text-black hover:bg-gray-300 whitespace-nowrap"
            >
              Show Image
            </button>
          </div>
        )}
      </div>
      {showImage && lobeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowImage(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-[96vw] h-[92vh] max-w-6xl p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowImage(false)} className="absolute top-4 right-4 text-gray-600 hover:text-black z-10">
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image src={lobeData.image} alt={lobeData.name} fill className="object-contain" priority />
            </div>
            <p className="text-center mt-3 text-lg font-semibold text-gray-700 uppercase">{lobeData.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NeuroscienceBody({ ctx }) {
  const { capsule, data, filters, resetFilters, activeCandidate } = ctx;
  const type = capsule.capsuleType;
  const ndiv = thresholdsOf(capsule).NDIV;
  const rows = useMemo(() => positiveRows(data.results), [data]);
  const profCols = useMemo(() => proficiencyLoadColumns(type), [type]);
  const pairs = useMemo(() => diversityPairs(type), [type]);
  const profLoads = useMemo(() => computeLoads(rows, profCols), [rows, profCols]);
  const growthLoads = useMemo(() => computeLoads(rows, GROWTH_LOAD_COLUMNS), [rows]);
  const diversity = useMemo(() => computeDiversity(rows, pairs, ndiv), [rows, pairs, ndiv]);
  const entities = useMemo(() => neuroEntities(type), [type]);
  const models = useMemo(() => tableModels(profCols, profLoads, growthLoads, pairs, diversity),
    [profCols, profLoads, growthLoads, pairs, diversity]);

  const seriesOf = (e) => {
    if (e.type === "load") {
      const src = e.target === "Growth" ? growthLoads : profLoads;
      return { neg: [], pos: src.map((r) => ({ ppId: r.ppId, x: r.ppId, value: r[e.key] })) };
    }
    return { neg: [], pos: diversity.filter((r) => r[e.pair.key] !== null).map((r) => ({ ppId: r.ppId, x: r.ppId, value: r[e.pair.key] })) };
  };

  const renderChart = (e, p) => {
    if (e.type === "table") return <NeuroToolsTable models={models} capsule={capsule} candidate={activeCandidate} />;
    if (e.type === "status") {
      const statuses = diversity.map((r) => r[e.pair.statusKey]).filter(Boolean);
      return <SharePie entity={e} slices={["Typical", "Divergent"].map((name) => ({
        name, count: statuses.filter((s) => s === name).length, color: STATUS_COLORS[name],
      }))} />;
    }
    const threshold = e.type === "diff" && filters.thresholdEnabled ? Number(ndiv) : null;
    return <SeriesChart entity={e} series={seriesOf(e)} props={p} threshold={threshold} showNegative={false} />;
  };

  const renderTable = (e) => {
    if (e.type === "table") return <div className="text-center text-gray-400 py-4 italic">SEE THE TABLE TABS ON THE RIGHT</div>;
    if (e.type === "status") {
      return (
        <DataTable
          headers={["PP ID", e.pair.label, "Status"]}
          rows={diversity.map((r) => [r.ppId, fmt3(r[e.pair.key]), r[e.pair.statusKey] ?? "-"])}
        />
      );
    }
    return <PPTables series={seriesOf(e)} valueLabel={e.type === "load" ? e.column : e.pair.label} showNegative={false} />;
  };

  return (
    <PlotPanel
      title="Entity Selections"
      entities={entities}
      renderChart={renderChart}
      renderTable={renderTable}
      onReset={resetFilters}
      level="candidate"
      propertyEditorTypes={["load", "diff"]}
    />
  );
}

/** Analytics View → Neuroscience Tools for the active capsule (Capacity_Part13, Candidate Level only). */
export default function CapsuleNeuroscience() {
  return (
    <CapsuleAnalyticsShell levels={false}>
      {(ctx) => <NeuroscienceBody ctx={ctx} />}
    </CapsuleAnalyticsShell>
  );
}

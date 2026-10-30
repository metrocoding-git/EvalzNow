"use client";
<<<<<<< HEAD
import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FileSpreadsheet, FolderOutput, RefreshCw, X } from "lucide-react";
import { saveAs } from "file-saver";
import { ensureExportLibs, html2canvas } from "@/lib/exportLibs";
import * as exportLibs from "@/lib/exportLibs";
import DownloadLoader from "@/components/DownloadLoader";
import CapsuleAnalyticsShell from "./CapsuleAnalyticsShell";
import PropertyEditor from "../components/PropertyEditor";
import { DEFAULT_CHART_PROPERTIES, PPTables, SeriesChart, SharePie, fmt3 } from "./charts";
import { thresholdsOf } from "../../control-view/capsule/capsuleConfig";
import { getCapsuleMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
=======
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
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
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
<<<<<<< HEAD
// Neurodiversity first, then the loads (Capacity_Part13 / video UI_Issues_15)
const TABLE_TABS = ["Neurodiversity", "Loads - Proficiency", "Loads - Growth", "Anatomy"];
=======
const TABLE_TABS = ["Loads - Proficiency", "Loads - Growth", "Neurodiversity", "Anatomy"];
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb

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

<<<<<<< HEAD
/** Neuro data of one candidate (positive PP IDs) for a capsule type. */
function neuroData(results, type, ndiv) {
  const rows = positiveRows(results);
  const profCols = proficiencyLoadColumns(type);
  const pairs = diversityPairs(type);
  return {
    profCols,
    pairs,
    profLoads: computeLoads(rows, profCols),
    growthLoads: computeLoads(rows, GROWTH_LOAD_COLUMNS),
    diversity: computeDiversity(rows, pairs, ndiv),
  };
}

/** The three tables (headers + rows); `lead` adds leading cells (candidate columns for the extraction). */
function tableModels(d, lead = { headers: [], cells: [] }) {
  return {
    Neurodiversity: {
      headers: [...lead.headers, "PP ID Callout", ...d.pairs.flatMap((p) => [p.label, `Status ${p.no}`])],
      rows: d.diversity.map((r) => [...lead.cells, r.ppId, ...d.pairs.flatMap((p) => [fmt3(r[p.key]), r[p.statusKey] ?? "-"])]),
    },
    "Loads - Proficiency": {
      headers: [...lead.headers, "PP ID Callout", "Target", ...d.profCols.map((c) => c.column)],
      rows: d.profLoads.map((r) => [...lead.cells, r.ppId, "Proficiency", ...d.profCols.map((c) => fmt3(r[c.key]))]),
    },
    "Loads - Growth": {
      headers: [...lead.headers, "PP ID Callout", "Target", ...GROWTH_LOAD_COLUMNS.map((c) => c.column)],
      rows: d.growthLoads.map((r) => [...lead.cells, r.ppId, "Growth", ...GROWTH_LOAD_COLUMNS.map((c) => fmt3(r[c.key]))]),
=======
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
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
    },
  };
}

<<<<<<< HEAD
/** "Extract Tables": all candidates of the capsule, the three tables, one sheet. */
async function extractAllTables(capsule, candidates) {
  await ensureExportLibs();
  const ndiv = thresholdsOf(capsule).NDIV;
  const ids = candidates.map((c) => c.id);
  const summary = ids.length
    ? await getCapsuleMultipleCandidateSummary({ capsuleId: capsule.id, candidate_id: ids.join(",") })
    : { results: [] };
  const merged = {};
  candidates.forEach((c) => {
    const d = neuroData((summary.results || []).filter((r) => String(r.candidateId) === String(c.id)), capsule.capsuleType, ndiv);
    const models = tableModels(d, { headers: ["Last Name", "First Name", "Candidate ID"], cells: [c.lastName || "-", c.firstName || "-", c.candidateId || "-"] });
    Object.entries(models).forEach(([name, m]) => {
      merged[name] = merged[name] || { headers: m.headers, rows: [] };
      merged[name].rows.push(...m.rows);
    });
  });

  const wb = new exportLibs.ExcelJS.Workbook();
  const ws = wb.addWorksheet("Neuro Tools Tables");
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  ["EvalzNow – A Novel Human Capital Assessment Method", "Capacity Accounting for Education and Industry",
    "Hybrid Proficiency & Growth Monitoring", `Data Extraction Date: ${date}`,
    `Capsule: ${capsule.capsuleName} (${capsule.capsuleId})`].forEach((t) => ws.addRow([t]));
  TABLE_TABS.filter((t) => merged[t]).forEach((name) => {
    ws.addRow([]);
    ws.addRow([name]).font = { bold: true };
    ws.addRow(merged[name].headers).font = { bold: true };
    if (!merged[name].rows.length) ws.addRow(["NO DATA AVAILABLE"]);
    merged[name].rows.forEach((r) => ws.addRow(r.map((c) => (typeof c === "string" && c !== "-" && c.trim() !== "" && !Number.isNaN(Number(c)) ? Number(c) : c))));
  });
  ws.columns.forEach((col) => { col.width = 16; });
=======
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
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Neuro Tools Tables.xlsx");
}

<<<<<<< HEAD
const tabBtn = (active) => `px-3 py-1 text-sm cursor-pointer ${active
  ? "text-black bg-white border-t-2 border-blue-400 shadow-sm"
  : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"}`;

function NeuroscienceBody({ ctx }) {
  const { capsule, candidates, data, filters, resetFilters } = ctx;
  const type = capsule.capsuleType;
  const ndiv = thresholdsOf(capsule).NDIV;
  const entities = useMemo(() => neuroEntities(type), [type]);
  const d = useMemo(() => neuroData(data.results, type, ndiv), [data, type, ndiv]);
  const models = useMemo(() => tableModels(d), [d]);

  const [selected, setSelected] = useState(entities[0]);
  const [tableTab, setTableTab] = useState(TABLE_TABS[0]);
  const [chartTab, setChartTab] = useState("Table");
  const [props, setProps] = useState(DEFAULT_CHART_PROPERTIES);
  const [showExport, setShowExport] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [lobe, setLobe] = useState("");
  const [showImage, setShowImage] = useState(false);
  const chartRef = useRef(null);
  const isTable = selected?.type === "table";
  const lobeData = LOBE_IMAGES.find((l) => l.id === lobe);

  const seriesOf = (e) => {
    if (e.type === "load") {
      const src = e.target === "Growth" ? d.growthLoads : d.profLoads;
      return { neg: [], pos: src.map((r) => ({ ppId: r.ppId, x: r.ppId, value: r[e.key] })) };
    }
    return { neg: [], pos: d.diversity.filter((r) => r[e.pair.key] !== null).map((r) => ({ ppId: r.ppId, x: r.ppId, value: r[e.pair.key] })) };
  };

  const extract = async () => {
    setExtracting(true);
    try {
      await extractAllTables(capsule, candidates);
    } catch (err) {
      alert("Extraction failed: " + err.message);
    } finally {
      setExtracting(false);
    }
  };

  const exportJPG = async () => {
    if (!chartRef.current || isTable) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, scrollY: -window.scrollY });
    canvas.toBlob((blob) => saveAs(blob, "Plot Extraction.jpg"), "image/jpeg", 0.95);
  };

  const renderChart = () => {
    const e = selected;
    if (e.type === "status") {
      const statuses = d.diversity.map((r) => r[e.pair.statusKey]).filter(Boolean);
      return <SharePie entity={e} slices={["Typical", "Divergent"].map((name) => ({
        name, count: statuses.filter((s) => s === name).length, color: STATUS_COLORS[name],
      }))} />;
    }
    const threshold = e.type === "diff" && filters.thresholdEnabled ? Number(ndiv) : null;
    return <SeriesChart entity={e} series={seriesOf(e)} props={props} threshold={threshold} showNegative={false} legend={false} />;
  };

  const renderChartTable = () => {
    const e = selected;
    if (e.type === "status") {
      return <DataTable headers={["PP ID", e.pair.label, "Status"]} rows={d.diversity.map((r) => [r.ppId, fmt3(r[e.pair.key]), r[e.pair.statusKey] ?? "-"])} />;
    }
    return <PPTables series={seriesOf(e)} valueLabel={e.type === "load" ? e.column : e.pair.label} showNegative={false} />;
  };

  return (
    <>
      {extracting && <DownloadLoader title="Extracting Tables..." message="Collecting the neuro tools tables of all candidates in the capsule." />}
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className="pl-2 text-md">Entity Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>

      <div className="flex flex-1 min-h-100 w-full my-2 min-w-0">
        {/* Section 1: Tables & Plots list, Section 2: tabs (full width when the table is selected) */}
        <div className={`${isTable ? "w-full" : "w-6/12 lg:w-4/12"} flex flex-col border-2 h-full border-gray-200 p-1 min-w-0`}>
          <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
            <h2 className="text-sm font-semibold">Tables & Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={extract} disabled={extracting} title="Extract Tables" className="text-blue-600 hover:text-blue-800 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button onClick={() => resetFilters?.()} title="Reset Filter" className="text-blue-600 hover:text-blue-800 cursor-pointer">
                <RefreshCw className="w-4 h-4 hover:text-green-600" />
              </button>
              <div className="relative">
                <button onClick={() => setShowExport(!showExport)} title="Export Graph" className="text-blue-600 hover:text-blue-800 cursor-pointer pt-2">
                  <FolderOutput className="w-4 h-4" />
                </button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px]">
                    <button
                      disabled={isTable}
                      onClick={() => { exportJPG(); setShowExport(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm disabled:text-gray-400"
                    >
                      Export as JPG
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden w-full my-1 flex flex-col">
            <div className="h-[35%] flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                  <div className="col-span-10 px-1 py-1 text-left">Entities</div>
                  <div className="col-span-2 py-1 text-left">ID</div>
                </div>
                {entities.map((e) => (
                  <div
                    key={e.name}
                    title={e.name}
                    onClick={() => { setSelected(e); if (e.type !== "table") setChartTab("Table"); }}
                    className={`grid grid-cols-12 items-center px-2 py-1 cursor-pointer ${selected?.name === e.name ? "bg-gray-100" : "hover:bg-gray-200"}`}
                  >
                    <div className="col-span-10 text-xs text-gray-700 truncate">{e.icon || "🔵"} {e.name}</div>
                    <div className="col-span-2 pl-1 text-xs text-gray-400">{e.displayId}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[65%] flex flex-col border border-gray-200 min-h-0">
              <div className="flex space-x-2 border-b p-2">
                {(isTable ? TABLE_TABS : ["Property Editor", "Table"]).map((t) => (
                  <button key={t} className={tabBtn(isTable ? tableTab === t : chartTab === t)} onClick={() => (isTable ? setTableTab(t) : setChartTab(t))}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-2 min-h-0 mb-8">
                {isTable && models[tableTab] && <DataTable headers={models[tableTab].headers} rows={models[tableTab].rows} />}
                {isTable && tableTab === "Anatomy" && (
                  <div className="mb-4 flex items-center gap-4 text-xs">
                    <select value={lobe} onChange={(e) => setLobe(e.target.value)} className="w-full max-w-xs border border-gray-300 rounded px-2 py-1 uppercase">
                      <option value="" disabled>Select a lobe</option>
                      {LOBE_IMAGES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <button onClick={() => (lobe ? setShowImage(true) : alert("Please select a lobe first"))} className="px-3 py-2 text-xs bg-gray-200 text-black hover:bg-gray-300 whitespace-nowrap">
                      Show Image
                    </button>
                  </div>
                )}
                {!isTable && chartTab === "Property Editor" && (
                  selected.type === "status"
                    ? <div className="text-sm text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>
                    : <PropertyEditor properties={props} onChange={setProps} selectedChart={selected} />
                )}
                {!isTable && chartTab === "Table" && <div className="text-sm text-gray-600 mt-2 w-full space-y-10">{renderChartTable()}</div>}
              </div>
            </div>
          </div>
        </div>

        {!isTable && (
          <div className="w-6/12 lg:w-9/12 flex flex-col h-full bg-white min-w-0">
            <div className="flex-1 flex flex-col" ref={chartRef}>{renderChart()}</div>
          </div>
        )}
      </div>

=======
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
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
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
<<<<<<< HEAD
    </>
=======
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
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
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

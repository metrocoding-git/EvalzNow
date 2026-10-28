"use client";
import React, { useEffect, useRef, useState } from "react";
import { FolderOutput, RefreshCw } from "lucide-react";
import { saveAs } from "file-saver";
import { html2canvas } from "@/lib/exportLibs";
import PropertyEditor from "../components/PropertyEditor";
import { DEFAULT_CHART_PROPERTIES } from "./charts";

/**
 * "Plot Selections" area of a capsule analytics screen – same layout as the unit Plot Selections:
 * Plots list (Entities / ID) + Property Editor / Table tabs on the left, chart on the right.
 *
 * entities: [{ name, type, icon? }]
 * renderChart(entity, chartProperties) → chart JSX
 * renderTable(entity) → table JSX (or a string message)
 * extraTabs: [{ label, render(entity) }]
 */
export default function PlotPanel({
  entities, renderChart, renderTable, extraTabs = [], onReset, level, title = "Plot Selections",
  propertyEditorTypes = ["line", "scatter"], tableAtCapsuleLevel = false,
}) {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("Table");
  const [props, setProps] = useState(DEFAULT_CHART_PROPERTIES);
  const [showExport, setShowExport] = useState(false);
  const chartRef = useRef(null);

  // Keep the selection when switching levels if the same entity exists there
  useEffect(() => {
    setSelected((cur) => (cur ? entities.find((e) => e.name === cur.name) || null : null));
  }, [entities]);

  const exportJPG = async () => {
    if (!chartRef.current || !selected) { alert("No chart available to export"); return; }
    try {
      const el = chartRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false, scrollY: -window.scrollY });
      canvas.toBlob((blob) => saveAs(blob, "Plot Extraction.jpg"), "image/jpeg", 0.95);
    } catch (err) {
      alert("Failed to export as JPG: " + err.message);
    }
  };

  const tabs = ["Property Editor", "Table", ...extraTabs.map((t) => t.label)];
  const tabBtn = (label) => (
    <button
      key={label}
      className={`px-3 py-1 text-sm cursor-pointer ${tab === label
        ? "text-black bg-white border-t-2 border-blue-400 shadow-sm"
        : "text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white"}`}
      onClick={() => setTab(label)}
    >
      {label}
    </button>
  );

  const tableContent = () => {
    if (level === "capsule" && !tableAtCapsuleLevel) {
      return <div className="text-center text-gray-400 py-4 italic">NOT AVAILABLE AT CAPSULE LEVEL</div>;
    }
    if (!selected) return <div className="text-center text-gray-400 py-4 italic">SELECT A CHART TO DISPLAY DATA</div>;
    const out = renderTable ? renderTable(selected) : null;
    if (!out) return <div className="text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>;
    return out;
  };

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className="pl-2 text-md">{title}</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex flex-1 min-h-100 w-full my-2 min-w-0">
        <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200 p-1">
          <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => onReset?.()} title="Reset Filter" className="text-blue-600 hover:text-blue-800 cursor-pointer">
                <RefreshCw className="w-4 h-4 hover:text-green-600" />
              </button>
              <div className="relative">
                <button onClick={() => setShowExport(!showExport)} title="Export Graph" className="text-blue-600 hover:text-blue-800 cursor-pointer pt-2">
                  <FolderOutput className="w-4 h-4 hover:text-blue-600" />
                </button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px]">
                    <button onClick={() => { exportJPG(); setShowExport(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                      Export as JPG
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden w-full my-2">
            <div className="h-[35%] flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                  <div className="col-span-9 px-1 py-1 text-left">Entities</div>
                  <div className="col-span-3 py-1 text-left">ID</div>
                </div>
                <div>
                  {entities.map((e, i) => (
                    <div
                      key={e.name}
                      className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer ${selected?.name === e.name ? "bg-gray-100" : "hover:bg-gray-200"}`}
                      onClick={() => setSelected(e)}
                      title={e.name}
                    >
                      <div className="col-span-9 text-xs text-gray-700 truncate">{e.icon || "🔵"} {e.name}</div>
                      <div className="col-span-3 pl-3 text-xs text-gray-400">{e.displayId ?? i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[65%] flex flex-col border border-gray-200">
              <div className="flex space-x-2 border-b p-2">{tabs.map(tabBtn)}</div>
              <div className="flex-1 overflow-auto p-2 h-full mb-8">
                {tab === "Property Editor" && (
                  selected && propertyEditorTypes.includes(selected.type) ? (
                    <PropertyEditor properties={props} onChange={setProps} selectedChart={selected} />
                  ) : (
                    <div className="text-sm text-center text-gray-400 py-4 italic">NOT AVAILABLE FOR SELECTED CHART</div>
                  )
                )}
                {tab === "Table" && (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto min-h-50 mb-10 pb-3 space-y-10">{tableContent()}</div>
                )}
                {extraTabs.map((t) => tab === t.label && <React.Fragment key={t.label}>{t.render(selected)}</React.Fragment>)}
              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col h-full bg-white min-w-0">
          <div className="h-full overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col" ref={chartRef}>
              {selected ? renderChart(selected, props) : (
                <div className="flex justify-center h-full text-gray-400 text-lg">SELECT PLOT</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

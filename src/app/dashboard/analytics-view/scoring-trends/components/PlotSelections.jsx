"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Search,
  X,
  RefreshCw,
  FolderOutput,
} from "lucide-react";
import ScoringCriteria from "./ScoringCriteria";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Area,
} from "recharts";
import PropertyEditor from "../../components/PropertyEditor";
import { getScoringCriteriaByUnitId } from "@/services/scoringCriteriaService";
import { getAttainedScoreSummary, getMaxScoresSummary, getScoringTrendsSummary } from "@/services/scoringTrendsService";
import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';

const COMPETENCY_COLORS = {
  Listening:  "#3b82f6",
  Reading:    "#10b981",
  Writing:    "#f59e0b",
  Speaking:   "#ef4444",
  Theory:     "#8b5cf6",
  Practice:   "#06b6d4",
  Productive: "#f97316",
  Receptive:  "#84cc16",
  Acuity:     "#ec4899",
  Unknown:    "#6b7280",
};

export default function PlotSelections({ filters, unitId, environment, candidateId, onResetFilters }) {
  const [curves, setCurves] = useState([
    { id: 1, name: "curve1" },
    { id: 2, name: "curve2" },
    { id: 3, name: "curve3" },
    { id: 4, name: "curve4" },
    { id: 5, name: "curve5" },
    { id: 6, name: "curve6" },
    { id: 7, name: "curve7" },
    { id: 8, name: "curve8" },
    { id: 9, name: "curve9" },
    { id: 10, name: "curve10" },
    { id: 11, name: "curve11" },
    { id: 12, name: "curve12" },
  ]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);
  const chartInnerRef = useRef(null);
  const floatChartData = [
    { name: "Jan", xValue: 1.2, yValue: 2.1, zValue: 0.9 },
    { name: "Feb", xValue: 2.8, yValue: 1.4, zValue: 1.6 },
    { name: "Mar", xValue: 1.5, yValue: 2.9, zValue: 2.2 },
    { name: "Apr", xValue: 3.1, yValue: 3.0, zValue: 2.7 },
    { name: "May", xValue: 2.0, yValue: 1.8, zValue: 3.1 },
    { name: "Jun", xValue: 2.6, yValue: 2.2, zValue: 3.4 },
  ];

  const [chartProperties, setChartProperties] = useState({
    // Standard
    positiveVisibility: true,
    negativeVisibility: true,
    layer: 1,
    reference: false,

    // Curve Label
    showLabel: true,
    labelType: "X Type",

    // Line Attribute
    lineStyle: "solid",
    lineColor: "#3b82f6",
    lineThickness: 2,
    positiveLineStyle: "solid",
    positiveLineThickness: 2,
    negativeLineStyle: "solid",
    negativeLineThickness: 2,

    // Symbol Attribute
    symbolStyle: "circle",
    symbolColor: "#3b82f6",
    positiveSymbolColor: "#10b981",
    negativeSymbolColor: "#ef4444",
    symbolFrequency: 1,
    symbolScaleSize: 3,

    // Shade area
    shadeArea: "#ffffff",
    positiveLineColor: "#10b981",
    negativeLineColor: "#ef4444",
  });

  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("IndirectPerformancePoint");
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] =
    useState("Table");

  const canvasRef = useRef(null);
  const chartContainerRef = useRef(null);

  const data = [
    { name: "A", uv: 400, pv: 240 },
    { name: "B", uv: 300, pv: 139 },
    { name: "C", uv: 200, pv: 980 },
  ];

  const [showExportMenu, setShowExportMenu] = useState(false);

  const [chart, setChart] = useState([
    { name: "Communication (MC1) vs. Insert Score Row Counter", key: "mc1", icon: "🔵", id: "1" },
    { name: "Intelligence (MC2) vs. Insert Score Row Counter", key: "mc2", icon: "🔵", id: "2" },
    { name: "Responsiveness (MC3) vs. Insert Score Row Counter ", key: "mc3", icon: "🔵", id: "3" },
    { name: "Efficiency (MC4) vs. Insert Score Row Counter ", key: "mc4", icon: "🔵", id: "4" },
    { name: "Adaptation (MC5) vs. Insert Score Row Counter ", key: "mc5", icon: "🔵", id: "5" },
    { name: "Accuracy (MC6) vs. Insert Score Row Counter ", key: "mc6", icon: "🔵", id: "6" },
    { name: "Verbal Reasoning (MC7) vs. Insert Score Row Counter ", key: "mc7", icon: "🔵", id: "7" },
    { name: "Spatial Reasoning (MC8) vs. Insert Score Row Counter ", key: "mc8", icon: "🔵", id: "8" },
    { name: "Numerical Reasoning (MC9) vs. Insert Score Row Counter ", key: "mc9", icon: "🔵", id: "9" },
    { name: "Problem Solving (MC10) vs. Insert Score Row Counter", key: "mc10", icon: "🔵", id: "10" },
    { name: "Memory (MC11) vs. Insert Score Row Counter", key: "mc11", icon: "🔵", id: "11" },
    { name: "Data Checking (MC12) vs. Insert Score Row Counter ", key: "mc12", icon: "🔵", id: "12" },
    { name: "Work Sampling (MC13) vs. Insert Score Row Counter", key: "mc13", icon: "🔵", id: "13" },
    { name: "Quality of Work (MC14) vs. Insert Score Row Counter", key: "mc14", icon: "🔵", id: "14" },
    { name: "Resourcefulness (MC15) vs. Insert Score Row Counter ", key: "mc15", icon: "🔵", id: "15" },
    { name: "Following Instructions (MC16) vs. Insert Score Row Counter ", key: "mc16", icon: "🔵", id: "16" },
    { name: "Working in Teams (MC17) vs. Insert Score Row Counter", key: "mc17", icon: "🔵", id: "17" },
    { name: "Working Alone (MC18) vs. Insert Score Row Counter", key: "mc18", icon: "🔵", id: "18" },
    { name: "Initiative (MC19) vs. Insert Score Row Counter", key: "mc19", icon: "🔵", id: "19" },
    { name: "Sick/Injury Avoidance (MC20) vs. Insert Score Row Counter ", key: "mc20", icon: "🔵", id: "20" },
    { name: "Attained Score vs. PP ID ", key: "attained", icon: "🔵", id: "21" },
    { name: "Maximum Score vs. PP ID ", key: "max", icon: "🔵", id: "22" }
  ]);

  const [selectedChart, setSelectedChart] = useState(chart[0]);
  const [customCriteria, setCustomCriteria] = useState([]);

  const [scoringData, setScoringData] = useState(null);
  const [positiveScoringData, setPositiveScoringData] = useState(null);
  const [negativeScoringData, setNegativeScoringData] = useState(null);
  const [attainedScoreData, setAttainedScoreData] = useState(null);
  const [maxScoreData, setMaxScoreData] = useState(null);

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    const blob = await html2image.toBlob(canvasRef.current);
    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      alert("Chart copied to clipboard!");
    }
  };

  const handleDeleteCurve = () => {
    const updated = curves.filter((c) => c.id !== selectedCurveId);
    setCurves(updated);
    if (updated.length > 0) {
      setSelectedCurveId(updated[0].id);
    } else {
      setSelectedCurveId(null);
    }
  };

  useEffect(() => {
    if (chartProperties) {

    }
  }, [chartProperties.shadeArea]);

  console.log("Shade color:", chartProperties.shadeArea);

  useEffect(() => {
    const fetchCriteria = async () => {
      if (!unitId) return;
  
      try {
        const data = await getScoringCriteriaByUnitId(unitId);
        if (!Array.isArray(data)) throw new Error("Invalid scoring criteria response");
  
        const sorted = [...data].sort((a, b) => a.criteriaId - b.criteriaId);
  
        setChart((prev) => {
          const startId = 23;
          const mappedCharts = sorted.map((c, index) => ({
            name: `${c.criteria} (CC${c.criteriaId}) vs. Insert Score Row Counter (Workforce Only - Line Graph)`,
            key: `cc${index + 1}`,
            icon: "🔵",
            id: (startId + index).toString(),
          }));
        
          return [...chart.slice(0, 22), ...mappedCharts];
        });
        
        setCustomCriteria(data);
      } catch (err) {
        console.error("Failed to fetch scoring criteria:", err);
      }
    };
  
    fetchCriteria();
  }, [unitId]);

  useEffect(() => {
    const fetchScoringData = async () => {
      if (!unitId || !candidateId) return;

      try {
        const data = await getScoringTrendsSummary({
          unitId: unitId,
          candidate_id: candidateId,
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });
        setPositiveScoringData(data.positiveData);
        setNegativeScoringData(data.negativeData);
      } catch (err) {
        console.error("Failed to fetch scoring trends:", err);
      }
    };

    fetchScoringData();
  }, [unitId, filters, candidateId]);

  console.log("positive score:", positiveScoringData);
  console.log("negative score:", negativeScoringData);

  useEffect(() => {
    const fetchAttainedScoreData = async () => {
      if (!unitId || !candidateId) return;

      try {
        const data = await getAttainedScoreSummary({
          unitId: unitId,
          candidate_id: candidateId,
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });
        setAttainedScoreData(data.data);
      } catch (err) {
        console.error("Failed to fetch scoring trends:", err);
      }
    };

    fetchAttainedScoreData();
  }, [unitId, filters, candidateId]);

  useEffect(() => {
    const fetchMaxScoreData = async () => {
      if (!unitId || !candidateId) return;

      try {
        const data = await getMaxScoresSummary({
          unitId: unitId,
          candidate_id: candidateId,
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });
        setMaxScoreData(data);
      } catch (err) {
        console.error("Failed to fetch scoring trends:", err);
      }
    };

    fetchMaxScoreData();
  }, [unitId, filters, candidateId]);

  const buildXYChartData = (
    positiveData,
    negativeData,
    attainedScoreData,
    maxScoreData,
    selectedChart
  ) => {
    if (!selectedChart) return { positiveCompetencies: {}, negativeCompetencies: {} };
  
    const key = selectedChart.key;
  
    // ── Attained Score & Max Score — x = ppId, grouped by competency ──
    if (key === "attained" || key === "max") {
      const source = key === "attained"
        ? attainedScoreData
        : (maxScoreData?.data ?? attainedScoreData ?? []);
      if (!source) return { positiveCompetencies: {}, negativeCompetencies: {} };
  
      const positiveGroups = {};
      const negativeGroups = {};
  
      source.forEach((row) => {
        const comp = row.competency || "Unknown";
        const ppId = Number(row.ppId ?? 0);
        const score = key === "attained"
          ? Number(row.attainedScore ?? 0)
          : Number(row.maxScore ?? 0);
  
        const target = ppId > 0 ? positiveGroups : ppId < 0 ? negativeGroups : null;
        if (!target) return;
  
        if (!target[comp]) target[comp] = {};
        if (!target[comp][ppId]) target[comp][ppId] = { totalScore: 0, rowCount: 0 };
  
        target[comp][ppId].totalScore += score;
        target[comp][ppId].rowCount += 1;
      });
  
      const toPoints = (groups) => {
        const result = {};
        Object.entries(groups).forEach(([comp, ppIdMap]) => {
          result[comp] = Object.entries(ppIdMap)
            .map(([ppId, { totalScore, rowCount }]) => ({
              x: Number(ppId),
              y: totalScore,
              rowCount,
              ppId: Number(ppId),
              label: `${ppId}`,
              competency: comp,
            }))
            .sort((a, b) => a.x - b.x);
        });
        return result;
      };
  
      return {
        positiveCompetencies: toPoints(positiveGroups),
        negativeCompetencies: toPoints(negativeGroups),
      };
    }
  
    // ── MC / CC Charts — x = row counter (serialNo), one line per positive/negative ──
    // MC/CC only exist for Workforce environment
    if (!positiveData && !negativeData)
      return { positiveCompetencies: {}, negativeCompetencies: {} };
  
    const buildMCCCPoints = (data) => {
      if (!data) return [];
      return data
        .map((row) => {
          const val = key.startsWith("mc")
            ? row.mcValues?.[key] ?? 0
            : row.ccValues?.[key] ?? 0;
          return {
            x: Number(row.serialNo ?? 0),   // ✅ row counter as X
            y: Number(val ?? 0),
            ppId: row.ppId,
            label: `${row.ppId}`,
            rowCount: 1,
          };
        })
        .sort((a, b) => a.x - b.x);
    };
  
    // ✅ Use a fixed key name so legend shows "Positive" / "Negative"
    return {
      positiveCompetencies: positiveData?.length
        ? { "Positive": buildMCCCPoints(positiveData) }
        : {},
      negativeCompetencies: negativeData?.length
        ? { "Negative": buildMCCCPoints(negativeData) }
        : {},
    };
  };
  
  useEffect(() => {
    if (!chart || chart.length === 0) return;
  
    const visibleCharts = chart.filter((item) => {
      if (environment === "Workforce") return true;
      return ["attained", "max"].includes(item.key);
    });
  
    if (visibleCharts.length === 0) return;
  
    const isSelectedVisible = visibleCharts.some(
      (item) => item.key === selectedChart?.key
    );
  
    if (!isSelectedVisible) {
      setSelectedChart(visibleCharts[0]);
    }
  }, [environment, chart]);
  
  const { positiveCompetencies = {}, negativeCompetencies = {} } = buildXYChartData(
    positiveScoringData,
    negativeScoringData,
    attainedScoreData,
    maxScoreData,
    selectedChart
  );

  // Stable fallback colors — computed once per unique competency key, never random on re-render
const stableColorMap = useRef({});

const getStableColor = (key) => {
  if (stableColorMap.current[key]) return stableColorMap.current[key];
  const palette = [
    "#6366f1","#f59e0b","#14b8a6","#f43f5e","#8b5cf6",
    "#0ea5e9","#84cc16","#fb923c","#a78bfa","#34d399",
  ];
  const idx = Object.keys(stableColorMap.current).length % palette.length;
  stableColorMap.current[key] = palette[idx];
  return stableColorMap.current[key];
};

  // Combine all competencies for table display
  const allCompetencies = [...Object.keys(positiveCompetencies), ...Object.keys(negativeCompetencies)]
    .filter((value, index, self) => self.indexOf(value) === index);

  // Function to render dot based on symbol style
  const renderCustomDot = (props, color) => {
    const { cx, cy } = props;
    const r = chartProperties.symbolScaleSize;

    switch (chartProperties.symbolStyle) {
      case "square":
        return (
          <rect
            x={cx - r}
            y={cy - r}
            width={2 * r}
            height={2 * r}
            fill={color}
          />
        );
      case "triangle":
        return (
          <polygon
            points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`}
            fill={color}
          />
        );
      case "diamond":
        return (
          <polygon
            points={`${cx},${cy - r} ${cx - r},${cy} ${cx},${cy + r} ${cx + r},${cy}`}
            fill={color}
          />
        );
      default:
        return (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={color}
          />
        );
    }
  };

  const captureFullChart = async () => {
    const inner = chartInnerRef.current;
    const outer = chartContainerRef.current;
    if (!inner || !outer) throw new Error("Chart not found");
  
    const savedInnerHeight   = inner.style.height;
    const savedInnerMaxH     = inner.style.maxHeight;
    const savedInnerOverflow = inner.style.overflow;
    const savedInnerWidth    = inner.style.width;      // ← save width
    const savedOuterOverflow = outer.style.overflow;
    const savedOuterHeight   = outer.style.height;
  
    const captureWidth = outer.scrollWidth;            // ← lock to outer width
  
    inner.style.height   = `${inner.scrollHeight}px`;
    inner.style.maxHeight = 'none';
    inner.style.overflow = 'visible';
    inner.style.width    = `${captureWidth}px`;        // ← pin width explicitly
    outer.style.overflow = 'visible';
    outer.style.height   = `${inner.scrollHeight + 40}px`;
  
    await new Promise((r) => setTimeout(r, 400));
  
    const canvas = await html2canvas(inner, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: chartProperties.shadeArea || '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: captureWidth,                             // ← use same locked width
      height: inner.scrollHeight,
      windowWidth: captureWidth,
      windowHeight: inner.scrollHeight,
    });
  
    // Restore everything
    inner.style.height   = savedInnerHeight;
    inner.style.maxHeight = savedInnerMaxH;
    inner.style.overflow = savedInnerOverflow;
    inner.style.width    = savedInnerWidth;            // ← restore width
    outer.style.overflow = savedOuterOverflow;
    outer.style.height   = savedOuterHeight;
  
    return canvas;
  };
  
  const exportAsJPG = async () => {
    try {
      const canvas = await captureFullChart();
      canvas.toBlob(
        (blob) => saveAs(blob, `chart-${selectedChart.key}-${Date.now()}.jpg`),
        'image/jpeg',
        0.95
      );
    } catch (error) {
      console.error('JPG Export failed:', error);
      alert('Failed to export as JPG: ' + error.message);
    }
  };
  
  const exportAsPDF = async () => {
    try {
      const canvas = await captureFullChart();
      const imgData = canvas.toDataURL('image/png');
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`chart-${selectedChart.key}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to export as PDF: ' + error.message);
    }
  };
  
  console.log("Scoring Trends Data: ", scoringData);

  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className="pl-2 text-md">Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2 mx-1">
        <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200 p-1">
          <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (typeof onResetFilters === "function") {
                    onResetFilters();
                  }
                }}
                title="Reset"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 hover:text-green-600" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="Export Graph"
                  className="text-blue-600 hover:text-red-800 cursor-pointer pt-2"
                >
                  <FolderOutput className="w-4 h-4 hover:text-blue-600" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={() => {
                        exportAsJPG();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Export as JPG
                    </button>
                    {/* <button
                      onClick={() => {
                        exportAsPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Export as PDF
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden w-full my-2">
            <div className="h-[35%] flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto">
                <div className="h-full overflow-hidden flex flex-col">
                  <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm">
                    <div className="col-span-10 px-2 py-1 text-left font-medium">Entities</div>
                    <div className="col-span-2 py-1 text-left font-medium">ID</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {chart
                      .filter((item) => {
                        if (environment === "Workforce") return true;
                        return ["attained", "max"].includes(item.key);
                      })
                      .map((item, index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-12 hover:bg-gray-200 cursor-pointer ${
                            selectedChart.name === item.name ? "bg-gray-100" : ""
                          }`}
                          onClick={() => setSelectedChart(item)}
                        >
                          <div className="col-span-10 px-2 py-1 whitespace-nowrap text-xs">
                            <div className="flex items-center">
                              <span className="truncate">{item.icon} {item.name}</span>
                            </div>
                          </div>
                          <div className="col-span-2 px-3 py-1 whitespace-nowrap text-xs">
                            {index + 1}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[65%] flex flex-col border border-gray-200">
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeAdjustPropertieTab === "Property editor"
                      ? "text-black bg-white border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => setActiveAdjustPropertieTab("Property editor")}
                >
                  Property editor
                </button>
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeAdjustPropertieTab === "Table"
                      ? "text-black bg-white border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => setActiveAdjustPropertieTab("Table")}
                >
                  Table
                </button>
              </div>

              <div className="flex-1 overflow-auto p-2 h-full">
                {activeAdjustPropertieTab === "Property editor" && (
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {activeAdjustPropertieTab === "Table" && (
                  <div className="text-xs text-gray-600 mt-2 w-full overflow-auto min-h-50 mb-7 pb-3">
                    {(() => {
                      const isAttainedMax = ["attained", "max"].includes(selectedChart?.key);

                      const renderTable = (title, competencies, textColor) => {
                        if (Object.keys(competencies).length === 0) return null;
                        return (
                          <div className="mb-6">
                            <h3 className={`text-sm font-semibold mb-2 px-2 py-1 rounded text-gray-700`}>
                              {title}
                            </h3>
                            <table className="table-auto w-full text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">
                                    {isAttainedMax ? "PP ID" : "Row Counter"}
                                  </th>
                                  {isAttainedMax && (
                                    <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">
                                      Row Count
                                    </th>
                                  )}
                                  {!isAttainedMax && (
                                    <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">
                                      PP ID
                                    </th>
                                  )}
                                  <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">
                                    {isAttainedMax ? "Competency" : selectedChart?.key?.toUpperCase()}
                                  </th>
                                  {/* <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">
                                    Value
                                  </th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(competencies).flatMap(([comp, points]) =>
                                  points.map((row, idx) => (
                                    <tr key={`${comp}-${idx}`} className="hover:bg-blue-50">
                                      <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">
                                        {row.x}
                                      </td>
                                      {isAttainedMax && (
                                        <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">
                                          {row.rowCount}
                                        </td>
                                      )}
                                      {!isAttainedMax && (
                                        <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">
                                          {row.ppId}
                                        </td>
                                      )}
                                      <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1"
                                          style={{ color: isAttainedMax ? (COMPETENCY_COLORS[comp] || "#6b7280") : "#374151", fontWeight: isAttainedMax ? "500" : "400" }}>
                                        {isAttainedMax ? comp : selectedChart?.key?.toUpperCase()}
                                      </td>
                                      {/* <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1">
                                        {row.y.toFixed(2)}
                                      </td> */}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        );
                      };

                      return (
                        <>
                          {renderTable("Positive PP IDs", positiveCompetencies)}
                          {renderTable("Negative PP IDs", negativeCompetencies)}
                          {Object.keys(positiveCompetencies).length === 0 && Object.keys(negativeCompetencies).length === 0 && (
                            <div className="text-center text-gray-500 py-4">No data available</div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div ref={chartContainerRef} className={`w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 ml-1`} 
          style={{ backgroundColor: chartProperties.shadeArea }}>
          <div ref={chartInnerRef} className="h-full overflow-auto mx-5 mt-5 mb-2">
            <h2
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "1.125rem",
                color: "#374151",
                marginBottom: "1rem",
                width: "100%",
                display: "block",
              }}
            >
              {selectedChart.icon} {selectedChart.name}
            </h2>
            <div className="w-full aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  key={
                    chartProperties.positiveLineColor +
                    chartProperties.negativeLineColor +
                    chartProperties.positiveLineStyle +
                    chartProperties.negativeLineStyle +
                    chartProperties.symbolStyle +
                    chartProperties.symbolScaleSize +
                    chartProperties.shadeArea +
                    selectedChart.key
                  }
                  margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    allowDecimals={false}
                    label={{
                      value: ["attained", "max"].includes(selectedChart?.key)
                        ? "PP ID"
                        : "Row Counter",
                      position: "insideBottom",
                      offset: -10
                    }}
                  />

                  <YAxis
                    type="number"
                    dataKey="y"
                    label={{
                      value: `${selectedChart.key === "attained" ? "Attained Score" : 
                              selectedChart.key === "max" ? "Max Score" : 
                              selectedChart.key}`,
                      angle: -90,
                      position: "insideLeft",
                      textAnchor: "middle",
                    }}
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const isAttainedMax = ["attained", "max"].includes(selectedChart?.key);
                      return (
                        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
                          <p style={{ fontWeight: 600, marginBottom: 4 }}>
                            {isAttainedMax ? `PP ID: ${label}` : `Row: ${label}`}
                          </p>
                          {payload.map((entry, i) => {
                            const point = entry.payload;
                            return (
                              <div key={i} style={{ color: entry.stroke, marginBottom: 2 }}>
                                <span>{entry.name}: {Number(entry.value).toFixed(2)}</span>
                                {point?.rowCount !== undefined && point.rowCount > 1 && (
                                  <span style={{ color: "#6b7280", marginLeft: 6 }}>
                                    ({point.rowCount} rows)
                                  </span>
                                )}
                                {!isAttainedMax && point?.ppId !== undefined && (
                                  <span style={{ color: "#6b7280", marginLeft: 6 }}>
                                    PP ID: {point.ppId}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 30, paddingLeft: 50 }}
                  />

                  {/* Draw lines for each competency in positive PP IDs */}
                  {Object.entries(positiveCompetencies).map(([comp, points]) => {
                    const color = COMPETENCY_COLORS[comp] || getStableColor(`positive-${comp}`);
                    const isSimple = comp === "Positive"; // MC/CC case
                    return (
                      <Line
                        key={`positive-${comp}`}
                        type="linear"
                        data={points}
                        dataKey="y"
                        name={isSimple ? "Positive" : `Positive: ${comp}`}
                        stroke={color}
                        strokeDasharray={chartProperties.positiveLineStyle === "dashed" ? "6 4"
                          : chartProperties.positiveLineStyle === "dotted" ? "2 4"
                          : chartProperties.positiveLineStyle === "dashdot" ? "8 4 2 4"
                          : "0"}
                        strokeWidth={chartProperties.positiveLineThickness || 2}
                        isAnimationActive={false}
                        hide={!chartProperties.positiveVisibility}
                        dot={(props) => {
                          const { index } = props;
                          if (index % (chartProperties.symbolFrequency || 1) !== 0) return null;
                          return renderCustomDot(props, color);
                        }}
                      />
                    );
                  })}

                  {/* Draw lines for each competency in negative PP IDs */}
                  {Object.entries(negativeCompetencies).map(([comp, points]) => {
                    const color = COMPETENCY_COLORS[comp] || getStableColor(`negative-${comp}`);
                    const isSimple = comp === "Negative"; // MC/CC case
                    return (
                      <Line
                        key={`negative-${comp}`}
                        type="linear"
                        data={points}
                        dataKey="y"
                        name={isSimple ? "Negative" : `Negative: ${comp}`}
                        stroke={color}
                        strokeDasharray={chartProperties.negativeLineStyle === "dashed" ? "6 4"
                          : chartProperties.negativeLineStyle === "dotted" ? "2 4"
                          : chartProperties.negativeLineStyle === "dashdot" ? "8 4 2 4"
                          : "0"}
                        strokeWidth={chartProperties.negativeLineThickness || 2}
                        isAnimationActive={false}
                        hide={!chartProperties.negativeVisibility}
                        dot={(props) => {
                          const { index } = props;
                          if (index % (chartProperties.symbolFrequency || 1) !== 0) return null;
                          return renderCustomDot(props, color);
                        }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {ScoreAdd && (
        <div className="overflow-auto my-2">
          <ScoringCriteria onClose={() => setScoreAdd(false)} />
        </div>
      )}
    </>
  );
}
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
// import PropertyEditor from "../../components/PropertyEditor";
import { getScoringCriteriaByUnitId } from "@/services/scoringCriteriaService";
import { getAttainedScoreSummary, getMaxScoresSummary, getScoringTrendsSummary } from "@/services/scoringTrendsService";
import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import PropertyEditor from "./PropertyEditor";

const COMPETENCY_COLORS = {
  Listening: "#3b82f6",
  Reading: "#10b981",
  Writing: "#f59e0b",
  Speaking: "#ef4444",
  Theory: "#8b5cf6",
  Practice: "#06b6d4",
  Productive: "#f97316",
  Receptive: "#84cc16",
  Acuity: "#ec4899",
  Unknown: "#6b7280",
};

export default function PlotSelections({ filters, unitId, environment, candidateId, onResetFilters, unitType }) {
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
    positiveAttainedVisibility: true,
    positiveMaxVisibility: true,
    negativeAttainedVisibility: true,
    negativeMaxVisibility: true,
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


    positiveAttainedLineColor: "#10b981",
    positiveMaxLineColor: "#3b82f6",
    negativeAttainedLineColor: "#ef4444",
    negativeMaxLineColor: "#f59e0b",
    positiveAttainedLineStyle: "solid",
    positiveMaxLineStyle: "solid",
    negativeAttainedLineStyle: "solid",
    negativeMaxLineStyle: "solid",
    positiveAttainedLineThickness: 2,
    positiveMaxLineThickness: 2,
    negativeAttainedLineThickness: 2,
    negativeMaxLineThickness: 2,
    positiveAttainedVisibility: true,
    positiveMaxVisibility: true,
    negativeAttainedVisibility: true,
    negativeMaxVisibility: true,
  });

  const SCORE_SHORTCUTS = {
    listening: { attained: "ALS", max: "MLS" },
    reading: { attained: "ARS", max: "MRS" },
    speaking: { attained: "ASP", max: "MSS" },
    writing: { attained: "AWS", max: "MWS" },
    theory: { attained: "ATS", max: "MTS" },
    practical: { attained: "APS", max: "MPS" },
    receptive: { attained: "ARVS", max: "MRVS" },
    productive: { attained: "APVS", max: "MPVS" },
    acuity: { attained: "AAVS", max: "MAVS" },
  };

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
    // { name: "Attained Score vs. PP ID ", key: "attained", icon: "🔵", id: "21" },
    // { name: "Maximum Score vs. PP ID ", key: "max", icon: "🔵", id: "22" },

    ...(unitType === "Communicative I/O" ? [
      { name: "Listening Scores vs PP ID", key: "listening", icon: "🔵", id: "21" },
      { name: "Reading Scores vs PP ID", key: "reading", icon: "🔵", id: "22" },
      { name: "Speaking Scores vs PP ID", key: "speaking", icon: "🔵", id: "23" },
      { name: "Writing Scores vs PP ID", key: "writing", icon: "🔵", id: "24" }
    ] : unitType === "Theory & Practice" ? [
      { name: "Theory-Based Scores vs PP ID", key: "theory", icon: "🔵", id: "21" },
      { name: "Practical Scores vs PP ID", key: "practical", icon: "🔵", id: "22" }
    ] : [
      { name: "Receptive Scores vs PP ID", key: "receptive", icon: "🔵", id: "21" },
      { name: "Productive Scores vs PP ID", key: "productive", icon: "🔵", id: "22" },
      { name: "Acuity Scores vs PP ID", key: "acuity", icon: "🔵", id: "23" }
    ])
  ]);

  const [selectedChart, setSelectedChart] = useState(null);
  const COMPETENCY_KEYS = [
    "listening", "reading", "speaking", "writing",
    "theory", "practical", "receptive", "productive", "acuity",
  ];

  const isCompetencyChart = COMPETENCY_KEYS.includes(selectedChart?.key);
  const [customCriteria, setCustomCriteria] = useState([]);

  const [scoringData, setScoringData] = useState(null);
  const [positiveScoringData, setPositiveScoringData] = useState(null);
  const [negativeScoringData, setNegativeScoringData] = useState(null);
  const [attainedScoreData, setAttainedScoreData] = useState(null);
  const [maxScoreData, setMaxScoreData] = useState(null);

  const getLegendName = (comp, isNegative = false) => {
    const key = selectedChart?.key;

    //  If competency chart
    if (SCORE_SHORTCUTS[key]) {
      const short = SCORE_SHORTCUTS[key][comp]; // ALS / MLS etc
      const prefix = isNegative ? "Negative PP ID" : "Positive PP ID";
      return `${prefix}: ${short}`;
    }

    //  MC / CC fallback
    return isNegative ? "Negative PP IDs" : "Positive PP IDs";
  };

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
          // 1. MC items (fixed)
          const mcItems = prev.filter(item => item.key.startsWith("mc"));

          // 2. Conditional items (NOT mc and NOT cc)
          const conditionalItems = prev.filter(
            item =>
              !item.key.startsWith("mc") &&
              !item.key.startsWith("cc")
          );

          // 3. Build CC items
          const mappedCharts = sorted.map((c, index) => ({
            name: `${c.criteria} (CC${c.criteriaId + 20}) vs. Insert Score Row Counter`,
            key: `cc${index + 1}`,
            icon: "🔵",
            id: (mcItems.length + index + 1).toString(),
          }));

          // ✅ Final order: MC → CC → Conditional
          return [...mcItems, ...mappedCharts, ...conditionalItems];
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
    const CONDITIONAL_MAP = {
      listening: "Listening",
      reading: "Reading",
      speaking: "Speaking",
      writing: "Writing",
      theory: "Theory",
      practical: "Practice",
      receptive: "Receptive",
      productive: "Productive",
      acuity: "Acuity",
    };

    if (CONDITIONAL_MAP[key]) {
      const source = attainedScoreData || [];
      if (!source.length) return { positiveCompetencies: {}, negativeCompetencies: {} };

      const selectedCompetency = CONDITIONAL_MAP[key];

      const positive = {};
      const negative = {};

      source.forEach((row) => {
        if (row.competency !== selectedCompetency) return;

        const ppId = Number(row.ppId ?? 0);

        const target =
          ppId > 0 ? positive :
            ppId < 0 ? negative :
              null;

        if (!target) return;

        //  Create 2 lines per side
        if (!target["attained"]) target["attained"] = [];
        if (!target["max"]) target["max"] = [];

        target["attained"].push({
          x: ppId,
          y: Number(row.attainedScore ?? 0),
          label: `${ppId}`,
          ppId,
          rowCount: Number(row.count ?? 1),
        });

        target["max"].push({
          x: ppId,
          y: Number(row.maxScore ?? 0),
          label: `${ppId}`,
          ppId,
          rowCount: Number(row.count ?? 1),
        });
      });

      const sortPoints = (obj, isNegative = false) => {
        const result = {};
        Object.entries(obj).forEach(([k, arr]) => {
          result[k] = arr.sort((a, b) =>
            isNegative ? b.x - a.x : a.x - b.x
          );
        });
        return result;
      };

      return {
        positiveCompetencies: sortPoints(positive, false),
        negativeCompetencies: sortPoints(negative, true),
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
            x: Number(row.serialNo ?? 0),   //  row counter as X
            y: Number(val ?? 0),
            ppId: row.ppId,
            label: `${row.ppId}`,
            rowCount: 1,
          };
        })
        .sort((a, b) => a.x - b.x);
    };

    //  Use a fixed key name so legend shows "Positive" / "Negative"
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
      setSelectedChart(null);
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
      "#6366f1", "#f59e0b", "#14b8a6", "#f43f5e", "#8b5cf6",
      "#0ea5e9", "#84cc16", "#fb923c", "#a78bfa", "#34d399",
    ];
    const idx = Object.keys(stableColorMap.current).length % palette.length;
    stableColorMap.current[key] = palette[idx];
    return stableColorMap.current[key];
  };

  // Combine all competencies for table display
  const allCompetencies = [...Object.keys(positiveCompetencies), ...Object.keys(negativeCompetencies)]
    .filter((value, index, self) => self.indexOf(value) === index);

  // Function to render dot based on symbol style
  const renderCustomDot = (props, lineColor, isNegative = false) => {
    const { cx, cy } = props;
    const r = chartProperties.symbolScaleSize;
    const finalColor = chartProperties.symbolColor ||
      lineColor; // fallback

    // optional advanced (if you later add separate colors)
    const symbolColor = isNegative ? chartProperties.negativeSymbolColor || finalColor
      : chartProperties.positiveSymbolColor || finalColor;
    switch (chartProperties.symbolStyle) {
      case "square":
        return (
          <rect
            x={cx - r}
            y={cy - r}
            width={2 * r}
            height={2 * r}
            fill={symbolColor}
          />
        );
      case "triangle":
        return (
          <polygon
            points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`}
            fill={symbolColor}
          />
        );
      case "diamond":
        return (
          <polygon
            points={`${cx},${cy - r} ${cx - r},${cy} ${cx},${cy + r} ${cx + r},${cy}`}
            fill={symbolColor}
          />
        );
      default:
        return (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={symbolColor}
          />
        );
    }
  };

  const captureFullChart = async () => {
    const inner = chartInnerRef.current;
    const outer = chartContainerRef.current;
    if (!inner || !outer) throw new Error("Chart not found");

    const savedInnerHeight = inner.style.height;
    const savedInnerMaxH = inner.style.maxHeight;
    const savedInnerOverflow = inner.style.overflow;
    const savedInnerWidth = inner.style.width;      // ← save width
    const savedOuterOverflow = outer.style.overflow;
    const savedOuterHeight = outer.style.height;

    const captureWidth = outer.scrollWidth;            // ← lock to outer width

    inner.style.height = `${inner.scrollHeight}px`;
    inner.style.maxHeight = 'none';
    inner.style.overflow = 'visible';
    inner.style.width = `${captureWidth}px`;        // ← pin width explicitly
    outer.style.overflow = 'visible';
    outer.style.height = `${inner.scrollHeight + 40}px`;

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
    inner.style.height = savedInnerHeight;
    inner.style.maxHeight = savedInnerMaxH;
    inner.style.overflow = savedInnerOverflow;
    inner.style.width = savedInnerWidth;            // ← restore width
    outer.style.overflow = savedOuterOverflow;
    outer.style.height = savedOuterHeight;

    return canvas;
  };


  const getYAxisDynamicLabel = () => {
    if (!selectedChart) return "";

    const key = selectedChart.key;

    // Competency charts
    const CONDITIONAL_MAP = {
      listening: "Listening Score",
      reading: "Reading Score",
      speaking: "Speaking Score",
      writing: "Writing Score",
      theory: "Theory Score",
      practical: "Practical Score",
      receptive: "Receptive Score",
      productive: "Productive Score",
      acuity: "Acuity Score",
    };

    if (CONDITIONAL_MAP[key]) {
      return CONDITIONAL_MAP[key];
    }

    //  CC charts
    if (key.startsWith("cc")) {
      return selectedChart.name.replace(" vs. Insert Score Row Counter", "");
    }

    //  MC charts
    if (key.startsWith("mc")) {
      const item = chart.find(c => c.key === selectedChart?.key);
      if (!item) return selectedChart.key;

      const match = item.name.match(/^(.*?)\s*\((MC\d+)\)/);
      return match ? `${match[1]} (${match[2]})` : item.name;
    }

    return "";
  };

  const getShortcutLabels = () => {
    const key = selectedChart?.key;
    if (!SCORE_SHORTCUTS[key]) return null;

    return SCORE_SHORTCUTS[key];
    // { attained: "ALS", max: "MLS" }
  };

  const exportAsJPG = async () => {
    try {
      const canvas = await captureFullChart();
      canvas.toBlob(
        (blob) => saveAs(blob, `Plot Extraction.jpg`),
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
                title="Reset Filter"
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

                        return [
                          "attained",
                          "max",
                          "listening",
                          "reading",
                          "speaking",
                          "writing",
                          "theory",
                          "practical",
                          "receptive",
                          "productive",
                          "acuity"
                        ].includes(item.key);
                      })
                      .map((item, index) => (
                        <div
                          key={index}
                          className={`grid grid-cols-12 hover:bg-gray-200 cursor-pointer ${selectedChart?.name === item.name ? "bg-gray-200" : ""
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
                  Property Editor
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
                    selectedChart={selectedChart}
                  />
                )}

                {activeAdjustPropertieTab === "Table" && (
                  <div className="text-xs text-gray-600 mt-2 w-full overflow-auto min-h-50 mb-7 pb-3">
                    {(() => {
                      const isAttainedMax = ["attained", "max"].includes(selectedChart?.key);

                      const renderTable = (title, competencies) => {
                        if (Object.keys(competencies).length === 0) return null;

                        const isConditional = SCORE_SHORTCUTS[selectedChart?.key];
                        const shortcut = getShortcutLabels();

                        // For conditional charts, merge attained and max scores by PP ID
                        if (isConditional) {
                          // Merge attained and max data by PP ID
                          const mergedData = new Map();

                          Object.entries(competencies).forEach(([comp, points]) => {
                            points.forEach(point => {
                              const ppId = point.ppId;
                              if (!mergedData.has(ppId)) {
                                mergedData.set(ppId, {
                                  ppId: ppId,
                                  rowCount: point.rowCount ?? 1,
                                  attainedScore: null,
                                  maxScore: null
                                });
                              }

                              const record = mergedData.get(ppId);
                              if (comp === "attained") {
                                record.attainedScore = point.y;
                              } else if (comp === "max") {
                                record.maxScore = point.y;
                              }
                            });
                          });

                          // Convert to array and sort by PP ID
                          const mergedArray = Array.from(mergedData.values());

                          // Sort positive ascending, negative descending
                          const isNegative = title.includes("Negative");
                          mergedArray.sort((a, b) => isNegative ? b.ppId - a.ppId : a.ppId - b.ppId);

                          return (
                            <div className="mb-6">
                              <h3 className="text-sm font-semibold mb-2 px-2 py-1 rounded text-gray-700">
                                {title}
                              </h3>
                              <table className="table-auto w-full text-xs">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="border px-2 py-1">PP ID</th>
                                    <th className="border px-2 py-1">Row Count</th>
                                    <th className="border px-2 py-1">{shortcut?.attained || "Attained"}</th>
                                    <th className="border px-2 py-1">{shortcut?.max || "Max"}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {mergedArray.map((row, idx) => (
                                    <tr key={`${title}-${idx}`} className="hover:bg-blue-50">
                                      <td className="border px-2 py-1 text-center">{row.ppId}</td>
                                      <td className="border px-2 py-1 text-center">{row.rowCount}</td>
                                      <td className="border px-2 py-1 text-center">
                                        {row.attainedScore !== null ? Number(row.attainedScore).toFixed(2) : "-"}
                                      </td>
                                      <td className="border px-2 py-1 text-center">
                                        {row.maxScore !== null ? Number(row.maxScore).toFixed(2) : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }

                        // Original MC/CC table rendering (unchanged)
                        return (
                          <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-2 px-2 py-1 rounded text-gray-700">
                              {title}
                            </h3>
                            <table className="table-auto w-full text-xs">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border px-2 py-1 text-center">Row Counter</th>
                                  <th className="border px-2 py-1 text-center">PP ID</th>
                                  <th className="border px-2 py-1 text-center">
                                    {selectedChart?.key?.startsWith("cc")
                                      ? `CC${Number(selectedChart.key.replace("cc", "")) + 20}`
                                      : selectedChart?.key?.toUpperCase()}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(competencies).flatMap(([comp, points]) =>
                                  points.map((row, idx) => (
                                    <tr key={`${comp}-${idx}`} className="hover:bg-blue-50">
                                      <td className="border px-2 py-1 text-center">{row.x}</td>
                                      <td className="border px-2 py-1 text-center">{row.ppId}</td>
                                      <td className="border px-2 py-1 text-center">
                                        {Number(row.y).toFixed(2)}
                                      </td>
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
                            <div className="text-center text-gray-400 py-4 italic uppercase text-sm">
                              SELECT A CHART TO DISPLAY DATA
                            </div>
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

        <div ref={chartContainerRef} className={`w-6/12 lg:w-9/12 flex flex-col p-5 border-2 h-full border-gray-200 ml-1`}
          style={{ backgroundColor: chartProperties.shadeArea }}>
          <div ref={chartInnerRef} className="h-full overflow-hidden mx-5 mt-1 mb-2 flex flex-col">
            <h2
              style={{
                textAlign: "center",
                fontSize: "1.125rem",
                color: "#374151",
                marginBottom: "0.5rem",
                width: "100%",
                display: "block",
              }}
            >
              {!selectedChart ? (
                <div className="flex justify-center h-full text-gray-400 text-lg">
                  SELECT PLOT
                </div>) : (
                <div className="font-semibold">
                  {selectedChart?.icon} {selectedChart?.name}
                </div>
              )}
            </h2>
            <div className="h-full flex-1 min-h-0">
              <div
                className="w-full h-[68vh] flex-1 overflow-auto min-h-0"
              >

                {!selectedChart ? (
                  <div className="flex justify-center h-full text-gray-400 text-lg">

                  </div>) : (

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
                      margin={{ top: 20, right: 30, left: 20, bottom: 75 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        allowDecimals={false}
                        label={{
                          value: ["attained", "max", "listening", "reading", "speaking", "writing", "theory",
                            "practical", "receptive", "productive", "acuity"].includes(selectedChart?.key)
                            ? "PP ID"
                            : "Insert Score Row Counter",
                          position: "insideBottom",
                          offset: -10
                        }}
                      />

                      <YAxis
                        type="number"
                        dataKey="y"
                        label={{
                          value: getYAxisDynamicLabel(),
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
                        const isAttained = comp === "attained";
                        const lineColor = isCompetencyChart
                          ? (isAttained ? chartProperties.positiveAttainedLineColor : chartProperties.positiveMaxLineColor)
                          : chartProperties.positiveLineColor;
                        const lineStyle = isCompetencyChart
                          ? (isAttained ? chartProperties.positiveAttainedLineStyle : chartProperties.positiveMaxLineStyle)
                          : chartProperties.positiveLineStyle;
                        const lineThickness = isCompetencyChart
                          ? (isAttained ? chartProperties.positiveAttainedLineThickness : chartProperties.positiveMaxLineThickness)
                          : chartProperties.positiveLineThickness;
                        const isHidden = isCompetencyChart
                          ? (isAttained ? !chartProperties.positiveAttainedVisibility : !chartProperties.positiveMaxVisibility)
                          : !chartProperties.positiveVisibility;

                        return (
                          <Line
                            key={`positive-${comp}`}
                            type="linear"
                            data={points}
                            dataKey="y"
                            name={getLegendName(comp, false)}
                            stroke={lineColor}
                            strokeDasharray={lineStyle === "dashed" ? "6 4" : lineStyle === "dotted" ? "2 4" : lineStyle === "dashdot" ? "8 4 2 4" : "0"}
                            strokeWidth={lineThickness}
                            isAnimationActive={false}
                            hide={isHidden}
                            dot={(props) => {
                              if (props.index % (chartProperties.symbolFrequency || 1) !== 0) return null;
                              return renderCustomDot(props, lineColor, false);
                            }}
                          />
                        );
                      })}

                      {/* Draw lines for each competency in negative PP IDs */}
                      {Object.entries(negativeCompetencies).map(([comp, points]) => {
                        const isAttained = comp === "attained";
                        const lineColor = isCompetencyChart
                          ? (isAttained ? chartProperties.negativeAttainedLineColor : chartProperties.negativeMaxLineColor)
                          : chartProperties.negativeLineColor;
                        const lineStyle = isCompetencyChart
                          ? (isAttained ? chartProperties.negativeAttainedLineStyle : chartProperties.negativeMaxLineStyle)
                          : chartProperties.negativeLineStyle;
                        const lineThickness = isCompetencyChart
                          ? (isAttained ? chartProperties.negativeAttainedLineThickness : chartProperties.negativeMaxLineThickness)
                          : chartProperties.negativeLineThickness;
                        const isHidden = isCompetencyChart
                          ? (isAttained ? !chartProperties.negativeAttainedVisibility : !chartProperties.negativeMaxVisibility)
                          : !chartProperties.negativeVisibility;

                        return (
                          <Line
                            key={`negative-${comp}`}
                            type="linear"
                            data={points}
                            dataKey="y"
                            name={getLegendName(comp, true)}
                            stroke={lineColor}
                            strokeDasharray={lineStyle === "dashed" ? "6 4" : lineStyle === "dotted" ? "2 4" : lineStyle === "dashdot" ? "8 4 2 4" : "0"}
                            strokeWidth={lineThickness}
                            isAnimationActive={false}
                            hide={isHidden}
                            dot={(props) => {
                              if (props.index % (chartProperties.symbolFrequency || 1) !== 0) return null;
                              return renderCustomDot(props, lineColor, true);
                            }}
                          />
                        );
                      })}

                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
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
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X, RefreshCw, FolderOutput } from 'lucide-react';
import { createProjection, getProjection } from "@/services/projectionService";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  Label,
  PieChart,
  Pie,
  Scatter,
  ScatterChart,
  ReferenceLine,
  Cell
} from 'recharts';
import PropertyEditor from './PropertyEditor';
import ProjectionTable from './ProjectionTable';
import { getUnitAndMultipleCandidateSummary } from '@/services/tabulationTableService';
import { getUnitById } from '@/services/unitService';
import { GrowthProjectionChart } from './ProjectionGraph';

import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';

//This script is used to plot the undershoot curves, the overshoot curves, and the vertical projection lines
//on the Growth Projection graph -> Candidate Analysis: Growth Projections (Data Analytics)
//------------------------------------------------------------------------------------------------------
//spline 2nd derivative at x2
const calculateZ2 = (m1, m2, m3, x1, x2, x3, x4) => {
  let numerator =
    m3 * x2 +
    m2 * x3 -
    m3 * x3 +
    2 * m2 * x4 +
    2 * m1 * x2 -
    2 * m1 * x4 -
    3 * m2 * x2;
  let denominator = 4 * (x1 * x2 + x3 * x4 - x1 * x4) - Math.pow(x2 + x3, 2);
  let result = 6 * (numerator / denominator);
  return result;
};

//spline 2nd derivative at x3
const calculateZ3 = (m1, m2, m3, x1, x2, x3, x4) => {
  let numerator =
    m2 * x2 +
    m1 * x3 -
    m1 * x2 +
    2 * m2 * x1 +
    2 * m3 * x3 -
    2 * m3 * x1 -
    3 * m2 * x3;
  let denominator = 4 * (x1 * x2 + x3 * x4 - x1 * x4) - Math.pow(x2 + x3, 2);
  let result = 6 * (numerator / denominator);
  return result;
};

export function calculateProjectionValues(
  y1, //Growth differentials for ΔRRN/ΔPRN/ΔARN of selected performance points
  y2,
  y3,
  y4, //Value always equal to 0
  x1, //Daycounts associated with selected performance points
  x2,
  x3,
  x4 //Projection termination point, so x4 = x3 + 31
) {
  let m1 = (y2 - y1) / (x2 - x1); //piecewise linear slopes
  let m2 = (y3 - y2) / (x3 - x2);
  let m3 = (y4 - y3) / (x4 - x3);
  let z2 = calculateZ2(m1, m2, m3, x1, x2, x3, x4); //spline 2nd derivative at x2
  let z3 = calculateZ3(m1, m2, m3, x1, x2, x3, x4); //spline 2nd derivative at x3
  let a1 = z2 / (6 * (x1 - x2)); //cubic coefficients
  let a2 = (2 * z2 + z3) / (6 * (x2 - x3));
  let a3 = z3 / (3 * (x3 - x4));
  let b1 = (2 * z2) / (6 * (x2 - x1));
  let b2 = (2 * z3 + z2) / (6 * (x3 - x2));
  let b3 = z3 / (6 * (x4 - x3));

  let curves = [];

  // s is the overshoot value for ΔRRN/ΔPRN/ΔARN
  // l is the undershoot value for ΔRRN/ΔPRN/ΔARN
  // c is the correction factor

  // Curves for Segment #1

  //l1 ,l2,l3 means blue lines
  //s1,s2,s3 means red lines

  for (let i = x1; i <= x2 + 0.1; i = i + 0.1) {
    let l1 = m1 * (i - x1) + y1;
    let c1 =
      a1 * Math.pow(i - x2, 2) * (i - x1) + b1 * (i - x2) * Math.pow(i - x1, 2);
    let s1 = l1 + c1;


    // blue.push({ l1 });
    // red.push({ s1 });

    curves.push({ l1, s1, i });

  }

  // Curves for Segment #2

  for (let j = x2; j <= x3 + 0.1; j = j + 0.1) {
    let l2 = m2 * (j - x2) + y2;
    let c2 =
      a2 * Math.pow(j - x3, 2) * (j - x2) + b2 * (j - x3) * Math.pow(j - x2, 2);
    let s2 = l2 + c2;

    /// blue.push({ l2 });
    /// red.push({ s2 });


    curves.push({ l2, s2, j });

  }

  // Curves for Segment #3

  for (let k = x3; k <= x4 + 0.1; k = k + 0.1) {
    let l3 = m3 * (k - x4) + y4;
    let c3 =
      a3 * Math.pow(k - x4, 2) * (k - x3) + b3 * (k - x4) * Math.pow(k - x3, 2);
    let s3 = l3 + c3;

    // blue.push({ l3 });
    // red.push({ s3 });


    curves.push({ l3, s3, k });

  }

  // Vertical line for the 15-day projection (i = x3 + 15) and the 30-day projection (i = x3 + 30)
  // curves.push({ blue, red });

  return curves;
}


export default function PlotSelections({ selectedSort, unitId, candidateId, filters, onResetFilters }) {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);

  const [growthMetric, setGrowthMetric] = useState([]);
  const chartContainerRef = useRef(null);
  const [unitType, setUnitType] = useState(null);
  const [signatureProfile, setSignatureProfile] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [chartProperties, setChartProperties] = useState({
    // Standard
    visibility: true,
    layer: 1,
    reference: false,

    // Curve Label
    showLabel: true,
    labelType: "X Type",


    // Line Attribute
    lineStyle: "solid",
    linearLineStyle: "solid",
    projectionLineStyle: "solid",
    lineColor: "#3b82f6",
    lineThickness: 2,

    // Symbol Attribute
    symbolStyle: "circle",
    symbolColor: "#3b82f6",
    positiveSymbolColor: "#10b981", // Separate symbol color for positive
    negativeSymbolColor: "#ef4444",
    symbolFrequency: 1,
    symbolScaleSize: 3,

    // Shade area
    shadeArea: "#ffffff",
    positiveLineColor: "#10b981", // Green for positive
    negativeLineColor: "#ef4444",
  });


  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');

  const [showProjectionTable, setShowProjectionTable] = useState(false);
  const [stabilitySummary, setStabilitySummary] = useState({ stable: 0, unstable: 0 });
  const [thresholdValue, setThresholdValue] = useState(null);
  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: 'A', uv: 400, pv: 240 },
    { name: 'B', uv: 300, pv: 139 },
    { name: 'C', uv: 200, pv: 980 },
  ];

  const activateCandidateLevel = [
    { id: "acl-1", name: "Equivalent Growth Differentials (ΔGEQ)", key: "ΔGEQ", icon: "🔵", type: "line" },
    { id: "acl-2", name: "Receptive Growth Differentials (ΔRR)", key: "ΔRR", icon: "🔵", type: "line" },
    { id: "acl-3", name: "Productive Growth Differentials (ΔPR)", key: "ΔPR", icon: "🔵", type: "line" },
    { id: "acl-4", name: "Acuity Growth Differentials (ΔAR)", key: "ΔAR", icon: "🔵", type: "line" },

    { id: "acl-5", name: "Performance Ratio (RR)", key: "RR", icon: "🔵", type: "line" },
    { id: "acl-6", name: "Performance Ratios (PR)", key: "PR", icon: "🔵", type: "line" },
    { id: "acl-7", name: "Performance Ratios (AR)", key: "AR", icon: "🔵", type: "line" },

    { id: "acl-8", name: "Stability in Growth (STA-G)", key: "STAG", type: "pie", icon: "🔵" },
    { id: "acl-9-1", name: "Growth Target 1 Trends - RR", key: "RRGT1", icon: "🔵", type: "line" },
    { id: "acl-9-2", name: "Growth Target 1 Trends - PR", key: "PRGT1", icon: "🔵", type: "line" },
    { id: "acl-9-3", name: "Growth Target 1 Trends - AR", key: "ARGT1", icon: "🔵", type: "line" },

    { id: "acl-9-4", name: "Growth Target 2 Trends - RR", key: "RRGT2", icon: "🔵", type: "line" },
    { id: "acl-9-5", name: "Growth Target 2 Trends - PR", key: "PRGT2", icon: "🔵", type: "line" },
    { id: "acl-9-6", name: "Growth Target 2 Trends - AR", key: "ARGT2", icon: "🔵", type: "line" },

    { id: "acl-9-7", name: "Growth Target 3 Trends - RR", key: "RRGT3", icon: "🔵", type: "line" },
    { id: "acl-9-8", name: "Growth Target 3 Trends - PR", key: "PRGT3", icon: "🔵", type: "line" },
    { id: "acl-9-9", name: "Growth Target 3 Trends - AR", key: "ARGT3", icon: "🔵", type: "line" },

    { id: "acl-9-10", name: "Growth Target 4 Trends - RR", key: "RRGT4", icon: "🔵", type: "line" },
    { id: "acl-9-11", name: "Growth Target 4 Trends - PR", key: "PRGT4", icon: "🔵", type: "line" },
    { id: "acl-9-12", name: "Growth Target 4 Trends - AR", key: "ARGT4", icon: "🔵", type: "line" },

    { id: "acl-9-13", name: "Growth Target 5 Trends - RR", key: "RRGT5", icon: "🔵", type: "line" },
    { id: "acl-9-14", name: "Growth Target 5 Trends - PR", key: "PRGT5", icon: "🔵", type: "line" },
    { id: "acl-9-15", name: "Growth Target 5 Trends - AR", key: "ARGT5", icon: "🔵", type: "line" },

    // { id: "acl-10", name: "GT 2 Component", icon: "🔵", type: "line" },
    // { id: "acl-11", name: "GT 3 Component", icon: "🔵", type: "line" },
    // { id: "acl-12", name: "GT 4 Component", icon: "🔵", type: "line" },
    // { id: "acl-13", name: "GT 5 Component", icon: "🔵", type: "line" },
    { id: "acl-14", name: "Growth Projections - ∆RR", icon: "🔵", type: "line", isProjection: true },
    { id: "acl-15", name: "Growth Projections - ∆PR", icon: "🔵", type: "line", isProjection: true },
    { id: "acl-16", name: "Growth Projections - ∆AR", icon: "🔵", type: "line", isProjection: true },
  ];

  const activateUnitLevel = [
    { id: "aul-1", name: "Equivalent Growth Differentials (ΔGEQ)", icon: "🔵", type: "scatter" },
    { id: "aul-2", name: "Receptive Growth Differentials (ΔRR)", icon: "🔵", type: "scatter" },
    { id: "aul-3", name: "Productive Growth Differentials (ΔPR)", icon: "🔵", type: "scatter" },
    { id: "aul-4", name: "Acuity Growth Differentials (ΔAR)", icon: "🔵", type: "scatter" },
    { id: "aul-5", name: "Performance Ratio (RR)", icon: "🔵", type: "scatter" },
    { id: "aul-6", name: "Performance Ratios (PR)", icon: "🔵", type: "scatter" },
    { id: "aul-7", name: "Performance Ratios (AR)", icon: "🔵", type: "scatter" },
    { id: "aul-8", name: "Stability in Growth (STA-G)", icon: "🔵", type: "pie" },
  ];

  const fetchProjectionData = async () => {
    try {
      setLoading(true);
      const response = await getProjection(unitId, candidateId);

      if (response && response.length > 0) {
        const latestSession = response[0];
        if (latestSession.points) {
          extractPPIds(latestSession.points); // 🔥 THIS triggers curve recalculation
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch projection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unitId && candidateId) {
      fetchProjectionData();
    }
  }, [unitId, candidateId]);


  const extractPPIds = (points) => {
    const growthMetricData = [];

    points.forEach(point => {
      if (point.callout === "First PP Selection" ||
        point.callout === "Second PP Selection" ||
        point.callout === "Third PP Selection") {
        growthMetricData.push({
          ppId: point.ppId,
          dayCount: point.dayCount,
          deltaRRN: point.deltaRRN,
          deltaPRN: point.deltaPRN,
          deltaARN: point.deltaARN,
          callout: point.callout
        });
      }
    });

    growthMetricData.sort((a, b) => {
      const order = { "First PP Selection": 1, "Second PP Selection": 2, "Third PP Selection": 3 };
      return order[a.callout] - order[b.callout];
    });

    setGrowthMetric(growthMetricData);
    console.log("🔵 Extracted growth metrics data:", growthMetricData);
  };

  const thirdPPDayCount = useMemo(() => {
    const third = growthMetric.find(
      g => g.callout === "Third PP Selection"
    );
    return third ? Number(third.dayCount) : null;
  }, [growthMetric]);


  console.log("pp id extract : ", growthMetric);


  // Update the useEffect that calculates projections
  useEffect(() => {
    if (growthMetric.length === 3) {
      // Extract dayCounts
      const [x1, x2, x3] = growthMetric.map(m => m.dayCount);
      const x4 = x3 + 31; // Projection termination (31 days later)

      // ∆RR Growth Projections
      const [y1_RR, y2_RR, y3_RR] = growthMetric.map(m => parseFloat(m.deltaRRN));
      const rrCurves = calculateProjectionValues(y1_RR, y2_RR, y3_RR, 0, x1, x2, x3, x4);


      // ∆PR Growth Projections
      const [y1_PR, y2_PR, y3_PR] = growthMetric.map(m => parseFloat(m.deltaPRN));
      const prCurves = calculateProjectionValues(y1_PR, y2_PR, y3_PR, 0, x1, x2, x3, x4);

      // ∆AR Growth Projections
      const [y1_AR, y2_AR, y3_AR] = growthMetric.map(m => parseFloat(m.deltaARN));
      const arCurves = calculateProjectionValues(y1_AR, y2_AR, y3_AR, 0, x1, x2, x3, x4);

      // Normalize the data to sequential day counts starting from 1
      const normalizeCurves = (curves) => {
        return curves.map((item, index) => {
          // Get the x value from whichever segment property exists
          const xValue = item.i || item.j || item.k;
          // Get the linear and spline values from whichever segment property exists
          const linearValue = item.l1 || item.l2 || item.l3 || 0;
          const splineValue = item.s1 || item.s2 || item.s3 || 0;

          return {
            dayCount: Number(xValue.toFixed(3)), // Sequential day count starting from 1
            originalX: xValue,   // Keep original x for reference
            l: linearValue,
            s: splineValue
          };
        });
      };

      setCurves({
        rr: normalizeCurves(rrCurves),
        pr: normalizeCurves(prCurves),
        ar: normalizeCurves(arCurves),
      });

      console.log("📈 Normalized ∆RR Projections:", normalizeCurves(rrCurves));
      console.log("📈 Normalized ∆PR Projections:", normalizeCurves(prCurves).slice(0, 10));
      console.log("📈 Normalized ∆AR Projections:", normalizeCurves(arCurves).slice(0, 10));
      console.log("📈 Normalized ∆RR Projections curves->:", curves);
    }
  }, [growthMetric]);


  const hasRRProjection = curves?.rr?.length > 0;
  const hasPRProjection = curves?.pr?.length > 0;
  const hasARProjection = curves?.ar?.length > 0;


  useEffect(() => {
    const fetchTabulationData = async () => {
      if (!unitId || !candidateId) {
        setTableData([]); // clear previous table data
        setStabilitySummary({ stable: 0, unstable: 0 });
        return;
      }

      console.log("logging data::-> ", filters);
      setLoading(true);
      setError(null);
      try {
        const data = await getUnitAndMultipleCandidateSummary({
          unitId: unitId,
          candidate_id: candidateId,       // make sure filters contains candidate_id
          ppIdFrom: filters?.ppIdFrom ?? undefined,
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });

        const { results, cumulativeSums, average, stdDev, stdErr } = data;

        const formattedData = results.map(row => ({
          ppId: row.ppId,
          dayCount: row.cumulativeDuration,
          ΔGEQ: row.GEQ || 0,
          ΔRR: row.deltaRRN || 0,
          ΔPR: row.deltaPRN || 0,
          ΔAR: row.deltaARN || 0,
          RR: row.RRN || 0,
          PR: row.PRN || 0,
          AR: row.ARN || 0,
          STAG: row.STAG || 0,
          IC: row.IC || 0,
          RRGT1: row.RRGT1 || 0,
          PRGT1: row.PRGT1 || 0,
          ARGT1: row.ARGT1 || 0,
          RRGT2: row.RRGT2 || 0,
          PRGT2: row.PRGT2 || 0,
          ARGT2: row.ARGT2 || 0,
          RRGT3: row.RRGT3 || 0,
          PRGT3: row.PRGT3 || 0,
          ARGT3: row.ARGT3 || 0,
          RRGT4: row.RRGT4 || 0,
          PRGT4: row.PRGT4 || 0,
          ARGT4: row.ARGT4 || 0,
          RRGT5: row.RRGT5 || 0,
          PRGT5: row.PRGT5 || 0,
          ARGT5: row.ARGT5 || 0,
        }));

        setTableData(formattedData);

        // ✅ Calculate stability counts
        const stableCount = results.filter(r => r.STAG === "STABLE").length;
        const unstableCount = results.filter(r => r.STAG === "UNSTABLE").length;

        setStabilitySummary({ stable: stableCount, unstable: unstableCount });

        console.log("✅ Stability Summary:", formattedData);

      } catch (err) {
        console.error("Failed to fetch tabulation data:", err);
        setError("Failed to load table data.");
        setStabilitySummary({ stable: 0, unstable: 0 });
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTabulationData();
  }, [unitId, candidateId, filters]);

  console.log("values: ", tableData);
  useEffect(() => {
    const fetchThreshold = async () => {
      if (!unitId) {
        setThresholdValue(null);
        setUnitType(null);
        setSignatureProfile(null);
        return;
      }

      try {
        const data = await getUnitById(unitId);

        // Safely extract only threshold ratio fields
        const extractedThresholds = {

          ΔGEQ: parseFloat(data?.ΔGEQ) ?? null,
          ΔRR: parseFloat(data?.ΔRRN) ?? null,
          ΔPR: parseFloat(data?.ΔPRN) ?? null,
          ΔAR: parseFloat(data?.ΔARN) ?? null,
          RR: parseFloat(0.7).toFixed(3) ?? null, // Assuming fixed threshold for RR
          PR: parseFloat(0.7).toFixed(3) ?? null, // Assuming fixed threshold for RR
          AR: parseFloat(0.7).toFixed(3) ?? null, // Assuming fixed threshold for RR
        };

        setThresholdValue(extractedThresholds);
        setUnitType(data?.unitType || null);
        setSignatureProfile(data?.signatureProfile || null);

        console.log("✅ Extracted Signature Profile:", data);
      } catch (error) {
        console.error("❌ Failed to fetch threshold values:", error);
        setThresholdValue(null);
      }
    };

    fetchThreshold();
  }, [unitId]);

  const [selectedChart, setSelectedChart] = useState(null);
  console.log("filter data:", filters);

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


  useEffect(() => {
    setCurves({ rr: [], pr: [], ar: [] });
    setGrowthMetric([]);
  }, [candidateId, unitId]);

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

  useEffect(() => {
    if (selectedSort === 'activateCandidateLevel') {
      const firstVisible = activateCandidateLevel.find(chart => {
        if (chart.isProjection) {
          if (chart.name === "Growth Projections - ∆RR") return hasRRProjection;
          if (chart.name === "Growth Projections - ∆PR") return hasPRProjection;
          if (chart.name === "Growth Projections - ∆AR") return unitType === "Third Parameter" && hasARProjection;
          return false;
        }
        if (chart.name.includes("(ΔAR)") || chart.name.includes("AR") || chart.name.includes("(AR)") || chart.name.includes("ARGT")) {
          return unitType === "Third Parameter";
        }
        return true;
      });
      setSelectedChart(firstVisible ?? null);

    } else if (selectedSort === 'activateUnitLevel') {
      const firstVisible = activateUnitLevel.find(chart => {
        if (chart.name.includes("(ΔAR)") || chart.name.includes("(AR)")) {
          return unitType === "Third Parameter";
        }
        return true;
      });
      setSelectedChart(firstVisible ?? null);
    }
  }, [selectedSort]);
  const exportToExcelWithImage = async () => {
    if (!selectedChart) {
      alert("Please select a chart first.");
      return;
    }

    if (selectedChart.type !== "pie" && !chartContainerRef.current) {
      alert("Chart is not ready for export yet.");
      return;
    }

    const isProjectionChart = selectedChart.isProjection === true;

    if (selectedChart.type === "pie") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Stability Summary");

      sheet.addRow(["Stability Type", "Count"]);
      sheet.addRow(["STABLE", stabilitySummary.stable]);
      sheet.addRow(["UNSTABLE", stabilitySummary.unstable]);

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `stability_summary_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      return;
    }


    try {
      // Extract key name from chart selection
      const keyName = selectedChart.key ?? selectedChart.name.match(/\((.*?)\)/)?.[1];

      if (!keyName) {
        alert("Invalid chart selection.");
        return;
      }

      // 1. Capture chart as image
      const chartContainer = chartContainerRef.current;
      const canvas = await html2canvas(chartContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convert canvas to buffer
      const chartImageBuffer = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve(new Uint8Array(reader.result));
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      });

      // 2. Create workbook with ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Chart Report');

      // Set column widths
      worksheet.columns = [
        { width: 15 }, // Column A
        { width: 15 }, // Column B
        { width: 15 }, // Column C
        { width: 15 }, // Column D
      ];

      // 3. Add header section
      const headerRow = worksheet.addRow(['CHART DATA EXPORT']);
      headerRow.font = { size: 14, bold: true };
      headerRow.height = 30;
      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.addRow(['Chart Name:', selectedChart.name]);
      worksheet.addRow(['Key Name:', keyName]);
      worksheet.addRow(['Export Date:', new Date().toLocaleString()]);
      worksheet.addRow([]); // Empty row

      // 4. Add the chart image
      // Skip some rows for the image
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);

      const imageId = workbook.addImage({
        buffer: chartImageBuffer,
        extension: 'png',
      });

      // Insert image at specific position
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 6 },  // Start at column A, row 7 (0-indexed)
        br: { col: 4, row: 26 }, // Span 4 columns, 20 rows
      });

      // Move down past the image
      let currentRow = 27;

      // 5. Add data points header
      worksheet.getRow(currentRow).values = ['DATA POINTS'];
      worksheet.getRow(currentRow).font = { bold: true };
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      currentRow++;

      const dataHeaderRow = worksheet.getRow(currentRow);
      dataHeaderRow.values = ['Candidate ID', 'PP ID', 'X Axis Value', `${selectedChart.name} (Y Value)`];
      dataHeaderRow.font = { bold: true };
      dataHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F4FF' } // Light blue background
      };
      currentRow++;

      const isProjectionChart = selectedChart.name.startsWith("Growth Projections");

      let exportData = [];

      if (isProjectionChart) {
        if (selectedChart.name.includes("∆RR")) exportData = curves.rr;
        if (selectedChart.name.includes("∆PR")) exportData = curves.pr;
        if (selectedChart.name.includes("∆AR")) exportData = curves.ar;

        exportData.forEach(point => {
          worksheet.addRow([
            candidateId,
            "Projection",
            point.dayCount,
            point.s.toFixed(3)
          ]);
        });
      } else {
        tableData.forEach(row => {
          if (row[keyName] !== undefined && !isNaN(row[keyName])) {
            worksheet.addRow([
              row.candidateId || "N/A",
              row.ppId,
              row.ppId,
              parseFloat(row[keyName].toFixed(3))
            ]);
          }
        });
      }


      // 6. Add all data points
      tableData.forEach(row => {
        if (row[keyName] !== undefined && row[keyName] !== null && !isNaN(row[keyName])) {
          const dataRow = worksheet.getRow(currentRow);
          dataRow.values = [
            row.candidateId || "N/A",
            row.ppId,
            row.ppId,
            typeof row[keyName] === 'number' ? parseFloat(row[keyName].toFixed(3)) : row[keyName]
          ];
          currentRow++;
        }
      });

      // 7. Add summary section
      currentRow++;
      worksheet.getRow(currentRow).values = ['SUMMARY STATISTICS'];
      worksheet.getRow(currentRow).font = { bold: true };
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      currentRow++;

      // Calculate statistics
      const validData = tableData
        .filter(row => row[keyName] !== undefined && row[keyName] !== null && !isNaN(row[keyName]))
        .map(row => row[keyName]);

      if (validData.length > 0) {
        const min = Math.min(...validData);
        const max = Math.max(...validData);
        const avg = validData.reduce((a, b) => a + b, 0) / validData.length;
        const stdDev = Math.sqrt(validData.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / validData.length);

        worksheet.getRow(currentRow++).values = ['Total Data Points:', validData.length];
        worksheet.getRow(currentRow++).values = ['Minimum Value:', min.toFixed(3)];
        worksheet.getRow(currentRow++).values = ['Maximum Value:', max.toFixed(3)];
        worksheet.getRow(currentRow++).values = ['Average Value:', avg.toFixed(3)];
        worksheet.getRow(currentRow++).values = ['Standard Deviation:', stdDev.toFixed(3)];
      } else {
        worksheet.getRow(currentRow++).values = ['No valid data points available'];
        worksheet.mergeCells(`A${currentRow - 1}:D${currentRow - 1}`);
      }

      // 8. Add threshold information if available
      if (thresholdValue && thresholdValue[keyName] !== null && thresholdValue[keyName] !== undefined) {
        currentRow++;
        worksheet.getRow(currentRow).values = ['THRESHOLD INFORMATION'];
        worksheet.getRow(currentRow).font = { bold: true };
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        currentRow++;

        worksheet.getRow(currentRow++).values = ['Threshold Value:', thresholdValue[keyName]];
        worksheet.getRow(currentRow++).values = ['Threshold Enabled:', filters?.thresholdEnabled ? "Yes" : "No"];
      }

      // 9. Add some formatting
      // Format numeric cells
      for (let i = 27; i < currentRow; i++) {
        const cell = worksheet.getCell(`D${i}`);
        if (cell.value && typeof cell.value === 'number') {
          cell.numFmt = '0.000';
        }
      }

      // 10. Save the workbook
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Generate filename
      const fileName = `chart_report_${keyName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      // Download the file
      saveAs(blob, fileName);

      console.log("✅ Excel file with chart image exported successfully:", fileName);

    } catch (error) {
      console.error("❌ Failed to export Excel with image:", error);
      alert("Failed to export Excel file. Please try again. Error: " + error.message);
    }
  };

  // Update your export button to ONLY use this function (remove the simple version)
  const handleExportGraph = () => {
    exportToExcelWithImage();
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


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const point = payload[0].payload;

      const yAxisLabel = selectedChart?.name ?? "Value";

      // 🔥 Check if it's a Growth Target Trend
      const isGrowthTarget = selectedChart?.key?.includes("GT");

      return (
        <div className="bg-white p-2 border rounded shadow text-sm">
          <div>
            <strong>{isGrowthTarget ? "PP ID" : "Days"}:</strong>{" "}
            {isGrowthTarget
              ? parseInt(point.ppId || point.x || 0)
              : Number(point.dayCount).toFixed(2)}
          </div>

          <div>
            <strong>{yAxisLabel}:</strong>{" "}
            {Number(point.value).toFixed(3)}
          </div>
        </div>
      );
    }
    return null;
  };

  const exportAsJPG = async () => {
    if (!chartContainerRef.current) {
      alert("No chart available to export");
      return;
    }

    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      canvas.toBlob((blob) => {
        saveAs(blob, `Plot Extraction.jpg`);
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error('JPG Export failed:', error);
      alert('Failed to export as JPG: ' + error.message);
    }
  };

  // Function to export as PDF
  const exportAsPDF = async () => {
    if (!chartContainerRef.current) {
      alert("No chart available to export");
      return;
    }

    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`chart-${selectedChart.key}-${new Date().getTime()}.pdf`);

    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to export as PDF: ' + error.message);
    }
  };

  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className='pl-2 text-md'>Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full min-h-0">
        <div className='w-6/12 lg:w-4/12 flex flex-col border-2 h-full min-h-0 border-gray-200 p-1'>
          <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => { }} title="Reset Filter" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <RefreshCw className="w-4 h-4 hover:text-green-600"
                  onClick={() => {
                    if (typeof onResetFilters === "function") {
                      onResetFilters(); // ✅ reset filters in parent
                    }
                  }} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="Export Graph"
                  className="text-blue-600 hover:text-red-800 cursor-pointer pt-2"
                >
                  <FolderOutput className="w-4 h-4 hover:text-blue-600" />
                </button>

                {/* Export dropdown menu */}
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

          <div className=" h-full overflow-hidden w-full my-2">
            <div className="h-[40%] flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1">
                {/* Fixed Header */}
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                  <div className="col-span-9 pl-2 py-1 text-left">Entities</div>
                  <div className="col-span-3 pl-1  py-1 text-left">ID</div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(100%-40px)]">
                  {selectedSort === 'activateCandidateLevel' && (
                    <>
                      {activateCandidateLevel
                        .filter(chart => {

                          /* ---------- 1. Projection visibility ---------- */
                          if (chart.isProjection) {
                            if (chart.name === "Growth Projections - ∆RR") return hasRRProjection;
                            if (chart.name === "Growth Projections - ∆PR") return hasPRProjection;
                            if (chart.name === "Growth Projections - ∆AR") {
                              return unitType === "Third Parameter" && hasARProjection;
                            }
                            return false;
                          }

                          /* ---------- 2. AR restriction ---------- */
                          if (chart.name.includes("(ΔAR)") || chart.name.includes("AR") || chart.name.includes("(AR)") || chart.name.includes("ARGT")) {
                            return unitType === "Third Parameter";
                          }
                          return true;
                        })
                        .map((chart, index) => (
                          <div
                            key={index}
                            className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer  
                              ${selectedChart?.name === chart.name ? "bg-gray-200" : "hover:bg-gray-200"}`}
                            onClick={() => setSelectedChart(chart)}
                          >
                            <div className="col-span-9 text-xs text-gray-700 truncate">{chart.icon}{chart.name}</div>
                            <div className="col-span-3 pl-3 text-xs text-gray-400">{index + 1}</div>
                          </div>
                        ))}
                    </>
                  )}

                  {selectedSort === 'activateUnitLevel' && (
                    <>
                      {activateUnitLevel
                        .filter(chart => {
                          if (chart.name.includes("(ΔAR)") || chart.name.includes("(AR)")) {
                            return unitType === "Third Parameter";
                          }
                          return true;
                        })
                        .map((chart, index) => (
                          <div
                            key={index}
                            className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer  
                              ${selectedChart?.name === chart.name ? "bg-gray-200" : "hover:bg-gray-200"}`}
                            onClick={() => setSelectedChart(chart)}
                          >
                            <div className="col-span-9 text-xs text-gray-700 truncate">🔵{chart.name}</div>
                            <div className="col-span-3 pl-3 text-xs text-gray-400">{index + 1}</div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="h-[60%] flex flex-col border border-gray-200 ">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm whitespace-nowrap cursor-pointer ${activeAdjustPropertieTab === 'Property editor'
                    ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Property editor')}
                >
                  Property Editor
                </button>
                <button
                  className={`px-3 py-1 text-sm  cursor-pointer ${activeAdjustPropertieTab === 'Table'
                    ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Table')}
                >
                  Table
                </button>

                <button
                  className={`px-3 py-1 text-sm  cursor-pointer ${activeAdjustPropertieTab === 'projections'
                    ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => {
                    setActiveAdjustPropertieTab('projections');
                    setShowProjectionTable(true); // Show modal
                  }}
                >
                  Projections
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 min-h-0">
                {activeAdjustPropertieTab === "Property editor" && (
                  <>
                    {selectedChart && (selectedChart.type === "line" || selectedChart.type === "scatter") ? (
                      <PropertyEditor
                        properties={chartProperties}
                        onChange={setChartProperties}
                        selectedChart={selectedChart}
                      />
                    ) : (
                      <div className="text-sm text-center text-gray-400 py-4 italic">
                        NOT AVAILABLE FOR SELECTED CHART
                      </div>
                    )}
                  </>
                )}

                {activeAdjustPropertieTab === 'Table' && (

                  <>
                    {
                      selectedChart ? (
                        (() => {
                          const keyName = selectedChart.key;

                          if (selectedSort === 'activateUnitLevel') {
                            return (
                              <div className="text-center text-sm text-gray-400 py-4 italic">
                                NOT AVAILABLE AT UNIT LEVEL
                              </div>
                            );
                          }

                          if (!keyName) {
                            return (
                              <div className="text-center text-sm text-gray-400 py-4 italic">
                                NOT AVAILABLE FOR SELECTED CHART
                              </div>
                            );
                          }

                          const combinedData = tableData
                            .filter(row => row[keyName] !== undefined && !isNaN(row[keyName]) && row.ppId > 0)
                            .map(row => ({
                              ppId: row.ppId,
                              dayCount: row.dayCount,
                              value: row[keyName],
                            }));

                          // If NO DATA → show message OUTSIDE table
                          if (combinedData.length === 0) {
                            return (
                              <div className="text-center text-gray-400 py-4 italic">
                                NOT AVAILABLE FOR SELECTED CHART
                              </div>
                            );
                          }

                          const extraColumn = ["AR", "PR", "RR", "ΔAR", "ΔPR", "ΔRR", "ΔGEQ"];
                          const showDayCount = extraColumn.includes(selectedChart?.key);

                          //  If DATA exists → show table
                          return (
                            <div className="text-xs text-gray-600 mt-2 w-full overflow-auto mb-16">
                              <h3 className="text-gray-600 font-semibold mb-2 ml-2">Positive PP IDs</h3>
                              <table className="text-xs border border-gray-300" style={{ width: 'max-content', minWidth: '100%' }}>
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="border border-gray-300 px-2 py-1 text-center">PP ID</th>
                                    {showDayCount && (
                                      <th className="border border-gray-300 px-2 py-1 text-center">
                                        Day Count
                                      </th>
                                    )}
                                    <th className="border border-gray-300 px-2 py-1 text-center">
                                      {selectedChart.key}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {combinedData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50">
                                      <td className="border border-gray-300 px-2 py-1 text-center">{row.ppId}</td>
                                      {showDayCount && (
                                        <td className="border border-gray-300 px-2 py-1 text-center">
                                          {row.dayCount.toFixed(2)}
                                        </td>
                                      )}
                                      <td className="border border-gray-300 px-2 py-1 text-center">
                                        {row.value.toFixed(3)}
                                      </td>


                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-center text-gray-400 py-4 italic">
                          SELECT A CHART TO DISPLAY DATA
                        </div>
                      )
                    }
                  </>
                )}

              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col h-full min-h-0 bg-white">

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              {selectedChart ? (
                (() => {
                  const projectionCharts = [
                    "Growth Projections - ∆RR",
                    "Growth Projections - ∆PR",
                    "Growth Projections - ∆AR",
                  ];

                  const gtKeys = [
                    "RRGT1", "RRGT2", "RRGT3", "RRGT4", "RRGT5",
                    "PRGT1", "PRGT2", "PRGT3", "PRGT4", "PRGT5",
                    "ARGT1", "ARGT2", "ARGT3", "ARGT4", "ARGT5"
                  ];

                  const zeroStartKeys = ["ΔGEQ", "ΔRR", "ΔPR", "ΔAR", "RR", "PR", "AR"];

                  const isProjectionChart = projectionCharts.includes(selectedChart.name);

                  // SEPARATE HANDLING FOR GROWTH PROJECTION CHARTS
                  if (isProjectionChart) {
                    let curveData = [];
                    let chartTitle = selectedChart.name;

                    if (selectedChart.name === "Growth Projections - ∆RR") {
                      curveData = curves.rr || [];
                    } else if (selectedChart.name === "Growth Projections - ∆PR") {
                      curveData = curves.pr || [];
                    } else if (selectedChart.name === "Growth Projections - ∆AR") {
                      curveData = curves.ar || [];
                    }

                    return (
                      <div ref={chartContainerRef} className="flex flex-col h-full p-2 bg-white">
                        <h2 className="text-lg font-semibold mb-2 text-center">
                          {selectedChart.icon} {selectedChart.name}
                        </h2>

                        <div className="flex-1 flex items-center justify-center">
                          <GrowthProjectionChart
                            data={curveData}
                            thirdPPDayCount={thirdPPDayCount}
                            title={selectedChart.name}
                            properties={chartProperties}
                          />
                        </div>
                      </div>

                    );
                  }

                  // Existing chart handling for non-projection charts
                  const keyName =
                    selectedChart.key ||
                    selectedChart.name.match(/\((.*?)\)/)?.[1];

                  if (!keyName) {
                    return <div className="text-gray-500">Invalid chart selection</div>;
                  }


                  const isGTchart = gtKeys.includes(keyName);

                  const forceZero = zeroStartKeys.includes(keyName);

                  let mappedData = tableData
                    .filter(row => row.ppId > 0 && !isNaN(row[keyName]))
                    .map(row => ({
                      [isGTchart ? "ppId" : "dayCount"]: isGTchart ? row.ppId : row.dayCount,
                      value: row[keyName]
                    }));

                  // If this is one of the 7 charts → add 0-point at the start
                  if (forceZero) {
                    mappedData = [
                      {
                        [isGTchart ? "ppId" : "dayCount"]: 0,
                        value: 0
                      },
                      ...mappedData
                    ];
                  }

                  const positiveData = mappedData;

                  const yValues = positiveData.map(d => d.value);
                  const minY = Math.min(...yValues);
                  const yDomainStart = minY < 0 ? minY : 0;

                  if (selectedChart.type === "line") {
                    // Determine stroke style based on lineStyle
                    const strokeDasharray =
                      chartProperties.lineStyle === "dashed"
                        ? "6 4"
                        : chartProperties.lineStyle === "dotted"
                          ? "2 4"
                          : "0";

                    return (
                      <div ref={chartContainerRef} className="flex flex-col h-full p-2 bg-white " style={{ backgroundColor: chartProperties.shadeArea }}>
                        <h2 className="text-lg font-semibold mb-2 text-center">
                          {selectedChart.icon} {selectedChart.name}
                        </h2>
                        <div className="flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={positiveData}
                              margin={{ top: 30, right: 20, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                type="number"
                                dataKey={isGTchart ? "ppId" : "dayCount"}
                                domain={[0, "auto"]}
                                tickFormatter={(value) =>
                                  isGTchart
                                    ? parseInt(value, 10) //  whole number for ppId
                                    : Number(value).toFixed(2) //  decimal for days
                                }
                                allowDataOverflow={true}
                              >
                                {(chartProperties.showLabel || chartProperties.labelType !== "X Type") && (
                                  <Label
                                    value={isGTchart ? "PP ID" : "Days"}
                                    offset={-10}
                                    position="insideBottom"
                                    textAnchor="middle"
                                  />
                                )}
                              </XAxis>

                              <YAxis
                                // domain={[yDomainStart, "auto"]}
                                allowDataOverflow={true}
                                domain={[
                                  (dataMin) => {
                                    const threshold = thresholdValue?.[keyName];
                                    if (threshold == null) return dataMin;
                                    return Math.min(dataMin, threshold);
                                  },
                                  (dataMax) => {
                                    const threshold = thresholdValue?.[keyName];
                                    if (threshold == null) return dataMax;
                                    return Math.max(dataMax, threshold);
                                  }
                                ]}
                                tickFormatter={(value) => Number(value).toFixed(3)}
                              >

                                {(chartProperties.showLabel || chartProperties.labelType !== "Y Type") && (
                                  <Label
                                    value={`${selectedChart.name}`}
                                    angle={-90}
                                    position="insideLeft"
                                    offset={-5}
                                    textAnchor="middle"
                                  />
                                )}
                              </YAxis>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
                              />

                              {thresholdValue && keyName && filters?.thresholdEnabled === true && thresholdValue[keyName] !== null && (
                                <ReferenceLine
                                  y={thresholdValue[keyName]}
                                  stroke="#000000"
                                  strokeWidth={2}
                                  strokeDasharray="7 4 1 4"
                                  label={{
                                    position: "right",
                                    fill: "#f59e0b",
                                    fontSize: 12,
                                  }}
                                />
                              )}

                              {/* 🔵 Positive PP IDs */}
                              {chartProperties.visibility && (
                                <Line
                                  type="linear"
                                  dataKey="value"
                                  name={selectedChart.name}
                                  stroke={chartProperties.positiveLineColor}
                                  strokeWidth={chartProperties.lineThickness}
                                  strokeDasharray={strokeDasharray}
                                  dot={(props) => {
                                    const { index } = props;
                                    if (index % chartProperties.symbolFrequency !== 0) return null;
                                    return renderCustomDot(props, chartProperties.symbolColor);
                                  }}
                                />
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }

                  if (selectedChart.type === "scatter") {

                    if (!candidateId) {
                      return (
                        <div className="flex flex-col h-full p-2 bg-white" style={{ backgroundColor: chartProperties.shadeArea }}>
                          <h2 className="text-lg font-semibold mb-2 text-center">{selectedChart.icon} {selectedChart.name}</h2>
                          <div className="flex-1 flex  justify-center text-gray-400 uppercase">
                            Select a candidate to view
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div ref={chartContainerRef} className="flex flex-col h-full p-2 bg-white" style={{ backgroundColor: chartProperties.shadeArea }}>
                        <h2 className="text-lg font-semibold mb-2 text-center">{selectedChart.icon} {selectedChart.name}</h2>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" dataKey="dayCount" name="PP ID" tickFormatter={(value) => Number(value).toFixed(1)} >
                                {(chartProperties.showLabel || chartProperties.labelType !== "X Type") && (
                                  <Label value={`Days`} offset={-10} position="insideBottom" />
                                )}
                              </XAxis>
                              <YAxis type="number" dataKey="value" name={selectedChart.name}
                                domain={[
                                  (dataMin) => {
                                    const threshold = thresholdValue?.[keyName];
                                    if (threshold == null) return dataMin;
                                    return Math.min(dataMin, threshold);
                                  },
                                  (dataMax) => {
                                    const threshold = thresholdValue?.[keyName];
                                    if (threshold == null) return dataMax;
                                    return Math.max(dataMax, threshold);
                                  }
                                ]}
                                tickFormatter={(value) => Number(value).toFixed(3)}>
                                {(chartProperties.showLabel || chartProperties.labelType !== "Y Type") && (
                                  <Label
                                    value={`${selectedChart.name}`}
                                    angle={-90}
                                    position="insideLeft"
                                    offset={-5}
                                    textAnchor="middle"
                                  />
                                )}
                              </YAxis>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
                              />

                              {thresholdValue && keyName && filters?.thresholdEnabled === true && thresholdValue[keyName] !== null && (
                                <ReferenceLine
                                  y={thresholdValue[keyName]}
                                  stroke="#000000"
                                  strokeWidth={2}
                                  strokeDasharray="7 4 1 4"
                                  label={{
                                    position: "right",
                                    fill: "#f59e0b",
                                    fontSize: 12,
                                  }}
                                />
                              )}
                              {chartProperties.visibility && (
                                <Scatter
                                  name="Positive PP IDs"
                                  data={positiveData}
                                  fill={chartProperties.symbolColor}
                                  shape={(props) => renderCustomDot(props, chartProperties.symbolColor)}
                                />
                              )}
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }

                  if (selectedChart.type === "pie" && selectedChart.name.includes("Stability")) {

                    const stable = stabilitySummary.stable || 0;
                    const unstable = stabilitySummary.unstable || 0;
                    const total = stable + unstable;

                    // Calculate percentages with 3 decimal places
                    const stablePercentage = total > 0 ? Number((stable / total).toFixed(3)) : 0;
                    const unstablePercentage = total > 0 ? Number((unstable / total).toFixed(3)) : 0;

                    // Create data from stabilitySummary state
                    const pieData = [
                      {
                        name: "STABLE",
                        count: stable,
                        value: stablePercentage,
                      },
                      {
                        name: "UNSTABLE",
                        count: unstable,
                        value: unstablePercentage,

                      },
                    ];
                    // const total = pieData.reduce((sum, entry) => sum + entry.value, 0);
                    return (
                      <div ref={chartContainerRef} className="flex flex-col h-full p-2 bg-white overflow-hidden">
                        <h2 className="text-lg font-semibold mb-2 text-center flex-shrink-0">
                          {selectedChart.icon} {selectedChart.name}
                        </h2>
                        <div className="flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{}}>
                              <Tooltip
                                formatter={(value, name, props) => {
                                  const percentage = `${(value).toFixed(3)}`;
                                  const count = props?.payload?.count;
                                  return [`${percentage} Count: ${count} `, name];
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                wrapperStyle={{
                                  fontSize: "12px",
                                  paddingTop: "4px",
                                  marginBottom: "-6px",
                                }}
                              />
                              <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="75%"
                                label={({ name, value, count }) => {
                                  const percentage = (value).toFixed(3);
                                  return `${percentage}`;
                                }}
                                labelLine={true}
                                isAnimationActive={false}
                              >
                                <Cell key="stable" fill="#10b981" />
                                <Cell key="unstable" fill="#ef4444" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }

                  return <div className="text-gray-500">Unsupported chart type</div>;
                })()
              ) : (
                <div className="flex justify-center  h-full text-gray-400 text-lg py-4">
                  SELECT PLOT
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProjectionTable
        visible={showProjectionTable}
        unitId={unitId}
        candidateId={candidateId}
        projectionData={tableData}
        unitType={unitType}
        signatureProfile={signatureProfile}
        onRefreshProjections={fetchProjectionData}
        onClose={() => {
          setShowProjectionTable(false)
          setActiveAdjustPropertieTab('Table')
        }}
      />

    </>
  );
}
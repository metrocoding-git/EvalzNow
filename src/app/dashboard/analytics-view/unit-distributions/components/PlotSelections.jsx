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
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import PropertyEditor from "./PropertyEditor";
import CandidateSelectionTable from "./CandidateSelection";
import { getBetaDistributionData, getChiDistributionData, getChilDistributionData, getExponentialDistributionData, getFDistributionData, getNormalDistributionData, getTDistributionData, getUniformDistributionData, getWeibullCDFDistributionData, getWeibullPDFDistributionData, getWeibullRiskDistributionData } from "@/services/unitDistributionService";
import jsPDF from "jspdf";
import { getUnitById } from "@/services/unitService";

export default function PlotSelections({ onCandidatesSelected, unitId, onWeibullSelect, betaValue, unitType, onResetBeta }) {
  const [distributions, setDistributions] = useState({});
  const [selectedKey, setSelectedKey] = useState("RR");
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
  const exportMenuRef = useRef(null);
  const [ScoreAdd, setScoreAdd] = useState(false);
  const [candidatePpList, setCandidatePpList] = useState([]);
  const [candidateRows, setCandidateRows] = useState([]);
  const chartRows = [
    "RR", "PR", "AR", "XEQ", "XCP", "XBP", "deltaRR", "deltaPR", "deltaAR", "deltaGEQ"
  ];

  const chartInnerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // console.log("selected candidates:->", onCandidatesSelected);

  const floatChartData = [
    { name: "Jan", xValue: 1.2, yValue: 2.1, zValue: 0.9 },
    { name: "Feb", xValue: 2.8, yValue: 1.4, zValue: 1.6 },
    { name: "Mar", xValue: 1.5, yValue: 2.9, zValue: 2.2 },
    { name: "Apr", xValue: 3.1, yValue: 3.0, zValue: 2.7 },
    { name: "May", xValue: 2.0, yValue: 1.8, zValue: 3.1 },
    { name: "Jun", xValue: 2.6, yValue: 2.2, zValue: 3.4 },
  ];

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
    Array.from({ length: 10 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] =
    useState("Table");

  const [tableData, setTableData] = useState([]);
  const canvasRef = useRef(null);

  const chartContainerRef = useRef(null);

  const [unitData, setUnitData] = useState(null); 
  // Example line chart data
  const data = [
    { name: "A", uv: 400, pv: 240 },
    { name: "B", uv: 300, pv: 139 },
    { name: "C", uv: 200, pv: 980 },
  ];
  const chart = [
    { id: 1, name: "Normal Distribution - RR", icon: "🔵", type: "line", key: "RR", distribution: "normal" },
    { id: 2, name: "Normal Distribution - PR", icon: "🔵", type: "line", key: "PR", distribution: "normal" },
    { id: 3, name: "Normal Distribution - AR", icon: "🔵", type: "line", key: "AR", distribution: "normal" },
    { id: 4, name: "Normal Distribution - XEQ", icon: "🔵", type: "line", key: "XEQ", distribution: "normal" },
    { id: 5, name: "Normal Distribution - XCP", icon: "🔵", type: "line", key: "XCP", distribution: "normal" },
    { id: 6, name: "Normal Distribution - XBP", icon: "🔵", type: "line", key: "XBP", distribution: "normal" },
    { id: 7, name: "Normal Distribution - ∆RR", icon: "🔵", type: "line", key: "deltaRR", distribution: "normal" },
    { id: 8, name: "Normal Distribution - ∆PR", icon: "🔵", type: "line", key: "deltaPR", distribution: "normal" },
    { id: 9, name: "Normal Distribution - ∆AR", icon: "🔵", type: "line", key: "deltaAR", distribution: "normal" },
    { id: 10, name: "Normal Distribution - ∆GEQ", icon: "🔵", type: "line", key: "deltaGEQ", distribution: "normal" },
  
    // { id: 11, name: "T Distribution - RR", icon: "🔵", type: "line", key: "RR", distribution: "t" },
    // { id: 12, name: "T Distribution - PR", icon: "🔵", type: "line", key: "PR", distribution: "t" },
    // { id: 13, name: "T Distribution - AR", icon: "🔵", type: "line", key: "AR", distribution: "t" },
    // { id: 14, name: "T Distribution - XEQ", icon: "🔵", type: "line", key: "XEQ", distribution: "t" },
    // { id: 15, name: "T Distribution - ∆RR", icon: "🔵", type: "line", key: "deltaRR", distribution: "t" },
    // { id: 16, name: "T Distribution - ∆PR", icon: "🔵", type: "line", key: "deltaPR", distribution: "t" },
    // { id: 17, name: "T Distribution - ∆AR", icon: "🔵", type: "line", key: "deltaAR", distribution: "t" },
    // { id: 18, name: "T Distribution - ∆GEQ", icon: "🔵", type: "line", key: "deltaGEQ", distribution: "t" },
  
    { id: 19, name: "Exponential Distribution - RR", icon: "🔵", type: "line", key: "RR", distribution: "exponential" },
    { id: 20, name: "Exponential Distribution - PR", icon: "🔵", type: "line", key: "PR", distribution: "exponential" },
    { id: 21, name: "Exponential Distribution - AR", icon: "🔵", type: "line", key: "AR", distribution: "exponential" },
    { id: 22, name: "Exponential Distribution - XEQ", icon: "🔵", type: "line", key: "XEQ", distribution: "exponential" },
    { id: 23, name: "Exponential Distribution - ∆GEQ", icon: "🔵", type: "line", key: "deltaGEQ", distribution: "exponential" },
  
    { id: 24, name: "Chi-Square Distribution - 95%", icon: "🔵", type: "area", key: "CHI_SQUARE", distribution: "chi-square" },
  
    { id: 25, name: "F-Distribution - Proficiency to Growth", icon: "🔵", type: "line", key: "F_DIST", distribution: "f" },
  
    { id: 26, name: "Beta Distribution - STA/P", icon: "🔵", type: "line", key: "STAP", distribution: "beta" },
    { id: 27, name: "Beta Distribution - STA/G", icon: "🔵", type: "line", key: "STAG", distribution: "beta" },
  
    { id: 28, name: "Uniform Distribution - STA/P", icon: "🔵", type: "bar", key: "STAP", distribution: "uniform" },
    { id: 29, name: "Uniform Distribution - STA/G", icon: "🔵", type: "bar", key: "STAG", distribution: "uniform" },
  
    { id: 30, name: "Weibull Distribution - CDF/RDF - RR", icon: "🔵", type: "area", key: "RR", distribution: "weibull-cdf" },
    { id: 31, name: "Weibull Distribution - CDF/RDF - PR", icon: "🔵", type: "area", key: "PR", distribution: "weibull-cdf" },
    { id: 32, name: "Weibull Distribution - CDF/RDF - AR", icon: "🔵", type: "area", key: "AR", distribution: "weibull-cdf" },
    { id: 33, name: "Weibull Distribution - CDF/RDF - XEP", icon: "🔵", type: "area", key: "XEP", distribution: "weibull-cdf" },
    { id: 34, name: "Weibull Distribution - CDF/RDF - ∆GEQ", icon: "🔵", type: "area", key: "∆GEQ", distribution: "weibull-cdf" },
  
    { id: 35, name: "Weibull Distribution - PDF - RR", icon: "🔵", type: "line", key: "RR", distribution: "weibull-pdf" },
    { id: 36, name: "Weibull Distribution - PDF - PR", icon: "🔵", type: "line", key: "PR", distribution: "weibull-pdf" },
    { id: 37, name: "Weibull Distribution - PDF - AR", icon: "🔵", type: "line", key: "AR", distribution: "weibull-pdf" },
    { id: 38, name: "Weibull Distribution - PDF - XEP", icon: "🔵", type: "line", key: "XEP", distribution: "weibull-pdf" },
    { id: 39, name: "Weibull Distribution - PDF - ∆GEQ", icon: "🔵", type: "line", key: "∆GEQ", distribution: "weibull-pdf" },
  
    { id: 40, name: "Weibull Distribution - RISK - RR", icon: "🔵", type: "line", key: "RR", distribution: "weibull-risk" },
    { id: 41, name: "Weibull Distribution - RISK - PR", icon: "🔵", type: "line", key: "PR", distribution: "weibull-risk" },
    { id: 42, name: "Weibull Distribution - RISK - AR", icon: "🔵", type: "line", key: "AR", distribution: "weibull-risk" },
    { id: 43, name: "Weibull Distribution - RISK - XEP", icon: "🔵", type: "line", key: "XEP", distribution: "weibull-risk" },
    { id: 44, name: "Weibull Distribution - RISK - ∆GEQ", icon: "🔵", type: "line", key: "∆GEQ", distribution: "weibull-risk" },
  ];
  
  
  const [selectedChart, setSelectedChart] = useState(chart[0]);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!unitId) return;

    const fetchUnitData = async () => {
      try {
        setLoading(true);
        const unit = await getUnitById(unitId);

        setUnitData(unit);
        
        console.log("units", unit);
      } catch (err) {
        console.error("Failed to fetch unit data:", err);
        setError("Failed to load unit data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unitId]);

  console.log("unit data: ", unitData);
  useEffect(() => {
    const fetchDistributionData = async () => {
      if (!unitId) return;
      if (!candidatePpList || candidatePpList.length === 0) return;

      // Extract candidate IDs from candidatePpList
      const candidateIds = candidatePpList.map(item => item.candidateId);

      setLoading(true);
      setError(null);

      try {
        // Determine which API to call based on selected distribution type
        let data;
        
        if (selectedChart.distribution.startsWith("weibull") && !betaValue) {
          return; 
        }
        
        if (selectedChart.distribution.startsWith("weibull")) {
          let data;
          onWeibullSelect(true);
          // Call appropriate API based on distribution type
          if (selectedChart.distribution === "weibull-cdf") {
            data = await getWeibullCDFDistributionData({
              unitId,
              candidatePpList,
              beta: betaValue,
              key: selectedChart.key
            });
          } else if (selectedChart.distribution === "weibull-pdf") {
            data = await getWeibullPDFDistributionData({
              unitId,
              candidatePpList,
              beta: betaValue,
              key: selectedChart.key
            });
          } else if (selectedChart.distribution === "weibull-risk") {
            // You might need a separate API for risk, or calculate it from CDF data
            data = await getWeibullRiskDistributionData({
              unitId,
              candidatePpList,
              beta: betaValue,
              key: selectedChart.key
            });
          }
          
          console.log("weibull data: ", data);
          
          // Set the correct key based on the selected Weibull chart
          let distributionKey;
          if (selectedChart.key === "XEP") {
            distributionKey = "XEP";
          } else if (selectedChart.key === "∆GEQ") {
            distributionKey = "deltaGEQ";
          } else {
            distributionKey = selectedChart.key; // RR, PR, AR
          }
          
          // For risk charts, we need to transform the data
          if (selectedChart.distribution === "weibull-risk" && data && data.distributions) {
            const distribution = data.distributions[distributionKey];
            if (distribution && distribution.table) {
              // Transform the table to calculate risk
              distribution.table = distribution.table.map(row => ({
                ...row,
                risk: 1 - (row.R || 0)
              }));
            }
          }
          
          // Set the distributions and selected key
          setDistributions(data.distributions || data);
          setTableData(data);
          setSelectedKey(distributionKey);
          setLoading(false);
          return;
        }
        else if (selectedChart.distribution === "normal") {
          data = await getNormalDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });

          console.log("key data: ", selectedChart.key);
          console.log("key data: ", candidatePpList);

          onWeibullSelect(false);

        } else if (selectedChart.distribution === "t") {
          data = await getTDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          onWeibullSelect(false);

        } else if (selectedChart.distribution === "exponential") {
          data = await getExponentialDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          console.log("exponential data: ", data);
          onWeibullSelect(false);

          console.log("exponential data: ", getExponentialDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          }));
        } else if (selectedChart.distribution === "chi-square") {
          data = await getChiDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          onWeibullSelect(false);

          setDistributions(data);
          setTableData(data);
          setSelectedKey("CHI_SQUARE");
          setLoading(false);
          console.log("selected key:->", selectedKey);
          return;
        } else if (selectedChart.distribution === "f") {
          data = await getFDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          onWeibullSelect(false);
          setDistributions(data);
          setTableData(data);
          setSelectedKey("F_DIST");
          setLoading(false);
          console.log("selected key:->", selectedKey);
          return;
        } else if (selectedChart.distribution === "beta") {
          data = await getBetaDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          console.log("beta dis: ", data);
          onWeibullSelect(false);

        } else if (selectedChart.distribution === "uniform") {
          data = await getUniformDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          console.log("uniform dis: ", data);
          onWeibullSelect(false);

        }
        
        else {
          // Default to normal distribution if no specific API
          data = await getNormalDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
          onWeibullSelect(false);

        }

        setDistributions(data.distributions);
        setTableData(data);
        setSelectedKey(selectedChart.key);
      } catch (err) {
        console.error("Failed to fetch distribution data:", err);
        setError("Failed to load chart data.");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributionData();
  }, [unitId, candidatePpList, selectedChart, betaValue]);

  const getTableHeaderLabel = (key) => {

    if ((selectedChart.distribution === "weibull-pdf" || selectedChart.distribution === "weibull-risk") && key === "name") {
      return "Value (t)"; // or "Time (t)" if you prefer
    }
  
    if (key === "name") return getXAxisLabel();
  
    // Weibull specific
    if (key === "pdf") return "Probability Density F(t)";
    if (key === "cdf") return "Cumulative Distribution F(t)";
    if (key === "reliability") return "Reliability R(t)";
    if (key === "risk") return "Risk Function (1 - R(t))";
  
    // Generic Y axis value
    if (key === "value") return getYAxisLabel();
  
    // Fallback
    return key;
  };
  
  const handleChartSelect = (chartItem) => {
    setSelectedChart(chartItem);
    setSelectedKey(chartItem.key);
  };

  const num = (v) => (v === null || v === undefined || isNaN(v) ? 0 : v);

  const formatTableValue = (value) => {
    if (value === null || value === undefined) return "-";
  
    // Only format finite numbers
    if (typeof value === "number" && isFinite(value)) {
      return value.toFixed(3);
    }
  
    return value; // strings, labels, etc.
  };  
 

  // Update the chartData preparation for Weibull distributions
  const chartData = selectedChart.distribution.startsWith("weibull") ? (() => {
    // Handle different Weibull distribution types
    const distribution = distributions[selectedKey];
    if (!distribution || !distribution.table) return [];
    
    if (selectedChart.distribution === "weibull-cdf") {
      // For CDF/RDF, we need both F (CDF) and R (Reliability)
      return distribution.table.map((row) => ({
        name: num(row.t),
        cdf: num(row.F),
        reliability: num(row.R),
        
      }));
    } else if (selectedChart.distribution === "weibull-pdf") {
      // For PDF, use the 'f' value from the table
      return distribution.table.map((row) => ({
        name: num(row.t),
        pdf: num(row.f), // This is the PDF value
         // Keep CDF if available for reference
      }));
    } else if (selectedChart.distribution === "weibull-risk") {
      // For RISK, calculate risk = 1 - reliability
      return distribution.table.map((row) => ({
        name: num(row.t),
        risk: num(row.h), // Calculate risk from reliability
        
      }));
    }
    return [];
      })()
    : selectedChart.distribution === "chi-square" || selectedChart.distribution === "f"
    ? distributions?.distribution?.table?.map((row) => ({
        name: num(row.x),
        value: num(row.y),
      })) || []
      : selectedChart.distribution === "uniform"
    ? distributions[selectedKey]?.table?.map((row, index) => ({
        name: num(row.x),  // X value on x-axis
        value: num(row.stable),  // Stable (0 or 1) on y-axis
        stable: row.stable,  // Keep original for tooltip
        index: index  // Keep index for reference
      })) || []
    : distributions[selectedKey]?.table?.map((row) => ({
        name: num(row.x),
        value: num(row.y),
      })) || [];
  
    const getPatternCounts = () => {
      if (
        !tableData?.patterns ||
        !selectedChart ||
        !["beta", "uniform"].includes(selectedChart.distribution)
      ) {
        return null;
      }
    
      const patternKey = selectedChart.key; // STAP or STAG
      const patterns = tableData.patterns?.[patternKey] || [];
    
      const stableCount = patterns.filter((p) => p === "S").length;
      const unstableCount = patterns.filter((p) => p === "U").length;
    
      return {
        stableCount,
        unstableCount,
        total: patterns.length,
      };
    };

  // Map chartProperties into Recharts-friendly props
  const getLineStyle = () => {
    const styleMap = {
      solid: "",
      dashed: "5 5",
      dotted: "2 4"
    };

    return styleMap[chartProperties.lineStyle] || "";
  };

  const getSymbolShape = () => {
    const shapeMap = {
      circle: "circle",
      square: "square",
      triangle: "triangle",
      diamond: "diamond"
    };
    return shapeMap[chartProperties.symbolStyle] || "circle";
  };


  const getWeibullRiskReferenceValue = () => {
    // Static 0.7 for RR / PR / AR
    if (["RR", "PR", "AR"].includes(selectedChart.key)) {
      return 0.7;
    }
  
    if (!unitData) return null;
  
    // unitData is already the unit object
    if (selectedChart.key === "XEP") {
      return Number(unitData.XEP);
    }
  
    if (
      selectedChart.key === "∆GEQ" ||
      selectedChart.key === "deltaGEQ"
    ) {
      return Number(unitData["ΔGEQ"]);
    }
  
    return null;
  };
  
  
  // Render different chart types based on selected chart
  const renderChart = () => {
    if (loading) {
      return <p className="text-center">Loading...</p>;
    }
  
    if (error) {
      return <p className="text-center text-red-600">{error}</p>;
    }
  
    if (!chartData || chartData.length === 0) {
      return <p className="text-center uppercase">No data available for the selected chart.</p>;
    }
  
    const distributionParams = distributions[selectedKey]?.params;
    const mean = distributions[selectedKey]?.mean || 0;
  
    console.log("distribution mean: ",  mean);
    console.log("getReferenceLines distribution:", selectedChart.distribution);
  
    // Calculate reference line positions
    const getReferenceLines = () => {
      if (selectedChart.distribution === "normal") {
        const table = distributions[selectedKey]?.table || [];
      
        const zTargets = [-3, -2, -1, 0, 1, 2, 3];
      
        return zTargets
          .map(z => {
            const row = table.find(r => Math.abs(r.z - z) < 1e-6);
            if (!row) return null;
      
            return {
              z,
              value: row.x,
              label: z === 0 ? "Mean (σ=0)" : `σ = ${z}`,
              color:
                z === 0 ? "#000000" :
                Math.abs(z) === 1 ? "#ef4444" :
                Math.abs(z) === 2 ? "#f59e0b" :
                "#84cc16",
              strokeWidth: z === 0 ? 2 : 1,
              strokeDasharray: z === 0 ? "0" : "3 3"
            };
          })
          .filter(Boolean);
      }
  
      if (selectedChart.distribution === "exponential") {
        const mean = distributions[selectedKey]?.mean || 0;
        console.log("exponential mean: ", mean);
        return [
          {
            value: mean,
            label: `Mean (μ = ${mean.toFixed(3)})`,
            color: "#dc2626",
            strokeWidth: 2,
            strokeDasharray: "4 4"
          }
        ];
      }
  
      if (selectedChart.distribution === "f") {
        const params = distributions?.distribution?.parameters;
        if (!params) return [];
      
        const lines = [];
      
        if (Number.isFinite(params.fc)) {
          lines.push({
            value: params.fc,
            label: `Fc = ${params.fc.toFixed(3)}`,
            color: "#dc2626",
            strokeWidth: 2,
            strokeDasharray: "4 4"
          });
        }
      
        if (Number.isFinite(params.fStatistic)) {
          lines.push({
            value: params.fStatistic,
            label: `Fstat = ${params.fStatistic.toFixed(3)}`,
            color: "#2563eb",
            strokeWidth: 2,
            strokeDasharray: "2 2"
          });
        }
      
        return lines;
      }
  
      if (selectedChart.distribution === "chi-square") {
        // FIX: Use distributions?.distribution?.parameters instead of distributions[selectedKey]?.params
        const params = distributions?.distribution?.parameters;
        if (!params) return [];
      
        console.log("CHI PARAMS:", params);
      
        const lines = [];
      
        if (Number.isFinite(params.xc)) {
          lines.push({
            value: params.xc,
            label: `Critical Value (Xc = ${params.xc.toFixed(3)})`,
            color: "#dc2626",
            strokeWidth: 2,
            strokeDasharray: "4 4"
          });
        }
      
        if (Number.isFinite(params.x2Statistic)) {
          lines.push({
            value: params.x2Statistic,
            label: `Chi Square = ${params.x2Statistic.toFixed(3)}`,
            color: "#2563eb",
            strokeWidth: 2,
            strokeDasharray: "2 2"
          });
        }
      
        return lines;
      }
  
      return [];
    };
  
    // Render reference lines
    const renderReferenceLines = () => {
      const lines = getReferenceLines();
      if (!lines || lines.length === 0) return null;
    
      return lines.map((line, index) => (
        <ReferenceLine
          key={index}
          x={line.value}
          stroke={line.color}
          strokeWidth={line.strokeWidth}
          strokeDasharray={line.strokeDasharray || "3 3"}
          ifOverflow="extendDomain"
          label={{
            value: line.label,
            position: "top",
            fill: line.color,
            fontSize: 12,
            fontWeight: "bold"
          }}
        />
      ));
    };
  
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };
  
    switch (selectedChart.type) {
      case "area":
        if (selectedChart.distribution === "weibull-cdf") {
          const eta = Number(distributions[selectedKey]?.params?.eta);
          const referenceValue = getWeibullRiskReferenceValue();

          const xValues = chartData.map(d => Number(d.name));
  
          const minX = Math.min(
            ...xValues,
            Number.isFinite(referenceValue) ? referenceValue : Infinity,
            Number(eta)
          );
          
          const maxX = Math.max(
            ...xValues,
            Number.isFinite(referenceValue) ? referenceValue : -Infinity,
            Number(eta)
          );
          
  
          console.log("eta value:: ", eta);
          return (
            <AreaChart {...commonProps} width="100%" height="100%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                type="number"
                domain={[minX, maxX]}
                tickFormatter={(value) => Number(value).toFixed(2)}
              >
                <Label
                  value="Value"
                  position="insideBottom"
                  offset={-10}
                  textAnchor="middle"
                />
              </XAxis>
  
              <YAxis domain={[0, 1]} tickFormatter={(value) => Number(value).toFixed(2)} >
                <Label value="Weibull Distribution" angle={-90} position="insideLeft" textAnchor="middle" dx={-15} />
              </YAxis>
              <Tooltip 
                formatter={(value, name) => {
                  const labels = {
                    cdf: 'Cumulative Distribution (F)',
                    reliability: 'Reliability (R)'
                  };
                  return [`${value.toFixed(3)}`, labels[name] || name];
                }}
                labelFormatter={(label) => `t = ${label}`}
              />
              <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
              />
              
              {Number.isFinite(Number(eta)) && (
                <ReferenceLine
                  x={Number(eta)}
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                  label={{
                    value: `η = ${Number(eta).toFixed(3)}`,
                    position: "top",
                    fill: "#dc2626",
                    fontSize: 12,
                    fontWeight: "bold"
                  }}
                />
              )}
              
              {Number.isFinite(referenceValue) && (
                  <ReferenceLine
                    x={referenceValue}
                    stroke="#760fbf"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    ifOverflow="extendDomain"
                    label={{
                      value: referenceValue.toFixed(3),
                      position: "top",
                      fill: "#760fbf",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />
                )}
              
              <Area
                type="monotone"
                dataKey="cdf"
                stroke={chartProperties.lineColor}
                strokeWidth={chartProperties.lineThickness}
                strokeDasharray={getLineStyle()}
                fill={chartProperties.shadeArea}
                fillOpacity={0.3}
                hide={!chartProperties.visibility}
                name="Cumulative Distribution F(t)"
              />
              
              <Area
                type="monotone"
                dataKey="reliability"
                strokeWidth={chartProperties.lineThickness}
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0}
                name="Reliability R(t)"
              />
            </AreaChart>
          );
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                type="number"
                domain={['dataMin', 'dataMax']}
                allowDataOverflow
                tickFormatter={(v) => Number(v).toFixed(2)}
              >
                <Label value="Chi-Square Value" position="insideBottom" offset={-10} />
              </XAxis>
  
              <YAxis>
                <Label value={getYAxisLabel()} angle={-90} position="insideLeft" textAnchor="middle" dx={-15} />
              </YAxis>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
              />
              
              {renderReferenceLines()}
              <Area
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3} 
                name="Chi-Square Distribution"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
  
      case "bar":
        if (selectedChart.distribution === "uniform") {
          // Transform data for step function
          const transformUniformData = (data) => {
            const transformed = [];
            
            data.forEach((point, index) => {
              if (index === 0) {
                // First point - add as-is
                transformed.push({ name: point.name, value: point.stable });
              } else {
                const prevPoint = data[index - 1];
                
                // Add horizontal segment endpoint (stays at previous height)
                transformed.push({ 
                  name: point.name, 
                  value: prevPoint.stable 
                });
                
                // Add current point (creates vertical drop/rise)
                transformed.push({ 
                  name: point.name, 
                  value: point.stable 
                });
              }
            });
            
            return transformed;
          };
      
          const stepData = transformUniformData(chartData);
      
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={stepData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                >
                  <Label 
                    value="X Value" 
                    position="insideBottom" 
                    offset={-10} 
                    textAnchor="middle"
                  />
                </XAxis>
                <YAxis 
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  // tickFormatter={(value) => value === 1 ? 'Stable' : 'Unstable'}
                >
                  <Label 
                    value="Stability" 
                    angle={-90} 
                    position="insideLeft" 
                    offset={10} 
                    textAnchor="middle"
                  />
                </YAxis>
                <Tooltip 
                  formatter={(value) => [value === 1 ? 'Stable' : 'Unstable', 'Status']}
                  labelFormatter={(label) => `X Value: ${Number(label).toFixed(3)}`}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
                />
                
                <Line 
                  type="linear"
                  dataKey="value" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Uniform Distribution"
                />
              </LineChart>
            </ResponsiveContainer>
          );
        } else {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value={getXAxisLabel()} position="insideBottom" textAnchor="middle" offset={-10} />
                </XAxis>
                <YAxis>
                  <Label value={getYAxisLabel()} angle={-90} position="insideLeft" textAnchor="middle" offset={10} />
                </YAxis>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
                />
                <Bar dataKey="xValue" fill="#3b82f6" name="X Values" />
                <Bar dataKey="yValue" fill="#10b981" name="Y Values" />
              </BarChart>
            </ResponsiveContainer>
          );
        }
  
      case "line":
        if (selectedChart.distribution === "weibull-pdf") {
          const eta = num(distributions?.[selectedKey]?.params?.eta);	
          console.log("eta value:: ", eta);
  
          const referenceValue = getWeibullRiskReferenceValue();
          const xValues = chartData.map(d => d.name);
          const minX = Math.min(
            ...xValues,
            Number.isFinite(referenceValue) ? referenceValue : Infinity,
            Number(eta)
          );
          
          const maxX = Math.max(
            ...xValues,
            Number.isFinite(referenceValue) ? referenceValue : -Infinity,
            Number(eta)
          );
  
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  type="number"
                  domain={[minX, maxX]}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                  label={{ value: "Value (t)", position: "insideBottom", offset: -15 }}
                />
  
                <YAxis
                  tickFormatter={(value) => Number(value).toFixed(2)} 
                  label={{
                    value: "Weibull Distribution",
                    angle: -90,
                    position: "insideLeft",
                    textAnchor: "middle",
                    offset: -5,
                    
                  }}
                />
  
                <Tooltip 
                  formatter={(value, name) => {
                    const labels = {
                      pdf: 'Probability Density f(t)',
                      cumulative: 'Cumulative F(t)'
                    };
                    return [`${parseFloat(value).toFixed(3)}`, labels[name] || name];
                  }}
                  labelFormatter={(label) => `t = ${parseFloat(label).toFixed(3)}`}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={60}
                  wrapperStyle={{
                    bottom: -5,
                    paddingLeft: 10
                  }}
                />
  
                {Number.isFinite(Number(eta)) && (
                  <ReferenceLine 
                    x={Number(eta)}
                    stroke="#dc2626"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    ifOverflow="extendDomain"
                    label={{
                      value: `η = ${Number(eta).toFixed(3)}`,
                      position: "top",
                      fill: "#dc2626",
                      fontSize: 12,
                      fontWeight: "bold"
                    }}
                  />
                )}
                
                {Number.isFinite(referenceValue) && (
                  <ReferenceLine
                    x={referenceValue}
                    stroke="#760fbf"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    ifOverflow="extendDomain"
                    label={{
                      value: referenceValue.toFixed(3),
                      position: "top",
                      fill: "#760fbf",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />
                )}
                
                <Line 
                  type="monotone"
                  dataKey="pdf"
                  stroke={chartProperties.lineColor}
                  strokeWidth={chartProperties.lineThickness}
                  strokeDasharray={getLineStyle()}
                  dot={chartProperties.hideSymbols ? false : {
                    r: chartProperties.symbolScaleSize,
                    stroke: chartProperties.symbolColor,
                    fill: chartProperties.symbolColor
                  }}
                  activeDot={{
                    r: chartProperties.symbolScaleSize + 1,
                    stroke: chartProperties.symbolColor,
                    fill: chartProperties.symbolColor
                  }}
                  hide={!chartProperties.visibility}
                  name="Probability Density F(t)"
                />
                
                {chartData[0]?.cumulative && (
                  <Line 
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#9ca3af"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="CDF F(t) (reference)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          );
        } else if (selectedChart.distribution === "weibull-risk") {
          const distribution = distributions[selectedKey];
          const eta = distribution?.params?.eta;
          const beta = distribution?.params?.beta;
          const referenceValue = getWeibullRiskReferenceValue();

          console.log("Weibull Risk Distribution:", distribution);
          console.log("eta value:", eta);
          console.log("beta value:", beta);
          const xValues = chartData.map(d => d.name);
  
          console.log("xValues: ", referenceValue);
          const minX = Math.min(
            ...xValues,
            Number.isFinite(referenceValue) ? referenceValue : Infinity,
            Number(eta)
          );
          
          const maxX = Math.max(
            ...xValues,
            Number.isFinite(referenceValue) ? referenceValue : -Infinity,
            Number(eta)
          );
          
  
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  type="number"
                  domain={[minX, maxX]}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                  label={{ value: "Value (t)", position: "insideBottom", offset: -14 }}
                />
  
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(value) => Number(value).toFixed(2)} 
                  label={{
                    value: "Weibull Distribution",
                    angle: -90,
                    position: "insideLeft",
                    textAnchor: "middle",
                    dy: 0
                  }}
                />
        
                <Tooltip 
                  formatter={(value, name) => {
                    const labels = {
                      risk: 'Risk (1 - R)',
                      reliability: 'Reliability R(t)'
                    };
                    return [`${parseFloat(value).toFixed(3)}`, labels[name] || name];
                  }}
                  labelFormatter={(label) => `t = ${parseFloat(label).toFixed(3)}`}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={50}
                  wrapperStyle={{
                    bottom: 0,
                    paddingLeft: 60
                  }}
                />
        
                {Number.isFinite(Number(eta)) && (
                  <ReferenceLine
                    x={Number(eta)}
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    ifOverflow="extendDomain"
                    label={{
                      value: `η = ${Number(eta).toFixed(3)}`,
                      position: "top",
                      fill: "#dc2626",
                      fontSize: 12,
                      fontWeight: "bold"
                    }}
                  />
                )}
                
                {beta !== undefined && beta !== null && !isNaN(Number(beta)) && (
                  <ReferenceLine 
                    x={chartData.length > 0 ? chartData[chartData.length - 1]?.name * 0.95 || 0 : 0}
                    stroke="transparent"
                    label={{
                      value: `β = ${Number(beta).toFixed(3)}`,
                      position: 'top',
                      fill: '#6b7280',
                      fontSize: 10
                    }}
                  />
                )}
                
                {Number.isFinite(referenceValue) && (
                  <ReferenceLine
                    x={referenceValue}
                    stroke="#760fbf"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    ifOverflow="extendDomain"
                    label={{
                      value: referenceValue.toFixed(3),
                      position: "top",
                      fill: "#760fbf",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />
                )}

                
                <Line 
                  type="monotone"
                  dataKey="risk"
                  stroke={chartProperties.lineColor}
                  strokeWidth={chartProperties.lineThickness}
                  strokeDasharray={getLineStyle()}
                  dot={chartProperties.hideSymbols ? false : {
                    r: chartProperties.symbolScaleSize,
                    stroke: chartProperties.symbolColor,
                    fill: chartProperties.symbolColor
                  }}
                  activeDot={{
                    r: chartProperties.symbolScaleSize + 1,
                    stroke: chartProperties.symbolColor,
                    fill: chartProperties.symbolColor
                  }}
                  hide={!chartProperties.visibility}
                  name="Risk Function (1 - R(t))"
                />
              </LineChart>
            </ResponsiveContainer>
          );
        }  
        
        default:
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  allowDataOverflow={true}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                >
                  <Label value={getXAxisLabel()} position="insideBottom" offset={-10} textAnchor="middle" />
                </XAxis>
                <YAxis domain={['dataMin', 'auto']} allowDataOverflow={false} tickFormatter={(value) => Number(value).toFixed(2)}>
                  <Label value={getYAxisLabel()} angle={-90} position="insideLeft" textAnchor="middle" dx={-15}   />
                </YAxis>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
                />
  
                {renderReferenceLines()}
                
                {selectedChart.distribution === "exponential" && (
                  <ReferenceLine
                    x={mean}
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    label={{
                      value: `Mean (μ = ${mean.toFixed(3)})`,
                      position: "top",
                      fill: '#320ff7',
                      fontSize: 12,
                      fontWeight: "bold"
                    }}
                  />
                )}
  
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartProperties.lineColor}
                  strokeWidth={chartProperties.lineThickness}
                  strokeDasharray={getLineStyle()}
                  dot={chartProperties.hideSymbols ? false : {
                    r: chartProperties.symbolScaleSize,
                    stroke: chartProperties.symbolColor,
                    fill: chartProperties.symbolColor
                  }}
                  activeDot={{
                    r: chartProperties.symbolScaleSize + 1,
                    stroke: chartProperties.symbolColor,
                    fill: chartProperties.symbolColor
                  }}
                  hide={!chartProperties.visibility}
                  name="Distribution"
                />
              </LineChart>
            </ResponsiveContainer>
          );
      }
    };

  // Helper functions for axis labels
  const getXAxisLabel = () => {
    if (selectedChart.distribution === "uniform") {
      return "Stable Status";
    }
    if (selectedChart.distribution.includes("weibull")) {
      return "Value";
    }
    if (selectedChart.distribution === "chi-square") {
      return "Chi-Square Value";
    }
    if (selectedChart.distribution === "exponential") {
      return "Time (Days)";
    }
    return "Z-Score";
  };

  const getYAxisLabel = () => {
    if (selectedChart.distribution === "uniform") {
      return "X Value";
    }
    if (selectedChart.distribution === "exponential") {
      return "Exponential Distribution";
    }

    if (selectedChart.distribution === "f") {
      return "F Distribution";
    }

    if (selectedChart.distribution === "beta") {
      return "Beta Distribution";
    }

    if (selectedChart.distribution.includes("weibull-pdf")) {
      return "Distribution";
    }
    if (selectedChart.distribution.includes("weibull-cdf")) {
      return "Distribution";
    }
    if (selectedChart.distribution.includes("weibull-risk")) {
      return "Distribution";
    }
    if (selectedChart.distribution === "chi-square") {
      return "Probability";
    }
    return "Standard Distribution";
  };
  

  console.log("table data::->", tableData);

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

  const [showCandidateTable, setShowCandidateTable] = useState(false);
  const handlePlusClick = () => {
    setShowCandidateTable(true);
  };

  const handleCandidateSubmit = (selectionData) => {
    setShowCandidateTable(false);
  
    setCandidatePpList(selectionData.candidatePpList);  
  
    if (onCandidatesSelected) {
      onCandidatesSelected(selectionData);
    }
    console.log("selectionData:: ", selectionData);
  };
  
  console.log("candidatePpList:: ", candidatePpList);

  const captureChart = async () => {
    const inner = chartInnerRef.current;
    const outer = chartContainerRef.current;
    if (!inner || !outer) throw new Error("Chart not found");
  
    // Save original styles
    const saved = {
      innerHeight:   inner.style.height,
      innerMaxH:     inner.style.maxHeight,
      innerOverflow: inner.style.overflow,
      innerWidth:    inner.style.width,
      outerOverflow: outer.style.overflow,
      outerHeight:   outer.style.height,
    };
  
    const captureWidth = outer.getBoundingClientRect().width;
  
    // Measure actual content height (title + chart, no empty space)
    const contentHeight = inner.scrollHeight;
  
    // Unclip everything so html2canvas sees the full content
    inner.style.height    = `${contentHeight}px`;
    inner.style.maxHeight = 'none';
    inner.style.overflow  = 'visible';
    inner.style.width     = `${captureWidth}px`;
    outer.style.overflow  = 'visible';
    outer.style.height    = `${contentHeight + 20}px`; // tight fit, no extra whitespace
  
    await new Promise((r) => setTimeout(r, 400));
  
    const canvas = await html2canvas(inner, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: chartProperties.shadeArea || '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: captureWidth,
      height: contentHeight,
      windowWidth: captureWidth,
      windowHeight: contentHeight,
    });
  
    // Restore styles
    inner.style.height    = saved.innerHeight;
    inner.style.maxHeight = saved.innerMaxH;
    inner.style.overflow  = saved.innerOverflow;
    inner.style.width     = saved.innerWidth;
    outer.style.overflow  = saved.outerOverflow;
    outer.style.height    = saved.outerHeight;
  
    return canvas;
  };
  
  const exportAsJPG = async () => {
    if (!chartContainerRef.current) {
      alert("No chart available to export");
      return;
    }
  
    try {
      const container = chartContainerRef.current;
  
      // Get actual visible size (NOT scroll size)
      const rect = container.getBoundingClientRect();
  
      // Wait a bit to ensure charts fully render
      await new Promise((resolve) => setTimeout(resolve, 300));
  
      const canvas = await html2canvas(container, {
        scale: 2,
        width: rect.width,
        height: rect.height,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
      });
  
      canvas.toBlob((blob) => {
        saveAs(
          blob,
          `Plot Extraction.jpg`
        );
      }, "image/jpeg", 0.95);
  
    } catch (error) {
      console.error("JPG Export failed:", error);
      alert("Failed to export as JPG: " + error.message);
    }
  };
  
  const exportAsPDF = async () => {
    try {
      const canvas = await captureChart();
      const imgData = canvas.toDataURL('image/png');
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`chart-${selectedChart?.name?.replace(/[^a-z0-9]/gi, '_') || 'export'}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to export as PDF: ' + error.message);
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

  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className="pl-2 text-md">Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2">
        <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200 p-1">
          <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePlusClick} title="Add Distribution Object"  className='text-blue-600 hover:text-red-800 cursor-pointer'>
                    <Plus className="w-4 h-4 hover:text-blue-600" />
                </button>
              <button
                onClick={() => {
                  onResetBeta();      
                }}
                title="Reset Filter"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <RefreshCw
                  className="w-4 h-4 hover:text-blue-800"
                />
              </button>
              <div className="relative" ref={exportMenuRef}>
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
            <div className=" h-[30%] flex flex-col border border-gray-200  ">
              <div className="flex-1 overflow-auto  ">
                <div className="h-full overflow-hidden flex flex-col">
                    {/* Table Header - Fixed */}
                    <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm">
                      <div className="col-span-10 px-2 py-1 text-left font-medium">Entities</div>
                      <div className="col-span-2 py-1 text-left font-medium">ID</div>
                    </div>
                    
                    {/* Table Body - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                    {chart.filter(item => {
                        // Hide AR and deltaAR charts unless Third Parameter
                        if (item.key === "AR" || item.key === "deltaAR") {
                          return unitType === "Third Parameter";
                        }
                        return true;
                      })
                      .map((item, index) => (
                        <div 
                          key={item.id} 
                          className={`grid grid-cols-12 hover:bg-gray-100 cursor-pointer ${
                            selectedChart.id === item.id ? "bg-gray-200" : ""
                          }`}
                          onClick={() => handleChartSelect(item)}
                        >
                          <div className="col-span-10 px-2 py-1 whitespace-nowrap text-xs">
                            <div className="flex items-center">
                              <span className="mr-2">{item.icon}</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                          </div>
                          <div className="col-span-2 px-3 py-1 whitespace-nowrap text-xs">
                            {index + 1}
                          </div>
                        </div>
                      ))} 
                    </div>
                  </div>
              </div>
            </div>

            <div className="h-[70%] flex flex-col border border-gray-200">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm  cursor-pointer ${
                    activeAdjustPropertieTab === "Property editor"
                      ?  "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                  }`}
                  onClick={() => setActiveAdjustPropertieTab("Property editor")}
                >
                  Property editor
                </button>
                <button
                  className={`px-3 py-1 text-sm  cursor-pointer ${
                    activeAdjustPropertieTab === "Table"
                      ?  "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                  }`}
                  onClick={() => setActiveAdjustPropertieTab("Table")}
                >
                  Table
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full">
                {activeAdjustPropertieTab === "Property editor" && (
                  // <PropertyEditor
                  //   properties={chartProperties}
                  //   onChange={setChartProperties}
                  // />
                  <div className="text-sm text-center text-gray-600 mt-2">
                    <p>NOT AVAILABLE FOR THE SELECTED CHART </p>
                  </div>

                )}

                {/* DYNAMIC TABLE SECTION */}
                {activeAdjustPropertieTab === "Table" && chartData && chartData.length > 0 && (
                  <div className="text-xs text-gray-600 mt-2 w-full overflow-auto mb-10">
                    <table
                      className="text-xs border border-gray-300"
                      style={{ width: "max-content", minWidth: "100%" }}
                    >
                      {/* ✅ UNIFORM TABLE */}
                      {selectedChart.distribution === "uniform" ? (
                        <>
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-2 py-1 text-center">
                                X Value
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-center">
                                Stability
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {chartData.map((row, index) => (
                              <tr key={index} className="hover:bg-blue-50">
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  {Number(row.name).toFixed(3)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  {Number(row.value).toFixed(3)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      ) : (
                        /* ✅ DEFAULT TABLE (unchanged) */
                        <>
                          <thead className="bg-gray-100">
                            <tr>
                              {Object.keys(chartData[0]).map((col, i) => (
                                <th
                                  key={i}
                                  className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center "
                                >
                                  {getTableHeaderLabel(col)}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {chartData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-blue-50">
                                {Object.values(row).map((value, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center"
                                  >
                                    {formatTableValue(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div ref={chartContainerRef} className="w-6/12 lg:w-9/12 flex flex-col border-2 border-gray-200 ml-1 h-full" style={{ backgroundColor: chartProperties.shadeArea }} >
          <div ref={chartInnerRef} className="h-full flex flex-col m-5">
            <div className="flex items-center justify-between mb-4 w-full">
  
              {/* Left spacer to keep title centered */}
              <div className="w-[120px]" />

              {/* Center Title */}
              <h2 className="text-lg text-center font-semibold text-gray-700 flex-1">
                {selectedChart.icon} {selectedChart.name}
              </h2>

              {/* Right Side Counts */}
              <div className="w-[50px] flex justify-end gap-2">
                {getPatternCounts() && (
                  <div className="">
                    <div className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      UNSTABLE: {getPatternCounts().unstableCount}
                    </div>

                    <div className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      STABLE: {getPatternCounts().stableCount}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0 relative">
              {loading && (
                <p className="text-center text-gray-600">Loading...</p>
              )}

              {error && (
                <p className="text-center text-red-600">{error}</p>
              )}

              {!loading && !error && (!chartData || chartData.length === 0) && (
                <p className="absolute top-0 left-0 w-full text-center text-gray-500 whitespace-nowrap uppercase mt-2">
                Build a Distribution to display data.
              </p>
              )}

              {!loading && !error && chartData && chartData.length > 0 && (
                <div className="w-full h-full max-h-[600px]">
                {renderChart()}
              </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {showCandidateTable && (
        <CandidateSelectionTable
          rows={candidateRows}
          setRows={setCandidateRows}
          onClose={handleCandidateSubmit} // Use the correct handler
        />
      )}

    </>
  );
}

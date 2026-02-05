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
  Bar
} from "recharts";
import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import PropertyEditor from "./PropertyEditor";
import CandidateSelectionTable from "./CandidateSelection";
import { getBetaDistributionData, getChiDistributionData, getChilDistributionData, getExponentialDistributionData, getFDistributionData, getNormalDistributionData, getTDistributionData, getUniformDistributionData, getWeibullCDFDistributionData, getWeibullPDFDistributionData, getWeibullRiskDistributionData } from "@/services/unitDistributionService";
import jsPDF from "jspdf";

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

  const [ScoreAdd, setScoreAdd] = useState(false);
  const [candidatePpList, setCandidatePpList] = useState([]);
  const [candidateRows, setCandidateRows] = useState([]);
  const chartRows = [
    "RR", "PR", "AR", "XEQ", "XCP", "XBP", "deltaRR", "deltaPR", "deltaAR", "deltaGEQ"
  ];

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
  
    { id: 11, name: "T Distribution - RR", icon: "🔵", type: "line", key: "RR", distribution: "t" },
    { id: 12, name: "T Distribution - PR", icon: "🔵", type: "line", key: "PR", distribution: "t" },
    { id: 13, name: "T Distribution - AR", icon: "🔵", type: "line", key: "AR", distribution: "t" },
    { id: 14, name: "T Distribution - XEQ", icon: "🔵", type: "line", key: "XEQ", distribution: "t" },
    { id: 15, name: "T Distribution - ∆RR", icon: "🔵", type: "line", key: "deltaRR", distribution: "t" },
    { id: 16, name: "T Distribution - ∆PR", icon: "🔵", type: "line", key: "deltaPR", distribution: "t" },
    { id: 17, name: "T Distribution - ∆AR", icon: "🔵", type: "line", key: "deltaAR", distribution: "t" },
    { id: 18, name: "T Distribution - ∆GEQ", icon: "🔵", type: "line", key: "deltaGEQ", distribution: "t" },
  
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
            data = await getWeibullCDFDistributionData(unitId, candidateIds, betaValue);
          } else if (selectedChart.distribution === "weibull-pdf") {
            data = await getWeibullPDFDistributionData(unitId, candidateIds, betaValue);
          } else if (selectedChart.distribution === "weibull-risk") {
            // You might need a separate API for risk, or calculate it from CDF data
            data = await getWeibullRiskDistributionData(unitId, candidateIds, betaValue);
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
          data = await getExponentialDistributionData(unitId, candidateIds);
          onWeibullSelect(false);

          console.log("exponential data: ", getExponentialDistributionData(unitId, candidateIds));
        } else if (selectedChart.distribution === "chi-square") {
          data = await getChiDistributionData(unitId, candidateIds);
          onWeibullSelect(false);

          setDistributions(data);
          setTableData(data);
          setSelectedKey("CHI_SQUARE");
          setLoading(false);
          console.log("selected key:->", selectedKey);
          return;
        } else if (selectedChart.distribution === "f") {
          data = await getChiDistributionData(unitId, candidateIds);
          onWeibullSelect(false);
          setDistributions(data);
          setTableData(data);
          setSelectedKey("F_DIST");
          setLoading(false);
          console.log("selected key:->", selectedKey);
          return;
        } else if (selectedChart.distribution === "beta") {
          data = await getBetaDistributionData(unitId, candidateIds);
          onWeibullSelect(false);

        } else if (selectedChart.distribution === "uniform") {
          data = await getUniformDistributionData(unitId, candidateIds);
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
    if (key === "name") return getXAxisLabel();
  
    // Weibull specific
    if (key === "pdf") return "Probability Density f(t)";
    if (key === "cdf") return "Cumulative Distribution F(t)";
    if (key === "reliability") return "Reliability R(t)";
    if (key === "risk") return "Risk (1 - R)";
  
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
        pdf: null // We don't have PDF data here
      }));
    } else if (selectedChart.distribution === "weibull-pdf") {
      // For PDF, use the 'f' value from the table
      return distribution.table.map((row) => ({
        name: num(row.t),
        pdf: num(row.f), // This is the PDF value
        cumulative: num(row.F)  // Keep CDF if available for reference
      }));
    } else if (selectedChart.distribution === "weibull-risk") {
      // For RISK, calculate risk = 1 - reliability
      return distribution.table.map((row) => ({
        name: num(row.t),
        risk: num(row.h), // Calculate risk from reliability
        reliability: num(row.R) // Keep reliability for reference
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
    ? distributions[selectedKey]?.table?.map((row) => ({
        name: num(row.stable),
        value: num(row.x),
      })) || []
    : distributions[selectedKey]?.table?.map((row) => ({
        name: num(row.x),
        value: num(row.y),
      })) || [];
  

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


  // Render different chart types based on selected chart
  const renderChart = () => {
    if (loading) {
      return <p className="text-center">Loading...</p>;
    }

    if (error) {
      return <p className="text-center text-red-600">{error}</p>;
    }

    if (!chartData || chartData.length === 0) {
      return <p className="text-center">No data available for the selected chart.</p>;
    }

    const distributionParams = distributions[selectedKey]?.params;
    const mean = distributions[selectedKey]?.mean || 0;
    // Calculate reference line positions
    const getReferenceLines = () => {
      if (selectedChart.distribution === "normal") {
        const mean = distributions[selectedKey]?.params?.mu || 0;
        const sigma = distributions[selectedKey]?.params?.sigma || 1;
        return [
          { value: mean, label: 'Mean', color: '#000000', strokeWidth: 2 },
          { value: +sigma, label: '+σ', color: '#ef4444', strokeWidth: 1 },
          { value: -sigma, label: '-σ', color: '#ef4444', strokeWidth: 1 },
          { value: +2 * sigma, label: '+2σ', color: '#f59e0b', strokeWidth: 1 },
          { value: -2 * sigma, label: '-2σ', color: '#f59e0b', strokeWidth: 1 },
          { value: +3 * sigma, label: '+3σ', color: '#84cc16', strokeWidth: 1 },
          { value: -3 * sigma, label: '-3σ', color: '#84cc16', strokeWidth: 1 },
        ];
      }

      if (selectedChart.distribution === "exponential") {
        const mean = distributions[selectedKey]?.mean || 0;
        return [
          { 
            value: mean, 
            label: `Mean (${mean.toFixed(3)})`, 
            color: '#dc2626', 
            strokeWidth: 2,
            strokeDasharray: "3 3"
          }
        ];
      }

      if (selectedChart.distribution === "uniform") {
        const lines = [];
        
        // For bar charts, these will be horizontal lines (Y-axis reference)
        if (mean !== undefined) {
          lines.push({
            value: mean,
            label: `Mean (${mean.toFixed(3)})`,
            color: '#dc2626',
            strokeWidth: 2,
            strokeDasharray: "3 3"
          });
        }
        
        if (distributionParams?.a !== undefined) {
          lines.push({
            value: distributionParams.a,
            label: `Min (${distributionParams.a})`,
            color: '#10b981',
            strokeWidth: 1,
            strokeDasharray: "2 2"
          });
        }
        
        if (distributionParams?.b !== undefined) {
          lines.push({
            value: distributionParams.b,
            label: `Max (${distributionParams.b})`,
            color: '#10b981',
            strokeWidth: 1,
            strokeDasharray: "2 2"
          });
        }
        
        return lines;
      }

      if (selectedChart.distribution === "chi-square") {
        const xc = distributions?.distribution?.parameters?.xc;
        const x2Statistic = distributions?.distribution?.parameters?.x2Statistic;
        const lines = [];
        
        if (xc) {
          lines.push({
            value: xc,
            label: `Critical Value (${xc.toFixed(2)})`,
            color: '#dc2626',
            strokeWidth: 2,
            strokeDasharray: "3 3"
          });
        }
        
        if (x2Statistic) {
          lines.push({
            value: x2Statistic,
            label: `X² Statistic (${x2Statistic.toFixed(2)})`,
            color: '#3b82f6',
            strokeWidth: 2
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
      
      // Check if we're rendering a bar chart (uniform distribution)
      const isBarChart = selectedChart.distribution === "uniform" && selectedChart.type === "bar";
      
      return lines.map((line, index) => {
        if (isBarChart) {
          // For bar charts, use y prop for horizontal lines
          return (
            <ReferenceLine
              key={index}
              y={line.value}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.strokeDasharray}
              label={{
                value: line.label,
                position: 'right',
                fill: line.color,
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          );
        } else {
          // For line/area charts, use x prop for vertical lines
          return (
            <ReferenceLine
              key={index}
              x={line.value}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.value === mean ? "0" : line.strokeDasharray || "3 3"}
              label={{
                value: line.label,
                position: 'top',
                fill: line.color,
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
          );
        }
      });
    };


    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 0, bottom: 20 }
    };

    switch (selectedChart.type) {
      case "area":
        if (selectedChart.distribution === "weibull-cdf") {
          const eta = Number(distributions[selectedKey].params.eta);
          console.log("eta value:: ", eta);
          return (
            <AreaChart {...commonProps} width={600} height={400}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={(value) => Number(value).toFixed(2)}>
                <Label value="Time/Value" position="insideBottom"  textAnchor="middle" offset={-10} />
              </XAxis>
              <YAxis domain={[0, 1]}>
                <Label value="Probability" angle={-90} position="insideLeft"  textAnchor="middle" offset={10} />
              </YAxis>
              <Tooltip 
                formatter={(value, name) => {
                  const labels = {
                    cdf: 'Cumulative Distribution (F)',
                    reliability: 'Reliability (R)'
                  };
                  return [`${value.toFixed(4)}`, labels[name] || name];
                }}
                labelFormatter={(label) => `t = ${label}`}
              />
              <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
              />
              
              {/* Add vertical line at eta value */}
              
              {eta && (
                <ReferenceLine
                  x={eta}
                  stroke="#ff0000" // Changed to RED for visibility
                  strokeWidth={3} // Thicker
                  label={{
                    value: `η = ${eta.toFixed(3)}`,
                    position: 'top',
                    fill: '#ff0000',
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}
                />
              )}
           
              
              {/* Add vertical line at 0.700 (if applicable) */}
              <ReferenceLine 
                x={0.700}
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: '0.700',
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 10
                }}
              />
              
              {/* CDF Area */}
              <Area
                type="monotone"
                dataKey="cdf"
                stroke={chartProperties.lineColor}
                strokeWidth={chartProperties.lineThickness}
                strokeDasharray={getLineStyle()}
                fill={chartProperties.shadeArea}
                fillOpacity={0.3}
                hide={!chartProperties.visibility}
                name="Cumulative Distribution (F)"
              />
              
              {/* Reliability Area */}
              <Area
                type="monotone"
                dataKey="reliability"
                strokeWidth={chartProperties.lineThickness}
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0}
                name="Reliability (R)"
              />
            </AreaChart>
          );
        }
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(value) => Number(value).toFixed(2)}>
            <Label value={getXAxisLabel()} position="insideBottom"  textAnchor="middle" offset={-10} />
          </XAxis>
          <YAxis>
            <Label value={getYAxisLabel()} angle={-90} position="insideLeft"  textAnchor="middle" offset={10} />
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
      );

      case "bar":
        // For uniform distribution, we need special handling
        if (selectedChart.distribution === "uniform") {
          return (
            <BarChart 
              width={600} 
              height={400}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                // dataKey="name"
                // label={{ 
                //   value: "Stable Status", 
                //   position: "insideBottom", 
                //   offset: -10 
                // }}
                
              >
                <Label 
                  value="Stable Status" 
                  position="insideBottom" 
                  offset={-10} 
                  textAnchor="middle"
                />
              </XAxis>
              <YAxis >
                <Label 
                  value="X Value" 
                  angle={-90} 
                  position="insideLeft" 
                  offset={10} 
                  textAnchor="middle"
                />
              </YAxis>
              {/* In the uniform distribution bar chart section, update the Tooltip: */}
              <Tooltip 
                formatter={(value, name, props) => {
                  const dataPoint = props.payload;
                  if (dataPoint?.originalValues) {
                    // Show all original x values for this stable status
                    return [
                      `Average X: ${value.toFixed(4)}`,
                      `Values: ${dataPoint.originalValues.join(', ')}`,
                      `Count: ${dataPoint.count}`
                    ];
                  }
                  return [`X Value: ${value.toFixed(4)}`];
                }}
                labelFormatter={(label) => `Stable: ${label === '1' ? 'Yes' : 'No'}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
              />
              
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                name="X Value"
                barSize={60}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          );
        } else {
          // For other bar charts (not uniform)
          return (
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
          );
        }

      case "line":
        if (selectedChart.distribution === "weibull-pdf") {
          const eta = num(distributions?.[selectedKey]?.params?.eta);	
          console.log("eta value:: ", eta);
          return (
            <LineChart width={600} height={460} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                label={{ value: "Time/Value (t)", position: "insideBottom", offset: -15 }}
                textAnchor="middle"
                tickFormatter={(value) => Number(value).toFixed(2)}
              />
              <YAxis
                label={{
                  value: "Probability Density f(t)",
                  angle: -90,
                  position: "insideLeft",
                  textAnchor: "middle",
                  dy: 0
                }}
              />

              <Tooltip 
                formatter={(value, name) => {
                  const labels = {
                    pdf: 'Probability Density f(t)',
                    cumulative: 'Cumulative F(t)'
                  };
                  return [`${parseFloat(value).toFixed(4)}`, labels[name] || name];
                }}
                labelFormatter={(label) => `t = ${parseFloat(label).toFixed(3)}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                height={60}
                wrapperStyle={{
                  bottom: -25,
                  paddingLeft: 10
                }}
              />

                <ReferenceLine 
                  x={eta}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label={{
                    value: eta,
                    position: 'top',
                    fill: '#10b981',
                    fontSize: 10
                  }}
                />

              
              {/* Add vertical line at 0.700 if it's within the data range */}
              {chartData.some(point => point.name >= 0.700 && point.name <= 0.700 + (distributions[selectedKey]?.params?.step || 0.05)) && (
                <ReferenceLine 
                  x={0.700}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label={{
                    value: '0.700',
                    position: 'top',
                    fill: '#10b981',
                    fontSize: 10
                  }}
                />
              )}
              
              {/* Add information about beta (shape parameter) */}
              {distributions[selectedKey]?.params?.beta && (
                <ReferenceLine 
                  x={chartData[chartData.length - 1]?.name * 0.95 || 0}
                  stroke="transparent"
                  label={{
                    value: `β = ${distributions[selectedKey].params.beta}`,
                    position: 'top',
                    fill: '#6b7280',
                    fontSize: 10
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
                name="Weibull PDF f(t)"
              />
              
              {/* Optionally show CDF as a dashed line for reference */}
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
          );
        } else if (selectedChart.distribution === "weibull-risk") {
          return (
            <LineChart width={600} height={400} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" tickFormatter={(value) => Number(value).toFixed(2)}
                label={{ value: "Time/Value (t)", position: "insideBottom", offset: -14 }}
                textAnchor="middle"
              />
              <YAxis
                domain={[0, 1]}
                label={{
                  value: "Risk (1 - R(t))",
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
                  return [`${parseFloat(value).toFixed(4)}`, labels[name] || name];
                }}
                labelFormatter={(label) => `t = ${parseFloat(label).toFixed(3)}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                height={50}
                wrapperStyle={{
                  bottom: -20,
                  paddingLeft: 60
                }}
              />

              
              {/* Add vertical line at eta value */}
              {selectedChart.distribution === "weibull-risk" && distributions[selectedKey]?.params?.eta && (
                <ReferenceLine 
                  x={distributions[selectedKey].params.eta}
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: `η = ${distributions[selectedKey].params.eta.toFixed(3)}`,
                    position: 'top',
                    fill: '#dc2626',
                    fontSize: 12
                  }}
                />
              )}
              
              {/* Add horizontal line at 0.5 (50% risk) */}
              <ReferenceLine 
                x={0.7}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: '0.700',
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 10
                }}
              />
              
              {/* Add information about beta */}
              {distributions[selectedKey]?.params?.beta && (
                <ReferenceLine 
                  x={chartData[chartData.length - 1]?.name * 0.95 || 0}
                  stroke="transparent"
                  label={{
                    value: `β = ${distributions[selectedKey].params.beta}`,
                    position: 'top',
                    fill: '#6b7280',
                    fontSize: 10
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
              
              {/* Optionally show reliability as a dashed line for reference */}
              {chartData[0]?.reliability !== undefined && (
                <Line 
                  type="monotone"
                  dataKey="reliability"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Reliability R(t) (reference)"
                  legendType="none"
                />
              )}
            </LineChart>
          );
        }
        default:
          return (
            <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickFormatter={(value) => Number(value).toFixed(2)} >
              <Label value={getXAxisLabel()} position="insideBottom" offset={-10} textAnchor="middle" />
            </XAxis>
            <YAxis domain={['dataMin', 'auto']} allowDataOverflow={false}>
              <Label value={getYAxisLabel()} angle={-90} position="insideLeft" offset={10} textAnchor="middle" />
            </YAxis>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }}
            />

            {renderReferenceLines()}
            
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
          );
      }
  };

  // Helper functions for axis labels
const getXAxisLabel = () => {
  if (selectedChart.distribution === "uniform") {
    return "Stable Status";
  }
  if (selectedChart.distribution.includes("weibull")) {
    return "Time/Value (t)";
  }
  if (selectedChart.distribution === "chi-square") {
    return "Chi-Square Value";
  }
  return "Z-Score";
};

const getYAxisLabel = () => {
  if (selectedChart.distribution === "uniform") {
    return "X Value";
  }
  if (selectedChart.distribution.includes("weibull-pdf")) {
    return "Probability Density";
  }
  if (selectedChart.distribution.includes("weibull-cdf")) {
    return "Probability";
  }
  if (selectedChart.distribution.includes("weibull-risk")) {
    return "Risk (1 - R)";
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

  const exportAsJPG = async () => {
    if (!chartContainerRef.current) {
      alert("No chart available to export");
      return;
    }
  
    try {
      const container = chartContainerRef.current;
      
      // Store original parent styles
      const parentContainer = container.closest('[class*="overflow"]');
      const parentOriginalStyles = parentContainer ? {
        overflow: parentContainer.style.overflow,
        height: parentContainer.style.height,
      } : null;
  
      // Expand parent if it exists
      if (parentContainer) {
        parentContainer.style.overflow = 'visible';
        parentContainer.style.height = 'auto';
      }
      
      // Wait for Recharts to fully render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: chartProperties.shadeArea || '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });
  
      // Restore parent styles
      if (parentContainer && parentOriginalStyles) {
        parentContainer.style.overflow = parentOriginalStyles.overflow;
        parentContainer.style.height = parentOriginalStyles.height;
      }
  
      canvas.toBlob((blob) => {
        saveAs(blob, `chart-${selectedChart?.name?.replace(/[^a-z0-9]/gi, '_') || 'export'}-${new Date().getTime()}.jpg`);
      }, 'image/jpeg', 0.95);
  
      console.log('✅ JPG Export successful');
  
    } catch (error) {
      console.error('❌ JPG Export failed:', error);
      alert('Failed to export as JPG: ' + error.message);
    }
  };
  
  const exportAsPDF = async () => {
    if (!chartContainerRef.current) {
      alert("No chart available to export");
      return;
    }
  
    try {
      const container = chartContainerRef.current;
      
      // Store original parent styles
      const parentContainer = container.closest('[class*="overflow"]');
      const parentOriginalStyles = parentContainer ? {
        overflow: parentContainer.style.overflow,
        height: parentContainer.style.height,
      } : null;
  
      // Expand parent if it exists
      if (parentContainer) {
        parentContainer.style.overflow = 'visible';
        parentContainer.style.height = 'auto';
      }
      
      // Wait for Recharts to fully render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: chartProperties.shadeArea || '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });
  
      // Restore parent styles
      if (parentContainer && parentOriginalStyles) {
        parentContainer.style.overflow = parentOriginalStyles.overflow;
        parentContainer.style.height = parentOriginalStyles.height;
      }
  
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const pdfWidth = imgWidth * 0.264583;
      const pdfHeight = imgHeight * 0.264583;
      
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      pdf.save(`chart-${selectedChart?.name?.replace(/[^a-z0-9]/gi, '_') || 'export'}-${new Date().getTime()}.pdf`);
  
      console.log('✅ PDF Export successful');
  
    } catch (error) {
      console.error('❌ PDF Export failed:', error);
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
              <button onClick={handlePlusClick} title="Add Neuro Object"  className='text-red-600 hover:text-red-800 cursor-pointer'>
                    <Plus className="w-4 h-4 hover:text-blue-600" />
                </button>
              <button
                onClick={() => {
                  onResetBeta();      
                }}
                title="Reset"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <RefreshCw
                  className="w-4 h-4 hover:text-blue-800"
                />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="Export Graph"
                  className="text-red-600 hover:text-red-800 cursor-pointer pt-2"
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
                    <button
                      onClick={() => {
                        exportAsPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className=" h-1/2 flex flex-col border border-gray-200  ">
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
                          <div className="col-span-10 px-2 py-1 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="mr-2">{item.icon}</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                          </div>
                          <div className="col-span-2 px-3 py-1 whitespace-nowrap text-sm">
                            {index + 1}
                          </div>
                        </div>
                      ))} 
                    </div>
                  </div>
              </div>
            </div>

            <div className="h-1/2 flex flex-col border border-gray-200">
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
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {/* DYNAMIC TABLE SECTION */}
                {activeAdjustPropertieTab === "Table" && chartData && chartData.length > 0 && (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto mb-10">
                    <table className="table-auto w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(chartData[0]).map((col, i) => (
                            <th
                              key={i}
                              className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center capitalize"
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
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div ref={chartContainerRef} className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 ml-1 " style={{ backgroundColor: chartProperties.shadeArea }} >
          <div className="h-full overflow-auto m-5">
            <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">{selectedChart.icon} {selectedChart.name}</h2>

            <div className="h-[400px] flex items-center justify-center">
              {loading && (
                <p className="text-center text-gray-600">Loading...</p>
              )}

              {error && (
                <p className="text-center text-red-600">{error}</p>
              )}

              {!loading && !error && (!chartData || chartData.length === 0) && (
                <p className="text-center text-gray-500 whitespace-nowrap">
                  No data available for the selected chart.
                </p>
              )}

              {!loading && !error && chartData && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
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

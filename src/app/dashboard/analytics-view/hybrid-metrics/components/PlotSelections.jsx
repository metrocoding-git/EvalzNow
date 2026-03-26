'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X, RefreshCw, FolderOutput } from 'lucide-react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  Label,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import PropertyEditor from '../../components/PropertyEditor';
import { getUnitAndMultipleCandidateSummary } from '@/services/tabulationTableService';
// import Plot from "react-plotly.js";
import IcCurve from './IcCurveData';
import { ReceptiveBias } from './ReceptiveBias';
import { BalancedPlane } from './BalancedPlane';
import { ProductivePlane } from './ProductivePlane';
import { Interaction1 } from './Interaction1';
import { Interaction2 } from './Interaction2';
import { Interaction3 } from './Interaction3';
import { Interaction4 } from './Interaction4';
import { Interaction5 } from './Interaction5';
import { getUnitById } from '@/services/unitService';
import { getProjection } from '@/services/projectionService';

import dynamic from "next/dynamic";

import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });


const getICValue = (unitType, signatureProfile, icString) => {
  if (!icString) return 0;

  // ---------- CASE 1 / CASE 2 ----------
  if (
    unitType === "Communicative I/O" ||
    unitType === "Theory & Practice"
  ) {
    if (
      signatureProfile === "Case 1: Solid Balanced" ||
      signatureProfile === "Case 2: Rigorous Balanced"
    ) {
      const map = {
        "0R0P": 0, "1R1P": 1, "2R2P": 2,
        "3R3P": 3, "4R4P": 4, "5R5P": 5
      };
      return map[icString] ?? 0;
    }

    // ---------- CASE 3a: PRODUCTIVE ----------
    if (signatureProfile === "Case 3a: Productive-Weighted") {
      const map = {
        "0R0P": 0,   "0R1P": 0.5, "0R2P": 1,
        "1R2P": 1.5, "2R2P": 2,   "2R3P": 2.5,
        "3R3P": 3,   "3R4P": 3.5, "4R4P": 4,
        "5R5P": 5
      };
      return map[icString] ?? 0;
    }

    // ---------- CASE 3b: RECEPTIVE ----------
    if (signatureProfile === "Case 3b: Receptive-Weighed") {
      const map = {
        "0R0P": 0, "1R0P": 0.5, "2R0P": 1,
        "2R1P": 1.5, "2R2P": 2, "3R2P": 2.5,
        "3R3P": 3, "4R3P": 3.5, "4R4P": 4,
        "5R5P": 5
      };
      return map[icString] ?? 0;
    }
  }

  // ---------- TPRM ----------
  if (unitType === "Third Parameter") {
    const map = {
      "0R0P": 0, "1R1P": 1, "2R2P": 2,
      "3R3P": 3, "4R4P": 4, "5R5P": 5
    };
    return map[icString] ?? 0;
  }

  return 0;
};

const biasLinesData = {
  "Receptive Bias": {
    x: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.42],
    y: [0, 0.024142136, 0.048284271, 0.072426407, 0.096568542, 0.120710678, 0.144852814, 0.168994949, 0.193137085, 0.217279221, 0.241421356, 0.265563492, 0.289705627, 0.313847763, 0.337989899, 0.362132034, 0.38627417, 0.410416306, 0.434558441, 0.458700577, 0.482842712, 0.506984848, 0.531126984, 0.555269119, 0.579411255, 0.603553391, 0.627695526, 0.651837662, 0.675979797, 0.700121933, 0.724264069, 0.748406204, 0.77254834, 0.796690476, 0.820832611, 0.844974747, 0.869116882, 0.893259018, 0.917401154, 0.941543289, 0.965685425, 0.989827561, 1]
  },
  "Balanced Line": {
    x: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1],
    y: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1]
  },
  "Productive Bias": {
    x: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1],
    y: [0, 0.004142136, 0.008284271, 0.012426407, 0.016568542, 0.020710678, 0.024852814, 0.028994949, 0.033137085, 0.037279221, 0.041421356, 0.045563492, 0.049705627, 0.053847763, 0.057989899, 0.062132034, 0.06627417, 0.070416306, 0.074558441, 0.078700577, 0.082842712, 0.086984848, 0.091126984, 0.095269119, 0.099411255, 0.103553391, 0.107695526, 0.111837662, 0.115979797, 0.120121933, 0.124264069, 0.128406204, 0.13254834, 0.136690476, 0.140832611, 0.144974747, 0.149116882, 0.153259018, 0.157401154, 0.161543289, 0.165685425, 0.169827561, 0.173969696, 0.178111832, 0.182253967, 0.186396103, 0.190538239, 0.194680374, 0.19882251, 0.202964646, 0.207106781, 0.211248917, 0.215391052, 0.219533188, 0.223675324, 0.227817459, 0.231959595, 0.236101731, 0.240243866, 0.244386002, 0.248528137, 0.252670273, 0.256812409, 0.260954544, 0.26509668, 0.269238816, 0.273380951, 0.277523087, 0.281665222, 0.285807358, 0.289949494, 0.294091629, 0.298233765, 0.302375901, 0.306518036, 0.310660172, 0.314802307, 0.318944443, 0.323086579, 0.327228714, 0.33137085, 0.335512986, 0.339655121, 0.343797257, 0.347939392, 0.352081528, 0.356223664, 0.360365799, 0.364507935, 0.368650071, 0.372792206, 0.376934342, 0.381076477, 0.385218613, 0.389360749, 0.393502884, 0.39764502, 0.401787156, 0.405929291, 0.410071427, 0.414213562]
  }
};


export default function PlotSelections({ selectedSort, unitId, candidateId, unitType, unitSignature, onInteractionClassSelect, filters, onResetFilters }) {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);
  const [isSelectedInteractionClass, setIsSelectedInteractionClass] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [averageData, setAverageData] = useState([]);
  const [growthTargetData, setGrowthTargetData] = useState([]);
  const [projectionData, setProjectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(null);

  const chartContainerRef = useRef(null);

  // console.log("filtres: ", filters);
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
    // showLabelPrefix: false,
    // labelPrefix: "X File name",
    // showLabelSuffix: false,
    // labelSuffix: "Y subcase",

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
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');

  const ICCurveData = IcCurve();
  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: 'A', uv: 400, pv: 240 },
    { name: 'B', uv: 300, pv: 139 },
    { name: 'C', uv: 200, pv: 980 },
  ];

  const isCommunicativeOrTheory =
  unitType === "Communicative I/O" || unitType === "Theory & Practice";

  console.log("unit signature in plot selection: ", isCommunicativeOrTheory);
  console.log("unit type in plot selection: ", unitType);


  const [selectedChart, setSelectedChart] = useState(null);

  const activateCandidateLevel = [
    {
      name: "Interaction Class (IC) vs. PP ID",
      icon: "🔵",
      type: "line",
      id: "1"
    },
    {
      name: "Productive Ratio (PR) vs. Receptive Ratio (RR) 2-D Cross Plot",
      icon: "🔵",
      type: "scatter-2d",
      id: "2"
    },

    ...(unitType === "Third Parameter"
      ? [
          {
            name: "Acuity Ratio (AR) vs. Receptive Ratio (RR) 2-D Cross Plot",
            icon: "🔵",
            type: "scatter-2d",
            id: "3"
          },
          {
            name: "Acuity Ratio (AR) vs. Productive Ratio (PR) Cross Plot",
            icon: "🔵",
            type: "scatter-2d",
            id: "4"
          },
          {
            name: "Acuity Ratio (AR) vs. Productive Ratio (PR) vs. Receptive Ratio (RR) 3-D Cross Plot",
            icon: "🔵",
            type: "scatter-3d",
            id: "5"
          }
          
        ]
      : [])
  ];

  const activateUnitLevel = [
    {
      name: "Interaction Class (IC) vs. PP ID",
      icon: "🔵",
      type: "scatter-2d",
      id: "1"
    },
    {
      name: "Productive Ratio (PR) vs. Receptive Ratio (RR) 2-D Cross Plot",
      icon: "🔵",
      type: "scatter-2d",
      id: "2"
    },
  
    ...(unitType === "Third Parameter"
      ? [
          {
            name: "Acuity Ratio (AR) vs. Receptive Ratio (RR) 2-D Cross Plot",
            icon: "🔵",
            type: "scatter-2d",
            id: "3"
          },
          {
            name: "Acuity Ratio (AR) vs. Productive Ratio (PR) Cross Plot",
            icon: "🔵",
            type: "scatter-2d",
            id: "4"
          },
          {
            name: "Acuity Ratio (AR) vs. Productive Ratio (PR) vs. Receptive Ratio (RR) 3-D Cross Plot",
            icon: "🔵",
            type: "scatter-3d",
            id: "5"
          }
        ]
      : [])
  ];
  


  const getTableColumns = () => {
    if (!selectedChart) return null;
  
    switch (selectedChart.id) {
      case "1":
        return {
          columns: [
            { key: "ppId", label: "PP ID" },
            { key: "IC", label: "Interaction Class (IC)" }
          ]
        };
  
      case "2":
        return {
          columns: [
            { key: "ppId", label: "PP ID" },
            { key: "RRN", label: "RR" },
            { key: "PRN", label: "PR" }
          ]
        };
  
      case "3":
        return {
          columns: [
            { key: "ppId", label: "PP ID" },
            { key: "RRN", label: "RR" },
            { key: "ARN", label: "AR" }
          ]
        };
  
      case "4":
        return {
          columns: [
            { key: "ppId", label: "PP ID" },
            { key: "PRN", label: "PR" },
            { key: "ARN", label: "AR" }
          ]
        };
  
      case "5": // 3D
        return {
          columns: [
            { key: "ppId", label: "PP ID" },
            { key: "RRN", label: "RR" },
            { key: "PRN", label: "PR" },
            { key: "ARN", label: "AR" }
          ]
        };
  
      default:
        return null;
    }
  };
  

  const applyChartStyling = {
    lineStrokeDasharray: (style) => {
      switch (style) {
        case "dashed": return "5 5";
        case "dotted": return "2 2";
        default: return ""; // solid
      }
    },
  
    symbolShape: (style, props, color, size) => {
      switch (style) {
        case "square":
          return (
            <rect
              x={props.cx - size}
              y={props.cy - size}
              width={size * 2}
              height={size * 2}
              fill={color}
              stroke="#000"
            />
          );
        case "triangle":
          return (
            <polygon
              points={`
                ${props.cx},${props.cy - size}
                ${props.cx - size},${props.cy + size}
                ${props.cx + size},${props.cy + size}
              `}
              fill={color}
            />
          );
        default: // circle
          return (
            <circle
              cx={props.cx}
              cy={props.cy}
              r={size}
              fill={color}
            />
          );
      }
    }
  };
  
  useEffect(() => {
    console.log( "filters in plot selection: ", filters);
  }, [filters]);

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

  const renderReferenceLinesForLineChart = () => {
    if (!thresholdValue || !filters?.thresholdEnabled) return null;

    return Object.entries(thresholdValue).map(([key, value]) => {
      if (value === null || value === undefined) return null;
      
      return (
        <ReferenceLine
          key={key}
          y={value}
          stroke="#000000" //
          strokeWidth={2}
          strokeDasharray="7 4 1 4"
          label={{
            value: `Threshold (${key}: ${value})`,
            position: "right",
            fill: "#000000",
            fontSize: 12,
          }}
        />
      );
    });
  };

  // Function to render reference lines for Scatter charts
  const renderReferenceLinesForScatter = (xKey, yKey) => {
    if (!thresholdValue || !filters?.thresholdEnabled) return null;

    return Object.entries(thresholdValue).map(([key, value]) => {
      if (value === null || value === undefined) return null;
      
      // Determine if this threshold applies to X or Y axis
      const axisKey = key.toUpperCase();
      const isXAxis = ['RRN', 'PRN', 'ARN'].includes(axisKey) && xKey.toUpperCase().includes(axisKey);
      const isYAxis = ['RRN', 'PRN', 'ARN'].includes(axisKey) && yKey.toUpperCase().includes(axisKey);
      const isIC = key === 'IC' && (xKey === 'IC' || yKey === 'IC');

      if (isXAxis) {
        return (
          <ReferenceLine
            key={key}
            x={value}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="7 4 1 4"
            label={{
              value: `Threshold (${key}: ${value})`,
              position: "top",
              fill: "#f59e0b",
              fontSize: 12,
            }}
          />
        );
      } else if (isYAxis || isIC) {
        return (
          <ReferenceLine
            key={key}
            y={value}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="7 4 1 4"
            label={{
              value: `Threshold (${key}: ${value})`,
              position: "right",
              fill: "#f59e0b",
              fontSize: 12,
            }}
          />
        );
      }
      
      return null;
    });
  };

  const handleChartSelect = (chart) => {
    setSelectedChart(chart);

    if (chart.name === "Interaction Class (IC) vs. PP ID") {
      setIsSelectedInteractionClass(true);
      onInteractionClassSelect?.(true); // ✅ notify parent
    } else {
      setIsSelectedInteractionClass(false);
      onInteractionClassSelect?.(false);
    }
  };

  // console.log("signatire proudile -", unitSignature);

  // console.log('unit type - ', unitType);

  useEffect(() => {
    const fetchTabulationData = async () => {
      if (!unitId || !candidateId) {
        setTableData([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Log what filters we're receiving
        console.log("🔍 Received filters:", {
          ppIdFrom: filters?.ppIdFrom,
          ppIdTo: filters?.ppIdTo,
          selectedPpId: filters?.selectedPpId,
          rawFilters: filters
        });
  
        // Build API filters
        const apiFilters = {
          unitId: unitId,
          candidate_id: candidateId,
        };
  
        // Handle PP ID range - special case when both are the same
        if (filters?.ppIdFrom !== undefined && filters?.ppIdTo !== undefined) {
          // When both are the same (either positive or negative), we want just that one PP ID
          if (filters.ppIdFrom === filters.ppIdTo) {
            apiFilters.ppId = filters.ppIdFrom; // Use single PP ID filter
            console.log(`🔄 Using single PP ID filter: ${filters.ppIdFrom}`);
          } else {
            // Use range filter
            apiFilters.ppIdFrom = filters.ppIdFrom;
            apiFilters.ppIdTo = filters.ppIdTo;
            console.log(`🔄 Using PP ID range: ${filters.ppIdFrom} to ${filters.ppIdTo}`);
          }
        }
  
        // Handle selectedPpId if present (single selection)
        if (filters?.selectedPpId !== undefined && filters?.selectedPpId !== null) {
          apiFilters.ppId = filters.selectedPpId;
          console.log(`🔄 Using selected PP ID: ${filters.selectedPpId}`);
        }
  
        // Add other filters
        if (filters?.criticalDateFrom) apiFilters.criticalRefDateFrom = filters.criticalDateFrom;
        if (filters?.criticalDateTo) apiFilters.criticalRefDateTo = filters.criticalDateTo;
  
        console.log("🔍 Final API filters being sent:", apiFilters);
  
        const data = await getUnitAndMultipleCandidateSummary(apiFilters);
  
        console.log("🔵 API Response:", data);
  
        const { results, averages, stdDev, stdErr } = data;  
  
        // Format the data
        const formattedData = results.map(row => ({
          ppId: row.ppId,
          IC: getICValue(unitType, unitSignature, row.IC),
          RRN: Number(row.RRN).toFixed(3) || 0.000,
          PRN: Number(row.PRN).toFixed(3) || 0.000,
          ARN: Number(row.ARN).toFixed(3) || 0.000,
        }));
  
        console.log("🔵 Formatted Data:", formattedData);
        console.log(`🔵 Data Count: ${formattedData.length} rows`);
  
        // Debug: Show what PP IDs we got
        const ppIds = formattedData.map(item => item.ppId);
        console.log("🔵 PP IDs in response:", ppIds);
  
        setTableData(formattedData);
  
        // Handle averages data
        const averageData = averages?.map(item => ({
          ppId: item.ppId,
          RRN: Number(item.RRN).toFixed(3) || 0.000,
          PRN: Number(item.PRN).toFixed(3) || 0.000,
          ARN: Number(item.ARN).toFixed(3) || 0.000,
        })) || [];
  
        setAverageData(averageData);
        console.log("averages data: ", averageData);
  
        // Handle growth target data
        const growthTargetData = results
          .filter(item => item.ppId > 0)
          .map(item => ({
            ppId: item.ppId,
            RRGT1: item.RRGT1 || 0,
            PRGT1: item.PRGT1 || 0,
            ARGT1: item.ARGT1 || 0,
            RRGT2: item.RRGT2 || 0,
            PRGT2: item.PRGT2 || 0,
            ARGT2: item.ARGT2 || 0,
            RRGT3: item.RRGT3 || 0,
            PRGT3: item.PRGT3 || 0,
            ARGT3: item.ARGT3 || 0,
            RRGT4: item.RRGT4 || 0,
            PRGT4: item.PRGT4 || 0,
            ARGT4: item.ARGT4 || 0,
            RRGT5: item.RRGT5 || 0,
            PRGT5: item.PRGT5 || 0,
            ARGT5: item.ARGT5 || 0,
          }));
        
        setGrowthTargetData(growthTargetData);
        
      } catch (err) {
        console.error("❌ Failed to fetch tabulation data:", err);
        setError("Failed to load table data.");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTabulationData();
  }, [unitId, candidateId, filters]);

  console.log("average datas: ", averageData);

  

  useEffect(() => {
    const fetchThreshold = async () => {
      if (!unitId) {
        setThresholdValue(null);
        return;
      }
  
      try {
        const data = await getUnitById(unitId);
  
        // Safely extract only threshold ratio fields
        const extractedThresholds = {
          IC: parseFloat(data?.IC) ?? null,
        };
  
        setThresholdValue(extractedThresholds);
  
        console.log("✅ Extracted Threshold Values:", extractedThresholds);
      } catch (error) {
        console.error("❌ Failed to fetch threshold values:", error);
        setThresholdValue(null);
      }
    };
  
    fetchThreshold();
  }, [unitId]);

  useEffect(() => {
    const fetchProjection = async () => {
      if (!unitId || !candidateId) {
        setProjectionData([]);
        return;
      }
  
      try {
        const data = await getProjection(unitId, candidateId);
        
        console.log("projection data:", data);
        
        // Check if data is an array of sessions
        if (data && Array.isArray(data)) {
          // Collect all projection points from all sessions
          const allProjectionPoints = [];
          
          data.forEach(session => {
            if (session.points && Array.isArray(session.points)) {
              // Filter for 15 days or 30 days with Average callout (trim values to handle spaces)
              const sessionProjectionPoints = session.points.filter(item => {
                const trimmedPpId = item.ppId ? item.ppId.trim() : '';
                const trimmedCallout = item.callout ? item.callout.trim() : '';
                
                return (
                  (trimmedPpId === '15 days' || trimmedPpId === '30 days') && 
                  trimmedCallout === 'Average'
                );
              });
              
              allProjectionPoints.push(...sessionProjectionPoints);
            }
          });
          
          // Extract RRN, PRN, ARN values
          const formattedProjection = allProjectionPoints.map(item => ({
            RRN: parseFloat(item.RRN) || 0,
            PRN: parseFloat(item.PRN) || 0,
            ARN: parseFloat(item.ARN) || 0,
            ppId: item.ppId ? item.ppId.trim() : '', // Trim ppId in output too
            callout: item.callout ? item.callout.trim() : '', // Trim callout in output too
            dayCount: item.dayCount,
            sessionId: item.sessionId
          }));
          
          setProjectionData(formattedProjection);
          
          console.log("Filtered projection data (15 & 30 days, Average):", formattedProjection);
        } else {
          console.log("Invalid data structure - expected array of sessions");
          setProjectionData([]);
        }
        
      } catch (error) {
        console.error("❌ Failed to fetch projection data:", error);
        setProjectionData([]);
      }
    };
  
    fetchProjection();
  }, [unitId, candidateId]);

  const renderBiasLines = (unitType, chartType, xKey, yKey) => {
    // Only show bias lines for specific unit types
    // if (unitType !== "Communicative I/O" && unitType !== "Theory & Practice") {
    //   return null;
    // }
  
    const biasLines = Object.keys(biasLinesData);
    const lineStyles = {
      "Receptive Bias": { strokeDasharray: "1 0" }, // dashed line
      "Balanced Line": { strokeDasharray: "1 0" },  // dotted line  
      "Productive Bias": { strokeDasharray: "1 0" } // dashed line
    };
  
    return biasLines.map((biasLine) => {
      const lineData = biasLinesData[biasLine];
      
      // For scatter charts, transform data to match the expected structure
      if (chartType === "scatter") {
        const scatterPoints = lineData.x.map((x, i) => ({
          [xKey]: x,
          [yKey]: lineData.y[i],
          bias: biasLine
        }));
        
        return (
          <Line 
            key={biasLine}
            data={scatterPoints}
            dataKey={yKey}
            name={biasLine}
            stroke="#000000" // Black color
            strokeWidth={1.5}
            dot={false}
            tooltipType="none"
            isAnimationActive={false}
            activeDot={false}
            legendType="none"   
            hide={false} 
            {...lineStyles[biasLine]}
          />
        );
      }
      
      // For line charts
      return (
        <Line 
          key={biasLine}
          data={lineData.x.map((x, i) => ({ ppId: x, value: lineData.y[i] }))}
          dataKey="value"
          name={biasLine}
          stroke="#000000" // Black color
          strokeWidth={1.5}
          dot={false}
          tooltipType="none"
          isAnimationActive={false}
          legendType="none"   
          hide={false} 
          {...lineStyles[biasLine]}
        />
      );
    });
  };

  const getGrowthTargetPoints = (chartId, growthTargetData) => {
    if (!growthTargetData || growthTargetData.length === 0) return [];
  
    const points = [];
  
    growthTargetData.forEach(item => {
      switch (chartId) {
        case "2": // RR vs PR (X: RRN, Y: PRN)
          // Only add points where both values are non-zero
          if (item.RRGT1 > 0 || item.PRGT1 > 0) {
            points.push({ RRN: item.RRGT1, PRN: item.PRGT1, ppId: item.ppId, gt: "GT1" });
          }
          if (item.RRGT2 > 0 || item.PRGT2 > 0) {
            points.push({ RRN: item.RRGT2, PRN: item.PRGT2, ppId: item.ppId, gt: "GT2" });
          }
          if (item.RRGT3 > 0 || item.PRGT3 > 0) {
            points.push({ RRN: item.RRGT3, PRN: item.PRGT3, ppId: item.ppId, gt: "GT3" });
          }
          if (item.RRGT4 > 0 || item.PRGT4 > 0) {
            points.push({ RRN: item.RRGT4, PRN: item.PRGT4, ppId: item.ppId, gt: "GT4" });
          }
          if (item.RRGT5 > 0 || item.PRGT5 > 0) {
            points.push({ RRN: item.RRGT5, PRN: item.PRGT5, ppId: item.ppId, gt: "GT5" });
          }
          break;
  
        case "3": // AR vs RR (X: RRN, Y: ARN)
          if (item.RRGT1 > 0 || item.ARGT1 > 0) {
            points.push({ RRN: item.RRGT1, ARN: item.ARGT1, ppId: item.ppId, gt: "GT1" });
          }
          if (item.RRGT2 > 0 && item.ARGT2 > 0) {
            points.push({ RRN: item.RRGT2, ARN: item.ARGT2, ppId: item.ppId, gt: "GT2" });
          }
          if (item.RRGT3 > 0 || item.ARGT3 > 0) {
            points.push({ RRN: item.RRGT3, ARN: item.ARGT3, ppId: item.ppId, gt: "GT3" });
          }
          if (item.RRGT4 > 0 || item.ARGT4 > 0) {
            points.push({ RRN: item.RRGT4, ARN: item.ARGT4, ppId: item.ppId, gt: "GT4" });
          }
          if (item.RRGT5 > 0 || item.ARGT5 > 0) {
            points.push({ RRN: item.RRGT5, ARN: item.ARGT5, ppId: item.ppId, gt: "GT5" });
          }
          break;
  
        case "4": // PR vs AR (X: PRN, Y: ARN)
          if (item.PRGT1 > 0 || item.ARGT1 > 0) {
            points.push({ PRN: item.PRGT1, ARN: item.ARGT1, ppId: item.ppId, gt: "GT1" });
          }
          if (item.PRGT2 > 0 || item.ARGT2 > 0) {
            points.push({ PRN: item.PRGT2, ARN: item.ARGT2, ppId: item.ppId, gt: "GT2" });
          }
          if (item.PRGT3 > 0 || item.ARGT3 > 0) {
            points.push({ PRN: item.PRGT3, ARN: item.ARGT3, ppId: item.ppId, gt: "GT3" });
          }
          if (item.PRGT4 > 0 || item.ARGT4 > 0) {
            points.push({ PRN: item.PRGT4, ARN: item.ARGT4, ppId: item.ppId, gt: "GT4" });
          }
          if (item.PRGT5 > 0 || item.ARGT5 > 0) {
            points.push({ PRN: item.PRGT5, ARN: item.ARGT5, ppId: item.ppId, gt: "GT5" });
          }
          break;
  
        default:
          break;
      }
    });
  
    console.log("✅ Filtered Growth Target Points:", points);
    return points;
  };

  const getICCurveData = (signatureProfile, icLevel) => {
    if (!signatureProfile || !icLevel) return null;
    
    const caseKey = signatureProfile.includes("Solid Balanced") ? "Case1: Solid Balanced" :
                  signatureProfile.includes("Rigorous Balanced") ? "Case2: Rigorous Balanced" :
                  signatureProfile.includes("Productive-Weighted") ? "Case3a: Productive-Weighted" :
                  signatureProfile.includes("Receptive-Weighed") ? "Case3b: Receptive-Weighed" : null;
    
    if (!caseKey || !ICCurveData[caseKey] || !ICCurveData[caseKey][icLevel]) {
      return null;
    }
    
    return ICCurveData[caseKey][icLevel];
  };

  // Function to render IC curves on any chart
  const renderICCurves = (signatureProfile, unitType, chartType, xKey, yKey) => {
    // Include "Third Parameter" in allowed unit types
    if (
      unitType !== "Communicative I/O" &&
      unitType !== "Theory & Practice" &&
      unitType !== "Third Parameter"
    ) {
      return null;
    }
  
    const icLevels = ["IC1", "IC2", "IC3", "IC4", "IC5"];
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
    
    return icLevels.map((icLevel, index) => {
      const curveData = getICCurveData(signatureProfile, icLevel);
      if (!curveData) return null;
  
      if (chartType === "scatter") {
        const scatterPoints = curveData.x.map((x, i) => ({
          [xKey]: x,
          [yKey]: curveData.y[i],
          IC: icLevel
        }));
        
        return (
          <Line 
            key={icLevel}
            data={scatterPoints}
            dataKey={yKey}
            name={icLevel}
            stroke={colors[index]}
            strokeWidth={2}
            dot={false}
            tooltipType="none"
            isAnimationActive={false}
            legendType="none"
            hide={false}
            activeDot={false}
          />
        );
      }
  
      // Line chart fallback
      return (
        <Line 
          key={icLevel}
          data={curveData.x.map((x, i) => ({ ppId: x, value: curveData.y[i] }))}
          dataKey="value"
          name={icLevel}
          stroke={colors[index]}
          strokeWidth={2}
          dot={false}
          tooltipType="none"
          isAnimationActive={false}
          legendType="none"
        />
      );
    });
  };
  

  const generateTicks = (min, max, step = 0.1) => {
    const ticks = [];
    for (let v = min; v <= max + 0.0001; v += step) {
      ticks.push(Number(v.toFixed(1)));
    }
    return ticks;
  };
  

  const renderScatter = (tableData, xKey, yKey, xLabel, yLabel, signatureProfile, unitType) => {
  const containerStyle = {
    backgroundColor: chartProperties.shadeArea,
    width: '100%',
    aspectRatio: '1 / 1',
    padding: '10px',
    borderRadius: '8px'
  };

  const isTargetMode = filters?.unitMode === "target";
  const targetPpId = filters?.selectedPpId;
  const isPositiveTarget = targetPpId > 0;

  // Check if we should show averages
  const showAverages = filters?.unitMode === "averages" && averageData.length > 0;
  // Check if we should show projection data
  const showProjection = filters?.showProjectionPoints === true && projectionData.length > 0;
  // Check if we should show growth target data
  const showGrowthTarget = filters?.showGrowthTarget === true && growthTargetData.length > 0;
  
  // Get growth target points for the current chart
  const growthTargetPoints = showGrowthTarget ? getGrowthTargetPoints(selectedChart?.id, growthTargetData) : [];
  
  console.log("🔵 Growth Target Points for chart", selectedChart?.id, ":", growthTargetPoints);
  
  // Separate positive and negative PP IDs for scatter plots
  const positiveData = tableData.filter(item => item.ppId > 0);
  const negativeData = tableData.filter(item => item.ppId < 0);
  
  console.log("🔍 Positive PP IDs data:", positiveData.length, "points");
  console.log("🔍 Negative PP IDs data:", negativeData.length, "points");

  const FIXED_MIN = 0.1;
  const FIXED_MAX = 1.0;
  const STEP = 0.1;

  const allXValues = [
    ...tableData.map(d => d[xKey]),
    ...growthTargetPoints.map(d => d[xKey]),
  ];

  const allYValues = [
    ...tableData.map(d => d[yKey]),
    ...growthTargetPoints.map(d => d[yKey]),
  ];

  // Always go up to at least 1.0
  const xMax = Math.max(
    FIXED_MAX,
    Math.ceil(Math.max(...allXValues) * 10) / 10
  );

  const yMax = Math.max(
    FIXED_MAX,
    Math.ceil(Math.max(...allYValues) * 10) / 10
  );

  const xTicks = generateTicks(FIXED_MIN, xMax, STEP);
  const yTicks = generateTicks(FIXED_MIN, yMax, STEP);


  return (
    <div style={containerStyle} className='flex justify-center'>
      <ResponsiveContainer width="70%" height="70%">
        <ScatterChart 
          data={tableData}
          margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
        >
          <CartesianGrid />
          <XAxis 
            dataKey={xKey} 
            type="number"
            name={xLabel}
            domain={[FIXED_MIN, xMax]}
            ticks={xTicks}
            allowDecimals
          >
            <Label value={xLabel} position="bottom" offset={-2} textAnchor='middle' style={{ fontSize: "14px", fontWeight: "500" }} />
          </XAxis>
          <YAxis 
            dataKey={yKey} 
            type="number"
            name={yLabel}
            domain={[FIXED_MIN, yMax]}
            ticks={yTicks}
            allowDecimals
          >
            <Label value={yLabel} angle={-90} position="left" offset={-7} textAnchor='middle' style={{ fontSize: "14px", fontWeight: "500" }} />
          </YAxis>
          
          {/*  Tooltip - only show for Scatter components */}
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            // Add this to improve default behavior
            allowEscapeViewBox={{ x: true, y: true }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;

              // ───────────────────────────────────────────────
              // Filter to only show tooltip for ACTUAL scatter points
              // We look for payload items that come from a Scatter series
              // (they usually have .payload.ppId or similar real data marker)
              // ───────────────────────────────────────────────
              const realPoint = payload.find(item =>
                item.payload &&
                item.payload.seriesType &&     
                item.payload[xKey] !== undefined &&
                item.payload[yKey] !== undefined
              );
              

              if (!realPoint) return null;   // ← hide tooltip if hovering over line/bias/IC

              const data = realPoint.payload;

              const isGrowthTarget = data.gt !== undefined;
              const isProjection  = data.callout !== undefined;
              const isAverage     = averageData.some(avg => avg.ppId === data.ppId);

              return (
                <div style={{
                  backgroundColor: 'white',
                  padding: '10px 14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  minWidth: '180px'
                }}>
                  {isGrowthTarget && (
                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#2563eb' }}>
                      Growth Target: {data.gt}
                    </p>
                  )}
                  {isProjection && (
                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#7c3aed' }}>
                      Projection: {data.ppId} ({data.callout})
                    </p>
                  )}
                  {isAverage && (
                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#ff6b6b' }}>
                      Average Point
                    </p>
                  )}
                  {!isGrowthTarget && !isProjection && !isAverage && (
                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>
                      PP ID: {data.ppId}
                    </p>
                  )}

                  <p style={{ margin: '4px 0' }}>
                    {xLabel}: <strong>{Number(data[xKey]).toFixed(2)}</strong>
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    {yLabel}: <strong>{Number(data[yKey]).toFixed(2)}</strong>
                  </p>
                </div>
              );
            }}
          />
          
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
          
          {/* Reference Lines */}
          {renderReferenceLinesForScatter(xKey, yKey)}
          
          {/* IC Curves - These will now be ignored by tooltip */}
          {renderICCurves(signatureProfile, unitType, "scatter", xKey, yKey)}

          {/* Bias Lines - These will now be ignored by tooltip */}
          {renderBiasLines(unitType, "scatter", xKey, yKey)}
          
          {/* Positive PP IDs (Red) */}
          {positiveData.length > 0 && (
            <Scatter 
              data={positiveData.map(d => ({...d, seriesType: 'positive'}))} 
              dataKey={yKey} 
              name="Positive PP IDs"
              isAnimationActive={false}
              fill={chartProperties.positiveLineColor}
              shape={(props) =>
                applyChartStyling.symbolShape(
                  chartProperties.symbolStyle,
                  props,
                  chartProperties.positiveSymbolColor,
                  chartProperties.symbolScaleSize
                )
              }
            />
          )}

          {negativeData.length > 0 && (
            <Scatter 
              data={negativeData.map(d => ({...d, seriesType: 'negative'}))} 
              dataKey={yKey} 
              name="Negative PP IDs"
              isAnimationActive={false}
              fill={chartProperties.negativeLineColor}
              shape={(props) =>
                applyChartStyling.symbolShape(
                  chartProperties.symbolStyle,
                  props,
                  chartProperties.negativeSymbolColor,
                  chartProperties.symbolScaleSize
                )
              }
            />
          )}

          {showAverages && (
            <Scatter 
              data={averageData.map(d => ({...d, seriesType: 'average'}))} 
              dataKey={yKey} 
              fill="#ff6b6b" 
              isAnimationActive={false}
              name="Average Points"
              shape={(props) => (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={6} 
                  fill="#ff6b6b" 
                  stroke="#000000"
                  strokeWidth={1}
                />
              )}
            />
          )}
          
          {/* Projection data points (Performance Points G) */}
          {showProjection && (
            <Scatter 
              data={projectionData.map(d => ({
                ...d,
                seriesType: "projection"
              }))} 
              dataKey={yKey} 
              fill="#7c3aed" 
              name="Performance Points (G)"
              isAnimationActive={false}
              legendType="none"
              shape={(props) => (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={3} 
                  fill="#7c3aed"  
                  stroke="#000000"
                  strokeWidth={1}
                />
              )}
            />
          )}
          
          {/* Growth Target data points */}
          {showGrowthTarget && growthTargetPoints.length > 0 && (
            <Scatter 
              data={growthTargetPoints.map(d => ({
                ...d,
                seriesType: "growthTarget"
              }))} 
              dataKey={yKey}
              fill="#2563eb"
              name="Growth Targets"
              isAnimationActive={false}
              legendType="none"
              shape={(props) => (
                <circle 
                  cx={props.cx}
                  cy={props.cy}
                  r={3}
                  fill="#2563eb"
                />
              )}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
  
  const render3DScatter = (tableData, unitType) => {
    // Check if we should show averages
    const showAverages = filters?.unitMode === "averages" && averageData.length > 0;
    // Check if we should show projection data
    const showProjection = filters?.showProjectionPoints === true && projectionData.length > 0;
    // Check if we should show growth target data
    const showGrowthTarget = filters?.showGrowthTarget === true && growthTargetData.length > 0;

    const positiveData = tableData.filter(r => r.ppId > 0);
    const negativeData = tableData.filter(r => r.ppId < 0);

    const plotData = [];

    // 🟢 Positive PP IDs
    if (positiveData.length > 0) {
      plotData.push({
        x: positiveData.map(r => r.RRN),
        y: positiveData.map(r => r.PRN),
        z: positiveData.map(r => r.ARN),
        type: "scatter3d",
        mode: "markers",
        marker: {
          size: 4,
          color: "#22c55e" // green
        },
        name: "Positive PP IDs"
      });
    }

    // 🔴 Negative PP IDs
    if (negativeData.length > 0) {
      plotData.push({
        x: negativeData.map(r => r.RRN),
        y: negativeData.map(r => r.PRN),
        z: negativeData.map(r => r.ARN),
        type: "scatter3d",
        mode: "markers",
        marker: {
          size: 4,
          color: "#ef4444" // red
        },
        name: "Negative PP IDs"
      });
    }

  
    if (showGrowthTarget && growthTargetData.length > 0) {
      const gtPoints3D = [];
      
      growthTargetData.forEach(item => {
        // Add GT1 points
        if (item.RRGT1 !== undefined && item.PRGT1 !== undefined && item.ARGT1 !== undefined) {
          gtPoints3D.push({ x: item.RRGT1, y: item.PRGT1, z: item.ARGT1, ppId: item.ppId, gt: "GT1" });
        }
        // Add GT2 points
        if (item.RRGT2 !== undefined && item.PRGT2 !== undefined && item.ARGT2 !== undefined) {
          gtPoints3D.push({ x: item.RRGT2, y: item.PRGT2, z: item.ARGT2, ppId: item.ppId, gt: "GT2" });
        }
        // Add GT3 points
        if (item.RRGT3 !== undefined && item.PRGT3 !== undefined && item.ARGT3 !== undefined) {
          gtPoints3D.push({ x: item.RRGT3, y: item.PRGT3, z: item.ARGT3, ppId: item.ppId, gt: "GT3" });
        }
        // Add GT4 points
        if (item.RRGT4 !== undefined && item.PRGT4 !== undefined && item.ARGT4 !== undefined) {
          gtPoints3D.push({ x: item.RRGT4, y: item.PRGT4, z: item.ARGT4, ppId: item.ppId, gt: "GT4" });
        }
        // Add GT5 points
        if (item.RRGT5 !== undefined && item.PRGT5 !== undefined && item.ARGT5 !== undefined) {
          gtPoints3D.push({ x: item.RRGT5, y: item.PRGT5, z: item.ARGT5, ppId: item.ppId, gt: "GT5" });
        }
      });
  
      if (gtPoints3D.length > 0) {
        plotData.push({
          x: gtPoints3D.map(gt => gt.x),
          y: gtPoints3D.map(gt => gt.y),
          z: gtPoints3D.map(gt => gt.z),
          type: "scatter3d",
          mode: "markers",
          marker: { 
            size: 4,
            color: '#2563eb',
            symbol: 'circle'
          },
          name: "Growth Targets"
        });
      }
    }
    
    // Get plane data
    const receptiveData = ReceptiveBias();
    const balancedData = BalancedPlane();
    const productiveData = ProductivePlane();
    
    const interaction1 = Interaction1();
    const interaction2 = Interaction2();
    const interaction3 = Interaction3();
    const interaction4 = Interaction4();
    const interaction5 = Interaction5();
  
    
    // Add average points if enabled
    if (showAverages) {
      plotData.push({
        x: averageData.map(avg => avg.RRN),
        y: averageData.map(avg => avg.PRN),
        z: averageData.map(avg => avg.ARN),
        type: "scatter3d",
        mode: "markers",
        marker: { 
          size: 6,
          color: '#ff6b6b',
          symbol: 'diamond'
        },
        name: "Average Points"
      });
    }
  
    // Add projection points if enabled
    if (showProjection) {
      plotData.push({
        x: projectionData.map(proj => proj.RRN),
        y: projectionData.map(proj => proj.PRN),
        z: projectionData.map(proj => proj.ARN),
        type: "scatter3d",
        mode: "markers",
        marker: { 
          size: 4,
          color: '#8b5cf6',
          symbol: 'star'
        },
        name: "Performance Points (G)"
      });
    }
  
    // Add surfaces only for Third Parameter unit type
    if (unitType === "Third Parameter") {
      plotData.push(
        {
          x: receptiveData.Px1,
          y: receptiveData.Py1,
          z: receptiveData.Pz1,
          name: "Receptive Bias Plane",
          type: "scatter3d",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#ff8c1a" },
          opacity: 1,
          showlegend: false
        },
        {
          x: balancedData.Px2,
          y: balancedData.Py2,
          z: balancedData.Pz2,
          name: "Balanced Plane",
          type: "scatter3d",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#ff8000" },
          opacity: 1,
          showlegend: false
        },
        {
          x: productiveData.Px3,
          y: productiveData.Py3,
          z: productiveData.Pz3,
          type: "scatter3d",
          name: "Productive Bias Plane",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#e67300" },
          opacity: 1,
          showlegend: false
        },
        {
          x: interaction5.Px4,
          y: interaction5.Py4,
          z: interaction5.Pz4,
          type: "scatter3d",
          name: "Interaction Surface 5",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#030066" },
          opacity: 1,
          showlegend: false
        },
        {
          x: interaction4.Px5,
          y: interaction4.Py5,
          z: interaction4.Pz5,
          type: "scatter3d",
          name: "Interaction Surface 4",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#050099" },
          opacity: 1,
          showlegend: false
        },
        {
          x: interaction3.Px6,
          y: interaction3.Py6,
          z: interaction3.Pz6,
          type: "scatter3d",
          name: "Interaction Surface 3",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#0800e6" },
          opacity: 1,
          showlegend: false
        },
        {
          x: interaction2.Px7,
          y: interaction2.Py7,
          z: interaction2.Pz7,
          type: "scatter3d",
          name: "Interaction Surface 2",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#524dff" },
          opacity: 1,
          showlegend: false
        },
        {
          x: interaction1.Px8,
          y: interaction1.Py8,
          z: interaction1.Pz8,
          type: "scatter3d",
          name: "Interaction Surface 1",
          mode: "markers",
          marker: { size: 1 },
          line: { color: "#b5b3ff" },
          opacity: 1,
          showlegend: false
        }
      );
    }
  
    return (
      <Plot 
        data={plotData}
        layout={{
          autosize: true,
          height: undefined,
          title: "Butler Hybrid Model",
  
          //  All 3D properties must be inside scene
          scene: {
            domain: { x: [0, 0.95], y: [0.1, 1] }, 
            
            camera: {
              eye: { x: 1.7, y: 1.7, z: 1.7 }
            },
  
            aspectratio: { x: 1, y: 1, z: 1 },
  
            xaxis: {
              title: { text: "RECEPTIVE RATIO (RR)" },
              nticks: 10,
              range: [0, 1],
              dtick: 0.1,
            },
            yaxis: {
              title: { text: "PRODUCTIVE RATIO (PR)" },
              nticks: 10,
              range: [0, 1],
              dtick: 0.1,
            },
            zaxis: {
              title: { text: "ACUITY RATIO (AR)" },
              nticks: 10,
              range: [0, 1],
              dtick: 0.1,
            },
          },
  
          margin: { l: 0, r: 120, b: 60, t: 90 },
          showlegend: true,
          legend: {
          x: 1.02,
          y: 1,
          xanchor: "left",
          yanchor: "top",
          bgcolor: "rgba(255,255,255,0.9)",
          bordercolor: "#e5e7eb",
          borderwidth: 1,
          font: { size: 10 }
        }
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    );
  };
  
  const renderSelectedChart = () => {
    if (!selectedChart) return null;

    const containerStyle = {
      backgroundColor: chartProperties.shadeArea,
      width: '100%',
      height: '600px',
      padding: '10px',
      borderRadius: '8px'
    };
  
    switch (selectedChart.id) {
      case "1":  // Interaction Class vs PP ID (Line) - No averages or projections for this chart
        const positives = tableData.filter(r => r.ppId > 0);
        const negatives = tableData.filter(r => r.ppId < 0);
  
        return (
          <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ppId" type="number">
                  <Label value="PP ID" position="bottom" offset={2} textAnchor='middle' />
                </XAxis>
                <YAxis dataKey="IC">
                  <Label value="Interaction Class (IC)" angle={-90} position="insideLeft" offset={10} 
                  textAnchor='middle' />
                </YAxis>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" 
                  wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
    
                {/* Reference Lines */}
                {renderReferenceLinesForLineChart()}
                
                <Line data={positives} dataKey="IC"  type="linear" name="Positive PP IDs"
                  stroke={chartProperties.positiveLineColor}
                  strokeDasharray={
                    chartProperties.positiveLineStyle === "dashed"
                      ? "6 4"
                      : chartProperties.positiveLineStyle === "dotted"
                      ? "2 4"
                      : chartProperties.positiveLineStyle === "dashdot"
                      ? "8 4 2 4"
                      : "0"
                  }
                  strokeWidth={chartProperties.positiveLineThickness}
                  isAnimationActive={false}
                  hide={!chartProperties.positiveVisibility}
                  dot={(props) =>
                    applyChartStyling.symbolShape(
                      chartProperties.symbolStyle,
                      props,
                      chartProperties.positiveSymbolColor,
                      chartProperties.symbolScaleSize
                    )
                  } 
                />  
                <Line data={negatives} dataKey="IC"  type="linear"  name="Negative PP IDs"
                  stroke={chartProperties.negativeLineColor}
                  strokeDasharray={
                    chartProperties.negativeLineStyle === "dashed"
                      ? "6 4"
                      : chartProperties.negativeLineStyle === "dotted"
                      ? "2 4"
                      : chartProperties.negativeLineStyle === "dashdot"
                      ? "8 4 2 4"
                      : "0"
                  }
                  strokeWidth={chartProperties.negativeLineThickness}
                  isAnimationActive={false}
                  hide={!chartProperties.negativeVisibility}
                  dot={(props) =>
                    applyChartStyling.symbolShape(
                      chartProperties.symbolStyle,
                      props,
                      chartProperties.negativeSymbolColor,
                      chartProperties.symbolScaleSize
                    )
                  }
                />
                
                {/* IC Curves for line chart */}
                {/* {renderICCurves(unitSignature, unitType, "line")} */}
    
                {/* Bias Lines for line chart */}
                {/* {renderBiasLines(unitType, "line")} */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
  
      case "2": // PR vs RR
        return renderScatter(tableData, "RRN", "PRN", 
          "Receptive Ratio (RR)",  
          "Productive Ratio (PR)", unitSignature, unitType);
  
      case "3": // AR vs RR
        return renderScatter(tableData, "RRN", "ARN", 
          "Receptive Ratio (RR)",
          "Acuity Ratio (AR)", unitSignature, unitType);
  
      case "4": // PR vs AR
        return renderScatter(tableData, "PRN", "ARN", "Productive Ratio (PR)",
          "Acuity Ratio (AR)",
          unitSignature, unitType);
  
      case "5": // AR vs PR vs RR — 3D (Only for Third Parameter)
        return (
          <div style={{ position: 'relative', width: '100%', height: '600px' }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-[900px] h-full">
                {render3DScatter(tableData, unitType)}
              </div>
            </div>
            <div style={{ 
              position: 'absolute', 
              top: 25, 
              right: 10, 
              background: 'rgba(255,255,255,0.8)', 
              padding: '10px', 
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              <div>3D Surface Plot</div>
              <div>Unit Type: {unitType}</div>
              {unitType === "Third Parameter" && (
                <div>Showing Bias Planes</div>
              )}
              {filters?.showProjectionPoints === true && projectionData.length > 0 && (
                <div>Showing Performance Points (Green)</div>
              )}
              {filters?.showGrowthTarget === true && growthTargetData.length > 0 && (
                <div>Showing Growth Targets (Purple)</div>
              )}
            </div>
          </div>
        );
  
      default:
        return null;
    }
  };
  

  const exportToExcelWithImage = async () => {
    if (!selectedChart || !chartContainerRef.current) {
      alert("Please select a chart first.");
      return;
    }
  
    try {
      // Extract key name from chart selection
      const keyName = selectedChart.name.match(/\((.*?)\)/)?.[1];
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
        worksheet.mergeCells(`A${currentRow-1}:D${currentRow-1}`);
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


  const sortedData = [...tableData].sort((a, b) => {
    if (a.ppId < 0 && b.ppId < 0) {
      return b.ppId - a.ppId; // Descending order for negatives
    }
    
    // Handle positive PP IDs (ascending: 1, 2, 3, ...)
    if (a.ppId > 0 && b.ppId > 0) {
      return a.ppId - b.ppId; // Ascending order for positives
    }
    
    // Negative PP IDs come before positive PP IDs
    if (a.ppId < 0 && b.ppId > 0) {
      return -1;
    }
    if (a.ppId > 0 && b.ppId < 0) {
      return 1;
    }
    
    return 0;
  });

  const exportAsJPG = async () => {
    if (!chartContainerRef.current) {
      alert("No chart available to export");
      return;
    }
  
    try {
      const container = chartContainerRef.current;
      
      // Find all scrollable children
      const scrollableElements = container.querySelectorAll('[class*="overflow"]');
      const originalStyles = [];
      
      // Store and modify styles for container
      const containerOriginalStyles = {
        overflow: container.style.overflow,
        maxHeight: container.style.maxHeight,
        height: container.style.height,
        width: container.style.width,
      };
      
      container.style.overflow = 'visible';
      container.style.maxHeight = 'none';
      container.style.height = 'auto';
      container.style.width = 'auto';
      
      // Store and modify styles for all scrollable children
      scrollableElements.forEach((el) => {
        originalStyles.push({
          element: el,
          overflow: el.style.overflow,
          maxHeight: el.style.maxHeight,
          height: el.style.height,
        });
        
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
      });
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });
  
      // Restore container styles
      container.style.overflow = containerOriginalStyles.overflow;
      container.style.maxHeight = containerOriginalStyles.maxHeight;
      container.style.height = containerOriginalStyles.height;
      container.style.width = containerOriginalStyles.width;
      
      // Restore all scrollable children styles
      originalStyles.forEach(({ element, overflow, maxHeight, height }) => {
        element.style.overflow = overflow;
        element.style.maxHeight = maxHeight;
        element.style.height = height;
      });
  
      canvas.toBlob((blob) => {
        saveAs(blob, `chart-${selectedChart?.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().getTime()}.jpg`);
      }, 'image/jpeg', 0.95);
  
    } catch (error) {
      console.error('JPG Export failed:', error);
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
      
      // Find all scrollable children
      const scrollableElements = container.querySelectorAll('[class*="overflow"]');
      const originalStyles = [];
      
      // Store and modify styles for container
      const containerOriginalStyles = {
        overflow: container.style.overflow,
        maxHeight: container.style.maxHeight,
        height: container.style.height,
        width: container.style.width,
      };
      
      container.style.overflow = 'visible';
      container.style.maxHeight = 'none';
      container.style.height = 'auto';
      container.style.width = 'auto';
      
      // Store and modify styles for all scrollable children
      scrollableElements.forEach((el) => {
        originalStyles.push({
          element: el,
          overflow: el.style.overflow,
          maxHeight: el.style.maxHeight,
          height: el.style.height,
        });
        
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
      });
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });
  
      // Restore container styles
      container.style.overflow = containerOriginalStyles.overflow;
      container.style.maxHeight = containerOriginalStyles.maxHeight;
      container.style.height = containerOriginalStyles.height;
      container.style.width = containerOriginalStyles.width;
      
      // Restore all scrollable children styles
      originalStyles.forEach(({ element, overflow, maxHeight, height }) => {
        element.style.overflow = overflow;
        element.style.maxHeight = maxHeight;
        element.style.height = height;
      });
  
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
      
      pdf.save(`chart-${selectedChart?.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().getTime()}.pdf`);
  
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
      <div className="flex h-full w-full my-2">
        <div className='w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200 p-1'>
            <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
              <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreateMaterial(true)} title="Create Reset" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <RefreshCw className="w-4 h-4 hover:text-green-600" onClick={() => {
                  if (typeof onResetFilters === "function") {
                    onResetFilters(); // reset filters in parent
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
                  <div className="col-span-9 px-1 py-1 text-left">Entities</div>
                  <div className="col-span-3  py-1 text-left">ID</div>
                </div>
                
                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(100%-40px)]">
                  {selectedSort === 'activateCandidateLevel' ? (
                    activateCandidateLevel.map((chart) => (
                      <div
                        key={chart.id} // Use id instead of index
                        className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer
                          ${selectedChart?.name === chart.name ? "bg-gray-200" : "hover:bg-gray-200"} `}
                        onClick={() => handleChartSelect(chart)}
                      >
                        <div className="col-span-9 text-xs text-gray-700 truncate">{chart.icon}{chart.name}</div>
                        <div className="col-span-3 pl-3 text-xs text-gray-400">{chart.id}</div>
                      </div>
                    ))
                  ) : selectedSort === 'activateUnitLevel' ? (
                    activateUnitLevel.map((chart) => (
                      <div
                        key={chart.id} // Use id instead of index
                        className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer
                          ${selectedChart?.name === chart.name ? "bg-gray-200" : "hover:bg-gray-200"} `}
                        onClick={() => handleChartSelect(chart)}
                      >
                        <div className="col-span-9 text-xs text-gray-700 truncate">🔵{chart.name}</div>
                        <div className="col-span-3 pl-3 text-xs text-gray-400">{chart.id}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 uppercase">
                      No data available for this selection

                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="h-[60%] flex flex-col border border-gray-200">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeAdjustPropertieTab === 'Property editor'
                    ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Property editor')}
                >
                  Property editor
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

              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full">
                {activeAdjustPropertieTab === 'Property editor' && (
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                    
                  />
                )}

                {activeAdjustPropertieTab === "Table" && (() => {


                  const cols = getTableColumns();
                  if (!cols) return <div className=' flex justify-center uppercase mt-2 text-gray-500'>Select a chart</div>;
                  
                  return (
                    <div className="text-xs text-gray-600 mt-2 w-full overflow-auto mb-16 pb-1">
                      {sortedData.length === 0 ? (
                        <div className="flex justify-center items-center py-6 text-gray-500 uppercase">
                          No Data Available
                        </div>
                      ) : (
                        <>
      {/* ✅ Positive PP IDs */}
      <h3 className="text-gray-600 font-semibold mb-2 ml-2">
        Positive PP IDs
      </h3>

      <table className="text-xs border border-gray-300 mb-6" style={{ width: 'max-content', minWidth: '100%' }}>
        <thead className="bg-gray-100">
          <tr>
            {cols.columns.map(col => (
              <th key={col.key} className="border px-3 py-1 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData
            .filter(row => row.ppId > 0)
            .map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50">
                {cols.columns.map(col => (
                  <td key={col.key} className="border px-3 py-1 text-center whitespace-nowrap">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* ✅ Negative PP IDs */}
      <h3 className="text-gray-600 font-semibold mb-2 ml-2">
        Negative PP IDs
      </h3>

      <table className="text-xs border border-gray-300" style={{ width: 'max-content', minWidth: '100%' }}>
        <thead className="bg-gray-100">
          <tr>
            {cols.columns.map(col => (
              <th key={col.key} className="border px-3 py-1 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData
            .filter(row => row.ppId < 0)
            .map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50">
                {cols.columns.map(col => (
                  <td key={col.key} className="border px-3 py-1 text-center whitespace-nowrap">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 bg-white ml-1">
  
          <div ref={chartContainerRef} className="flex flex-col h-full">
            {selectedChart ? (
              <h2 className="text-lg text-center font-semibold text-gray-700 ">
                {selectedChart.icon} {selectedChart.name}
              </h2>
            ) : (
              <div className="flex justify-center h-full text-gray-400 text-lg mt-2">
                SELECT A PLOT
              </div>
            )}

            <div className="h-full overflow-auto mb-2 p-3">
              {renderSelectedChart()}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

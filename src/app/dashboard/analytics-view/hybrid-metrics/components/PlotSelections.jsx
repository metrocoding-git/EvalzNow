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
import Plot from "react-plotly.js";
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

  const [thresholdValue, setThresholdValue] = useState(null);

  
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
  visibility: true,
  layer: 1,
  reference: false,

  // Curve Label
  showLabel: false,
  labelType: "X Type",
  showLabelPrefix: false,
  labelPrefix: "X File name",
  showLabelSuffix: false,
  labelSuffix: "Y subcase",

  // Line Attribute
  lineStyle: "solid",
  lineColor: "#3b82f6",
  lineThickness: 2,

  // Symbol Attribute
  symbolStyle: "circle",
  symbolColor: "#3b82f6",
  symbolFrequency: 1,
  symbolScaleSize: 1,

  // Shade area
  shadeArea: "#ffffff",
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

  const [selectedChart, setSelectedChart] = useState(null);

  const activateCandidateLevel = [
    {
      name: "Interaction Class (IC) vs. PP ID",
      icon: "🔀",
      type: "line", // Separate lines for -PP IDs and +PP IDs
      id: "1"
    },
    {
      name: "Productive Ratio (PR) vs.Receptive Ratio (RR) 2-D Cross Plot",
      icon: "📊",
      type: "scatter-2d",
      id: "2"
    },
    {
      name: "Acuity Ratio (AR) vs. Receptive Ratio (RR) 2-D Cross Plot",
      icon: "📊",
      type: "scatter-2d",
      id: "3"
    },
    {
      name: "Productive Ratio (PR) vs. Acuity Ratio (AR) Cross Plot",
      icon: "📊",
      type: "scatter-2d",
      id: "4"
    },
    ...(unitType === "Third Parameter" ? [{
      name: "Acuity Ratio (AR) vs. Productive Ratio (PR) vs. Receptive Ratio (RR) 3-D Cross Plot",
      icon: "📈",
      type: "scatter-3d",
      id: "5"
    }] : [])
  ];


  const activateUnitLevel = [
    {
      name: "Interaction Class (IC) vs. PP ID",
      icon: "🔀",
      type: "scatter-2d", // Separate lines for -PP IDs and +PP IDs
      id: "1"
    },
    {
      name: "Productive Ratio (PR) vs.Receptive Ratio (RR) 2-D Cross Plot",
      icon: "📊",
      type: "scatter-2d",
      id: "2",
    },
    {
      name: "Acuity Ratio (AR) vs. Receptive Ratio (RR) 2-D Cross Plot",
      icon: "📊",
      type: "scatter-2d",
      id: "3"
    },
    {
      name: "Productive Ratio (PR) vs. Acuity Ratio (AR) Cross Plot",
      icon: "📊",
      type: "scatter-2d",
      id: "4"
    },
    ...(unitType === "Third Parameter" ? [{
      name: "Acuity Ratio (AR) vs. Productive Ratio (PR) vs. Receptive Ratio (RR) 3-D Cross Plot",
      icon: "📈",
      type: "scatter-3d",
      id: "5"
    }] : [])  

  ];

  const getTableColumns = () => {
    switch (selectedChart?.id) {
      case "1": // IC vs PP ID
        return {
          xKey: "ppId",
          xLabel: "PP ID",
          yKey: "IC",
          yLabel: "Interaction Class"
        };
  
      case "2": // PR vs RR
        return {
          xKey: "RRN",
          xLabel: "RR",
          yKey: "PRN",
          yLabel: "PR"
        };
  
      case "3": // AR vs RR
        return {
          xKey: "RRN",
          xLabel: "RR",
          yKey: "ARN",
          yLabel: "AR"
        };
  
      case "4": // PR vs AR
        return {
          xKey: "PRN",
          xLabel: "PR",
          yKey: "ARN",
          yLabel: "AR"
        };
  
      case "5": // 3D
        return {
          xKey: "RRN",
          xLabel: "RR",
          yKey: "PRN",
          yLabel: "PR",
          zKey: "ARN",
          zLabel: "AR"
        };
  
      default:
        return null;
    }
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
        setTableData([]); // clear previous table data
      
        return;
      }
      
      
      setLoading(true);
      setError(null);
      try {
        const apiFilters = {
          unitId: unitId,
          candidate_id: candidateId,
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined,
          ppId: filters?.selectedPpId ?? undefined, // ✅ This should now be passed correctly
        };
  
        console.log("🔍 API Filters being sent:", apiFilters);
        console.log("🔍 Selected PP ID from filters:", filters?.selectedPpId);
  
        const data = await getUnitAndMultipleCandidateSummary(apiFilters);

        console.log("real hybrid: ", data);
  
        const { results, averages, stdDev, stdErr } = data;  
  
        const formattedData = results.map(row => ({
          ppId: row.ppId,
          IC: getICValue(unitType, unitSignature, row.IC),
          RRN: row.RRN || 0,
          PRN: row.PRN || 0,
          ARN: row.ARN || 0,
        }));

        setTableData(formattedData);

        const averageData = averages.map(item => ({
          ppId: item.ppId,
          RRN: item.RRN,
          PRN: item.PRN,
          ARN: item.ARN,
        }));

        setAverageData(averageData);

        const growthTargetData = results.filter(item => item.ppId > 0).map(item => ({
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

        console.log("growth Target data: ", growthTargetData);
        
      } catch (err) {
        console.error("Failed to fetch tabulation data:", err);
        setError("Failed to load table data.");
        // setStabilitySummary({ stable: 0, unstable: 0 });
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
    if (unitType !== "Communicative I/O" && unitType !== "Theory & Practice") {
      return null;
    }
  
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
            isAnimationActive={false}
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
          isAnimationActive={false}
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
    // Only show IC curves for specific unit types
    if (unitType !== "Communicative I/O" && unitType !== "Theory & Practice") {
      return null;
    }
  
    const icLevels = ["IC1", "IC2", "IC3", "IC4", "IC5"];
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
    
    return icLevels.map((icLevel, index) => {
      const curveData = getICCurveData(signatureProfile, icLevel);
      if (!curveData) return null;
  
      // For scatter charts, transform data to match the expected structure
      if (chartType === "scatter") {
        const scatterPoints = curveData.x.map((x, i) => ({
          [xKey]: x,        // Use the actual xKey (RRN, PRN, etc.)
          [yKey]: curveData.y[i], // Use the actual yKey
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
          isAnimationActive={false}
        />
        );
      }
      
      // For line charts
      return (
        <Line 
          key={icLevel}
          data={curveData.x.map((x, i) => ({ ppId: x, value: curveData.y[i] }))}
          dataKey="value"
          name={icLevel}
          stroke={colors[index]}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      );
    });
  };


  const renderScatter = (tableData, xKey, yKey, xLabel, yLabel, signatureProfile, unitType) => {
    // Check if we should show averages
    const showAverages = filters?.unitMode === "averages" && averageData.length > 0;
    // Check if we should show projection data
    const showProjection = filters?.showProjectionPoints === true && projectionData.length > 0;
    // Check if we should show growth target data
    const showGrowthTarget = filters?.showGrowthTarget === true && growthTargetData.length > 0;
    
    // Get growth target points for the current chart
    const growthTargetPoints = showGrowthTarget ? getGrowthTargetPoints(selectedChart?.id, growthTargetData) : [];
    
    console.log("📊 Growth Target Points for chart", selectedChart?.id, ":", growthTargetPoints);
  
    return (
      <ResponsiveContainer width="100%" height="95%">
        <ScatterChart 
          data={tableData}
          margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
        >
          <CartesianGrid />
          <XAxis 
            dataKey={xKey} 
            type="number"
            name={xLabel}
          >
            <Label value={xLabel} position="bottom" offset={-2} style={{ fontSize: "14px", fontWeight: "500" }} />
          </XAxis>
          <YAxis 
            dataKey={yKey} 
            type="number"
            name={yLabel}
          >
            <Label value={yLabel} angle={-90} position="left" offset={-7} style={{ fontSize: "14px", fontWeight: "500" }} />
          </YAxis>
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />
          
          {/* Reference Lines */}
          {renderReferenceLinesForScatter(xKey, yKey)}
          
          {/* Original data */}
          <Scatter 
            data={tableData} 
            dataKey={yKey} 
            fill="#3b82f6" 
            name="Data Points" 
          />
          
          {/* Average data points */}
          {showAverages && (
            <Scatter 
              data={averageData} 
              dataKey={yKey} 
              fill="#ff6b6b" 
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
          
          {/* Projection data points (Performance Points) */}
          {showProjection && (
            <Scatter 
              data={projectionData} 
              dataKey={yKey} 
              fill="#10b981" 
              name="Performance Points"
              shape={(props) => (
                <circle 
                  cx={props.cx} 
                  cy={props.cy} 
                  r={8} 
                  fill="#10b981" 
                  stroke="#000000"
                  strokeWidth={1}
                />
              )}
            />
          )}
          
          {/* Growth Target data points */}
         
          {showGrowthTarget && growthTargetPoints.length > 0 && (
            <Scatter 
              data={growthTargetPoints} 
              dataKey={yKey}  // This will now work because the points have RRN/PRN/ARN keys
              fill="#8b5cf6" 
              name="Growth Targets"
              shape={(props) => (
                <rect 
                  x={props.cx - 5} 
                  y={props.cy - 5} 
                  width={10} 
                  height={10} 
                  fill="#8b5cf6" 
                  stroke="#000000"
                  strokeWidth={1}
                />
              )}
            />
          )}
          {/* IC Curves */}
          {renderICCurves(signatureProfile, unitType, "scatter", xKey, yKey)}
  
          {/* Bias Lines */}
          {renderBiasLines(unitType, "scatter", xKey, yKey)}
        </ScatterChart>
      </ResponsiveContainer>
    );
  };
  
  const render3DScatter = (tableData, unitType) => {
    // Check if we should show averages
    const showAverages = filters?.unitMode === "averages" && averageData.length > 0;
    // Check if we should show projection data
    const showProjection = filters?.showProjectionPoints === true && projectionData.length > 0;
    // Check if we should show growth target data
    const showGrowthTarget = filters?.showGrowthTarget === true && growthTargetData.length > 0;


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
            size: 8,
            color: '#8b5cf6',
            symbol: 'square'
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
  
    const plotData = [
      {
        x: tableData.map(r => r.RRN),
        y: tableData.map(r => r.PRN),
        z: tableData.map(r => r.ARN),
        type: "scatter3d",
        mode: "markers",
        marker: { 
          size: 4,
          color: '#3b82f6'
        },
        name: "Data Points"
      }
    ];
  
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
          size: 6,
          color: '#10b981',
          symbol: 'star'
        },
        name: "Growth Targets"
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
        }
      );
    }
  
    return (
      <Plot
        data={plotData}
        layout={{
          height: 800,
          width: 800,
          title: "Butler Hybrid Model",
  
          // 🔥 All 3D properties must be inside scene
          scene: {
            camera: {
              eye: { x: 0, y: 0, z: 0 }
            },
  
            aspectratio: { x: 1, y: 1, z: 1 },
  
            xaxis: {
              title: { text: "RECEPTIVE RATIO (RR)" },
              nticks: 10,
              range: [0, 1],
            },
            yaxis: {
              title: { text: "PRODUCTIVE RATIO (PR)" },
              nticks: 10,
              range: [0, 1],
            },
            zaxis: {
              title: { text: "ACUITY RATIO (AR)" },
              nticks: 10,
              range: [0, 1],
            },
          },
  
          margin: { l: 0, r: 0, b: 0, t: 50 },
          showlegend: true,
          legend: {
            x: 0,
            y: 1,
            bgcolor: "rgba(255,255,255,0.8)"
          }
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  };
  
  const renderSelectedChart = () => {
    if (!selectedChart) return null;
  
    switch (selectedChart.id) {
      case "1":  // Interaction Class vs PP ID (Line) - No averages or projections for this chart
        const positives = tableData.filter(r => r.ppId > 0);
        const negatives = tableData.filter(r => r.ppId < 0);
  
        return (
          <ResponsiveContainer width="100%" height="95%">
            <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ppId" type="number">
                <Label value="PP ID" position="bottom" offset={0} />
              </XAxis>
              <YAxis dataKey="IC">
                <Label value="Interaction Class (IC)" angle={-90} position="center" offset={-7} />
              </YAxis>
              <Tooltip />
              <Legend />
  
              {/* Reference Lines */}
              {renderReferenceLinesForLineChart()}
              
              <Line data={positives} dataKey="IC" name="Positive PP IDs" type="linear" stroke="#3b82f6" dot />  
              <Line data={negatives} dataKey="IC" name="Negative PP IDs" type="linear" stroke="#ef4444" dot />
              
              {/* IC Curves for line chart */}
              {renderICCurves(unitSignature, unitType, "line")}
  
              {/* Bias Lines for line chart */}
              {renderBiasLines(unitType, "line")}
            </LineChart>
          </ResponsiveContainer>
        );
  
      case "2": // PR vs RR
        return renderScatter(tableData, "RRN", "PRN", "RR (X)", "PR (Y)", unitSignature, unitType);
  
      case "3": // AR vs RR
        return renderScatter(tableData, "RRN", "ARN", "RR (X)", "AR (Y)", unitSignature, unitType);
  
      case "4": // PR vs AR
        return renderScatter(tableData, "PRN", "ARN", "AR (X)", "PR (Y)", unitSignature, unitType);
  
      case "5": // AR vs PR vs RR — 3D (Only for Third Parameter)
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {render3DScatter(tableData, unitType)}
            <div style={{ 
              position: 'absolute', 
              top: 10, 
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
                    onResetFilters(); // ✅ reset filters in parent
                  }
                }} />
              </button>
              <button onClick={handleDeleteCurve} title="Export" className='text-red-600 hover:text-red-800 cursor-pointer'>
                <FolderOutput className="w-4 h-4 hover:text-blue-600" />
              </button>
           
            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className="h-1/2 flex flex-col border border-gray-200">
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
                          ${selectedChart?.name === chart.name ? "bg-gray-100" : "hover:bg-gray-200"} `}
                        onClick={() => handleChartSelect(chart)}
                      >
                        <div className="col-span-9 text-xs text-gray-700 truncate">📉{chart.name}</div>
                        <div className="col-span-3 pl-3 text-xs text-gray-400">{chart.id}</div>
                      </div>
                    ))
                  ) : selectedSort === 'activateUnitLevel' ? (
                    activateUnitLevel.map((chart) => (
                      <div
                        key={chart.id} // Use id instead of index
                        className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer
                          ${selectedChart?.name === chart.name ? "bg-gray-100" : "hover:bg-gray-200"} `}
                        onClick={() => handleChartSelect(chart)}
                      >
                        <div className="col-span-9 text-xs text-gray-700 truncate">📉{chart.name}</div>
                        <div className="col-span-3 pl-3 text-xs text-gray-400">{chart.id}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No data available for this selection
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="h-1/2 flex flex-col border border-gray-200">
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
                  if (!cols) return <div className="text-center text-gray-500">Select a chart</div>;

                  return (
                    <div className="text-sm text-gray-600 mt-2 w-full overflow-auto min-h-60 mb-16 pb-3">
                      <table className="table-auto w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-3 py-2">{cols.xLabel}</th>
                            <th className="border px-3 py-2">{cols.yLabel}</th>
                            {cols.zKey && (
                              <th className="border px-3 py-2">{cols.zLabel}</th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {tableData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50">
                              <td className="border px-3 py-2 text-center">{row[cols.xKey]}</td>
                              <td className="border px-3 py-2 text-center">{row[cols.yKey]}</td>
                              {cols.zKey && (
                                <td className="border px-3 py-2 text-center">{row[cols.zKey]}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200  bg-gray-100 ml-1">

          <h2 className="text-lg text-center font-semibold text-gray-700 my-2 ">
            {selectedChart ? `${selectedChart.icon} ${selectedChart.name}` : 'Select a plot'}
          </h2>

          <div className="h-full overflow-auto mb-9 p-3">
            {renderSelectedChart()}
          </div>

          {/* <div className="h-full overflow-auto m-5">
            <ResponsiveContainer width="100%" height="95%">
              <LineChart data={floatChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name">
                  <Label value="Time Period (X)" offset={-10} position="insideBottom" />
                </XAxis>

                <YAxis>
                  <Label
                    value="Score / Value (Y/Z)"
                    angle={-90}
                    position="insideLeft"
                    offset={10}
                  />
                </YAxis>

                <Tooltip />
                <Legend verticalAlign="top" />

                <Line
                  type="monotone"
                  dataKey="xValue"
                  name="X Axis Value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="yValue"
                  name="Y Axis Value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="zValue"
                  name="Z Axis Value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div> */}
        </div>
      </div>








    </>
  );
}

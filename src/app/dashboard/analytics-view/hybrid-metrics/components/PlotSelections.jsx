'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X, RefreshCw, FolderOutput } from 'lucide-react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  Label,
  ScatterChart,
  Scatter
} from 'recharts';
import PropertyEditor from '../../components/PropertyEditor';
import { getUnitAndMultipleCandidateSummary } from '@/services/tabulationTableService';
import Plot from "react-plotly.js";
import IcCurve from './IcCurveData';
import { ReceptiveBias } from './ReceptiveBias';
import { BalancedPlane } from './BalancedPlane';
import { ProductivePlane } from './ProductivePlane';


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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("filtres: ", filters);
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
      type: "line", // Separate lines for -PP IDs and +PP IDs
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

  console.log("signatire proudile -", unitSignature);

  console.log('unit type - ', unitType);

  useEffect(() => {
    const fetchTabulationData = async () => {
      if (!unitId || !candidateId) {
        setTableData([]); // clear previous table data
      
        return;
      }
      
      
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

        console.log("real hybrid: ", data);
  
        const { results, average, stdDev, stdErr } = data;  
  
        const formattedData = results.map(row => ({
          ppId: row.ppId,
          IC: getICValue(unitType, unitSignature, row.IC),
          RRN: row.RRN || 0,
          PRN: row.PRN || 0,
          ARN: row.ARN || 0,
        }));
        
        
        setTableData(formattedData);

        // console.log("hybrid data: ", tableData);
        
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

  console.log("table data: ", tableData);


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


  const renderScatter = (tableData, xKey, yKey, xLabel, yLabel, signatureProfile, unitType) => (
    <ResponsiveContainer width="100%" height="95%">
      <ScatterChart 
        data={tableData} // Provide base data for the chart
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
        
        {/* Original data */}
        <Scatter 
          data={tableData} 
          dataKey={yKey} 
          fill="#3b82f6" 
          name="Data Points" 
        />
        
         {/* IC Curves */}
        {renderICCurves(signatureProfile, unitType, "scatter", xKey, yKey)}

        {/* Bias Lines */}
        {renderBiasLines(unitType, "scatter", xKey, yKey)}
      </ScatterChart>
    </ResponsiveContainer>
  );

  const render3DScatter = (tableData, unitType) => {
    // Get plane data
    const receptiveData = ReceptiveBias();
    const balancedData = BalancedPlane();
    const productiveData = ProductivePlane();
  
    // Convert the coordinate arrays to mesh format for Plotly
    const createMeshData = (x, y, z, color, name) => {
      // Check if arrays have consistent lengths
      if (x.length !== y.length || x.length !== z.length) {
        console.warn(`Mesh data inconsistent for ${name}: x=${x.length}, y=${y.length}, z=${z.length}`);
        return null;
      }
  
      const i = [];
      const j = [];
      const k = [];
      
      // Determine grid size based on data pattern
      // For ReceptiveBias and BalancedPlane: 41×41 grid (1681 points)
      // For ProductivePlane: might be different structure
      let gridSize;
      if (x.length === 1681) {
        gridSize = 41; // 41×41 grid
      } else {
        // Try to detect grid size for other patterns
        gridSize = Math.sqrt(x.length);
        if (!Number.isInteger(gridSize)) {
          console.warn(`Cannot determine grid size for ${name} with ${x.length} points`);
          return null;
        }
      }
      
      console.log(`Creating mesh for ${name}: ${x.length} points, gridSize=${gridSize}`);
      
      for (let row = 0; row < gridSize - 1; row++) {
        for (let col = 0; col < gridSize - 1; col++) {
          const idx = row * gridSize + col;
          
          // First triangle
          i.push(idx);
          j.push(idx + 1);
          k.push(idx + gridSize);
          
          // Second triangle
          i.push(idx + 1);
          j.push(idx + gridSize + 1);
          k.push(idx + gridSize);
        }
      }
      
      return {
        type: "mesh3d",
        x: x,
        y: y, 
        z: z,
        i: i,
        j: j,
        k: k,
        opacity: 0.5,
        color: color,
        name: name,
        flatshading: true
      };
    };
  
    const plotData = [
      // Main scatter plot data
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
  
    // Add surfaces only for Third Parameter unit type
    if (unitType === "Third Parameter") {
      // Receptive Bias Plane
      const receptiveMesh = createMeshData(
        receptiveData.Px1, 
        receptiveData.Py1, 
        receptiveData.Pz1,
        '#ff6b6b',
        "Receptive Bias"
      );
      if (receptiveMesh) plotData.push(receptiveMesh);
  
      // Balanced Plane
      const balancedMesh = createMeshData(
        balancedData.Px2, 
        balancedData.Py2, 
        balancedData.Pz2,
        '#4ecdc4', 
        "Balanced Plane"
      );
      if (balancedMesh) plotData.push(balancedMesh);
  
      // Productive Bias Plane - handle the inconsistent data
      console.log("Productive Plane data:", {
        Px3_length: productiveData.Px3?.length,
        Py3_length: productiveData.Py3?.length, 
        Pz3_length: productiveData.Pz3?.length
      });
  
      // For ProductivePlane, let's try a different approach since the data is inconsistent
      if (productiveData.Px3 && productiveData.Py3 && productiveData.Pz3) {
        // Use scatter3d as fallback if mesh fails
        const productiveMesh = createMeshData(
          productiveData.Px3,
          productiveData.Py3,
          productiveData.Pz3,
          '#feca57',
          "Productive Bias"
        );
        
        if (productiveMesh) {
          plotData.push(productiveMesh);
        } else {
          // Fallback: show as points instead of mesh
          plotData.push({
            x: productiveData.Px3,
            y: productiveData.Py3.slice(0, productiveData.Px3.length), // Match lengths
            z: productiveData.Pz3.slice(0, productiveData.Px3.length), // Match lengths
            type: "scatter3d",
            mode: "markers",
            marker: {
              size: 2,
              color: '#feca57',
              opacity: 0.3
            },
            name: "Productive Bias Points"
          });
        }
      }
    }
  
    return (
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          scene: {
            xaxis: { 
              title: "RR",
              range: [0, 1]
            },
            yaxis: { 
              title: "PR",
              range: [0, 1]
            },
            zaxis: { 
              title: "AR",
              range: [0, 1]
            },
            camera: {
              eye: { x: 1.5, y: 1.5, z: 1.5 }
            }
          },
          margin: { l: 0, r: 0, b: 0, t: 0 },
          showlegend: true,
          legend: {
            x: 0,
            y: 1,
            bgcolor: 'rgba(255,255,255,0.8)'
          }
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  };
  
  const renderSelectedChart = () => {
    if (!selectedChart) return null;
  
    switch (selectedChart.id) {
      case "1":  // Interaction Class vs PP ID (Line)
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
                <RefreshCw className="w-4 h-4 hover:text-green-600" onClick={() => setScoreAdd(true)} />
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

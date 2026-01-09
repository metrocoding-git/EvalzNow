'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X, RefreshCw, FolderOutput } from 'lucide-react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  Label
} from 'recharts';
import PropertyEditor from './PropertyEditor';
import NeuroObject from './NeuroObject';
import { getNeuroObjectRMSValue } from '@/services/neuroScienceService';
import Front_lobe from '../../../../../../public/icons/Frontal_Lobe.png';
import Parietal_Lobe from '../../../../../../public/icons/Parietal_Lobe.png';
import Occipital_Lobe from '../../../../../../public/icons/Occipital_Lobe.png';
import Temporal_Lobe from '../../../../../../public/icons/Temporal_Lobe.png';
import Image from 'next/image';
import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';

/// <param name="xArray">array data - covers the range of Performance Point IDs (+PP ID only)</param>
/// <param name="yArray">array data - represents the RMS for each +PP ID.</param>
function cognitiveNS(xArray, yArray) {
  var areasub = 0;

  for (var i = 0; i < xArray.length; i++) {
    if (i <= xArray.length - 2 && yArray[i] != 0 && yArray[i + 1] != 0) {
      areasub +=
        (yArray[i] + yArray[i + 1]) / 2;
    } else {
      continue;
    }
  }

  return parseFloat(areasub).toFixed(3);
}


function computeRowCognitiveNS(indicatorsData, row, rmsKey) {
  // Get all rows of same target (Proficiency / Growth)
  const sameTarget = indicatorsData
    .filter(r => r.target === row.target)
    .sort((a, b) => a.ppId - b.ppId);

  // Take all rows up to current ppId
  const uptoCurrent = sameTarget.filter(r => r.ppId <= row.ppId);

  // Need at least 2 PP points
  if (uptoCurrent.length < 2) return "0.000";

  const xArray = uptoCurrent.map(r => r.ppId);
  const yArray = uptoCurrent.map(r => Number(r[rmsKey]) || 0);

  return cognitiveNS(xArray, yArray);
}



export default function PlotSelections({ activeChart, setActiveChart, unitId, candidateId, filters, onResetFilters }) {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [showLobeImage, setShowLobeImage] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);
  const [indicatorsData, setIndicatorsData] = useState([]);
  const floatChartData = [
    { name: "Jan", xValue: 1.2, yValue: 2.1, zValue: 0.9 },
    { name: "Feb", xValue: 2.8, yValue: 1.4, zValue: 1.6 },
    { name: "Mar", xValue: 1.5, yValue: 2.9, zValue: 2.2 },
    { name: "Apr", xValue: 3.1, yValue: 3.0, zValue: 2.7 },
    { name: "May", xValue: 2.0, yValue: 1.8, zValue: 3.1 },
    { name: "Jun", xValue: 2.6, yValue: 2.2, zValue: 3.4 },
  ];
  const chartContainerRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetchNeuroData = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const neuroToolsTable = [
    { index: 1, ppId: 1, value: 'Yes' },
    { index: 2, ppId: 2, value: 'Yes' },
    { index: 3, ppId: 3, value: 'No' },
    { index: 4, ppId: 4, value: 'No' },
    { index: 5, ppId: 5, value: 'Yes' },
    { index: 6, ppId: 6, value: 'No' },
    { index: 7, ppId: 7, value: 'Yes' },
  ]

  const chartConfig = {
    2: { target: "Proficiency", rmsKey: "RMS1", lobe: "Frontal Lobe - Left" },
    3: { target: "Proficiency", rmsKey: "RMS2", lobe: "Occipital Lobe - Left" },
    4: { target: "Proficiency", rmsKey: "RMS3", lobe: "Parietal Lobe - Left" },
    5: { target: "Proficiency", rmsKey: "RMS4", lobe: "Temporal Lobe - Left" },
    6: { target: "Proficiency", rmsKey: "RMS5", lobe: "Frontal Lobe - Right" },
    7: { target: "Proficiency", rmsKey: "RMS6", lobe: "Occipital Lobe - Right" },
    8: { target: "Proficiency", rmsKey: "RMS7", lobe: "Parietal Lobe - Right" },
    9: { target: "Proficiency", rmsKey: "RMS8", lobe: "Temporal Lobe - Right" },
  
    10: { target: "Growth", rmsKey: "RMS1", lobe: "Frontal Lobe - Left" },
    11: { target: "Growth", rmsKey: "RMS2", lobe: "Occipital Lobe - Left" },
    12: { target: "Growth", rmsKey: "RMS3", lobe: "Parietal Lobe - Left" },
    13: { target: "Growth", rmsKey: "RMS4", lobe: "Temporal Lobe - Left" },
    14: { target: "Growth", rmsKey: "RMS5", lobe: "Frontal Lobe - Right" },
    15: { target: "Growth", rmsKey: "RMS6", lobe: "Occipital Lobe - Right" },
    16: { target: "Growth", rmsKey: "RMS7", lobe: "Parietal Lobe - Right" },
    17: { target: "Growth", rmsKey: "RMS8", lobe: "Temporal Lobe - Right" },
  };
  


  const loadsData = [
    { ppId: 1, target: 'Proficiency', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 1, target: 'Growth', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 2, target: 'Proficiency', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 2, target: 'Growth', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 3, target: 'Proficiency', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 3, target: 'Growth', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 4, target: 'Proficiency', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
    { ppId: 4, target: 'Growth', Cognitive1: '', Cognitive2: '', Cognitive3: '', Cognitive4: '', Cognitive5: '', Cognitive6: '', Cognitive7: '', Cognitive8: '' },
  ]

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

  // Lobe data with image mappings
const lobeData = [
  { 
    id: 1, 
    name: "Frontal Lobe", 
    image: Front_lobe,
    
  },
  { 
    id: 2, 
    name: "Parietal Lobe", 
    image: Parietal_Lobe,
    
  },
  { 
    id: 3, 
    name: "Occipital Lobe", 
    image: Occipital_Lobe,
    
  },
  { 
    id: 4, 
    name: "Temporal Lobe", 
    image: Temporal_Lobe,
    
  }
];

  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Indicators');


  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: 'A', uv: 400, pv: 240 },
    { name: 'B', uv: 300, pv: 139 },
    { name: 'C', uv: 200, pv: 980 },
  ];


  const entities = [
    {
      name: " Neuro Tools Table",
      type: "table",
      id: "1"
    },
    {
      name: "Neuro-Indicator Trends for Proficiency - RMS (L) - Frontal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "2"
    },
    {
      name: "Neuro-Indicator Trends for Proficiency - RMS (L) - Occipital Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "3"
    },
    {
      name: "Neuro-Indicator Trends for Proficiency - RMS (L) - Parietal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "4"
    },
    {
      name: "Neuro-Indicator Trends for Proficiency - RMS (L) - Temporal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "5"
    },
    {
      name: " Neuro-Indicator Trends for Proficiency - RMS (R) - Frontal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "6"
    }, {
      name: "Neuro-Indicator Trends for Proficiency - RMS (R) - Occipital Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "7"
    }, {
      name: "Neuro-Indicator Trends for Proficiency - RMS (R) - Parietal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "8"
    }, {
      name: "Neuro-Indicator Trends for Proficiency - RMS (R) - Temporal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "9"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (L) - Frontal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "10"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (L) - Occipital Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "11"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (L) - Parietal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "12"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (L) - Temporal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "13"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (R) - Frontal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "14"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (R) - Occipital Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "15"
    }, {
      name: "Neuro-Indicator Trends for Growth - RMS (R) - Parietal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "16"
    }, {
      name: " Neuro-Indicator Trends for Growth - RMS (R) - Temporal Lobe vs. PP ID (Line Graphs below)",
      type: "chart",
      id: "17"
    },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState(entities[0]);
  const [selectedNeuroTools, setSelectedNeuroTools] = useState(1);
  const [showNeuroObject, setShowNeuroObject] = useState(false);
  
  const handlePlusClick = () => setShowNeuroObject(true);
  const handleCloseNeuroObject = () => setShowNeuroObject(false);
  const [selectedLobe, setSelectedLobe] = useState('');
  
  // Get the selected lobe object
  const selectedLobeData = lobeData.find(l => l.id.toString() === selectedLobe);
  

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

  const handleToggleImage = () => {
    if (!selectedLobe) return; // prevent opening without selection
    setShowLobeImage(prev => !prev);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!unitId || !candidateId) return;
  
      setLoading(true);
      try {
        const queryParams = {
          unitId,
          candidateId
        };
        
        // Add filter parameters if they exist and are valid
        if (filters?.ppIdFrom !== null && filters?.ppIdFrom !== undefined) {
          queryParams.ppIdFrom = filters.ppIdFrom;
        }
        if (filters?.ppIdTo !== null && filters?.ppIdTo !== undefined) {
          queryParams.ppIdTo = filters.ppIdTo;
        }
        if (filters?.criticalDateFrom) {
          queryParams.criticalRefDateFrom = filters.criticalDateFrom;
        }
        if (filters?.criticalDateTo) {
          queryParams.criticalRefDateTo = filters.criticalDateTo;
        }

        // Call the API with all parameters
        const apiResponse = await getNeuroObjectRMSValue(queryParams);

        if (!apiResponse?.data || apiResponse.data.length === 0) {
          setIndicatorsData([]);
          return;
        }
  
        const rows = [];
  
        apiResponse.data.forEach(pp => {
          const lobes = pp.lobes || {};
  
          rows.push({
            ppId: pp.ppId,
            target: "Proficiency",
            RMS1: lobes["Frontal Lobe - Left"]?.RMS?.toFixed(2) ?? "0",
            RMS2: lobes["Occipital Lobe - Left"]?.RMS?.toFixed(2) ?? "0",
            RMS3: lobes["Parietal Lobe - Left"]?.RMS?.toFixed(2) ?? "0",
            RMS4: lobes["Temporal Lobe - Left"]?.RMS?.toFixed(2) ?? "0",
            RMS5: lobes["Frontal Lobe - Right"]?.RMS?.toFixed(2) ?? "0",
            RMS6: lobes["Occipital Lobe - Right"]?.RMS?.toFixed(2) ?? "0",
            RMS7: lobes["Parietal Lobe - Right"]?.RMS?.toFixed(2) ?? "0",
            RMS8: lobes["Temporal Lobe - Right"]?.RMS?.toFixed(2) ?? "0",
          });
  
          rows.push({
            ppId: pp.ppId,
            target: "Growth",
            RMS1: lobes["Frontal Lobe - Left"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS2: lobes["Occipital Lobe - Left"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS3: lobes["Parietal Lobe - Left"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS4: lobes["Temporal Lobe - Left"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS5: lobes["Frontal Lobe - Right"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS6: lobes["Occipital Lobe - Right"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS7: lobes["Parietal Lobe - Right"]?.deltaRMS?.toFixed(2) ?? "0",
            RMS8: lobes["Temporal Lobe - Right"]?.deltaRMS?.toFixed(2) ?? "0",
          });
        });
  
        setIndicatorsData(rows);
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [unitId, candidateId, refreshKey, filters, onResetFilters]);

  
  useEffect(() => {
    if (!indicatorsData.length) return;
  
    const updated = indicatorsData.map(row => ({
      ...row,
      Cognitive1: computeRowCognitiveNS(indicatorsData, row, "RMS1"),
      Cognitive2: computeRowCognitiveNS(indicatorsData, row, "RMS2"),
      Cognitive3: computeRowCognitiveNS(indicatorsData, row, "RMS3"),
      Cognitive4: computeRowCognitiveNS(indicatorsData, row, "RMS4"),
      Cognitive5: computeRowCognitiveNS(indicatorsData, row, "RMS5"),
      Cognitive6: computeRowCognitiveNS(indicatorsData, row, "RMS6"),
      Cognitive7: computeRowCognitiveNS(indicatorsData, row, "RMS7"),
      Cognitive8: computeRowCognitiveNS(indicatorsData, row, "RMS8"),
    }));
  
    setIndicatorsData(updated);
  }, [indicatorsData.length]);


  const indicatorsWithLoads = useMemo(() => {
    if (!indicatorsData.length) return [];
  
    return indicatorsData.map(row => ({
      ...row,
      Cognitive1: computeRowCognitiveNS(indicatorsData, row, "RMS1"),
      Cognitive2: computeRowCognitiveNS(indicatorsData, row, "RMS2"),
      Cognitive3: computeRowCognitiveNS(indicatorsData, row, "RMS3"),
      Cognitive4: computeRowCognitiveNS(indicatorsData, row, "RMS4"),
      Cognitive5: computeRowCognitiveNS(indicatorsData, row, "RMS5"),
      Cognitive6: computeRowCognitiveNS(indicatorsData, row, "RMS6"),
      Cognitive7: computeRowCognitiveNS(indicatorsData, row, "RMS7"),
      Cognitive8: computeRowCognitiveNS(indicatorsData, row, "RMS8"),
    }));
  }, [indicatorsData]);
    

  const chartData = useMemo(() => {
    if (!selectedChart || selectedChart.type !== "chart") return [];
  
    const config = chartConfig[selectedChart.id];
    if (!config) return [];
  
    return indicatorsData
      .filter(row => row.target === config.target)
      .map(row => ({
        ppId: row.ppId,
        rmsValue: Number(row[config.rmsKey]) || 0,
      }))
      .sort((a, b) => a.ppId - b.ppId);
  }, [selectedChart, indicatorsData]);

  const lineDashMap = {
    solid: undefined,
    dashed: "6 4",
    dotted: "2 4",
    dashdot: "6 4 2 4",
  };

  
  const renderDot = (props) => {
    const { cx, cy, index } = props;
    if (!chartProperties.visibility) return null;
  
    // frequency control
    if (index % chartProperties.symbolFrequency !== 0) return null;
  
    const size = 4 * chartProperties.symbolScaleSize;
    const fill = chartProperties.symbolColor;
  
    switch (chartProperties.symbolStyle) {
      case "square":
        return (
          <rect
            x={cx - size}
            y={cy - size}
            width={size * 2}
            height={size * 2}
            fill={fill}
          />
        );
      case "triangle":
        return (
          <polygon
            points={`${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`}
            fill={fill}
          />
        );
      case "diamond":
        return (
          <polygon
            points={`${cx},${cy - size} ${cx - size},${cy} ${cx},${cy + size} ${cx + size},${cy}`}
            fill={fill}
          />
        );
      default: // circle
        return <circle cx={cx} cy={cy} r={size} fill={fill} />;
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
    chartData.forEach(row => {
      const dataRow = worksheet.getRow(currentRow);
      dataRow.values = [
        candidateId ?? "N/A",   // Candidate ID
        row.ppId,               // PP ID
        row.ppId,               // X-axis value
        Number(row.rmsValue).toFixed(3) // Y-axis value
      ];
      currentRow++;
    });
    

    // 7. Add summary section
    currentRow++;
    worksheet.getRow(currentRow).values = ['SUMMARY STATISTICS'];
    worksheet.getRow(currentRow).font = { bold: true };
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    currentRow++;

    // Calculate statistics
    const validData = chartData.map(row => row.rmsValue).filter(v => typeof v === "number" && !isNaN(v));

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
    // if (thresholdValue && thresholdValue[keyName] !== null && thresholdValue[keyName] !== undefined) {
    //   currentRow++;
    //   worksheet.getRow(currentRow).values = ['THRESHOLD INFORMATION'];
    //   worksheet.getRow(currentRow).font = { bold: true };
    //   worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    //   currentRow++;

    //   worksheet.getRow(currentRow++).values = ['Threshold Value:', thresholdValue[keyName]];
    //   worksheet.getRow(currentRow++).values = ['Threshold Enabled:', filters?.thresholdEnabled ? "Yes" : "No"];
    // }

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

  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center relative">
        <span className='pl-2 text-md'>Entity Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        {showNeuroObject && (
          <div className="absolute top-0 left-0 z-50 w-[500px] h-[400px] bg-white shadow-2xl border border-gray-200 rounded-md">
            <NeuroObject onClose={handleCloseNeuroObject} unitId={unitId} candidateId={candidateId} onSaved={refetchNeuroData} />
          </div>
        )}
      </h2>

      <div className="flex h-full w-full my-2">
        <div className={`${activeChart ? "w-6/12 " : "w-full"}  flex flex-col border-2 h-full border-gray-200 p-1`}>
          <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
            <h2 className="text-sm font-semibold">Tables & Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePlusClick} title="Add Neuro Object" className="text-red-600 hover:text-red-800 cursor-pointer">
                <Plus className="w-4 h-4 hover:text-blue-600" />
              </button>
              <button onClick={() => {
                  if (typeof onResetFilters === "function") {
                    onResetFilters(); // ✅ reset filters in parent
                  }
                  // setScoreAdd(true); 
                }} title="Create Reset" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <RefreshCw className="w-4 h-4 hover:text-green-600"  />
              </button>
              <button onClick={exportToExcelWithImage} title="Export Graph" className='text-red-600 hover:text-red-800 cursor-pointer'>
                <FolderOutput className="w-4 h-4 hover:text-blue-600" />
              </button>

            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className="h-1/2 flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1">
                {/* Fixed Header */}
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                  <div className="col-span-10 px-1 py-1 text-left">Entities</div>
                  <div className="col-span-2  py-1 text-left">ID</div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(100%-40px)]">
                  {/* 
                  {entities.map((chart) => (
                    <div
                      key={chart.id} // Use id instead of index
                      className="grid grid-cols-12 items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedChart(chart)}
                    >
                      {chart.type === "table" && <div className="col-span-9 text-xs text-gray-700 truncate">📑{chart.name}</div>}
                      {chart.type === "chart" && <div className="col-span-9 text-xs text-gray-700 truncate">📉{chart.name}</div>}
                      <div className="col-span-3 pl-3 text-xs text-gray-400">{chart.id}</div>
                    </div>
                  ))} */}
                  {entities.map((item, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-12 hover:bg-gray-200 cursor-pointer ${selectedChart.name === item.name ? "bg-gray-100" : ""}`}
                      onClick={() => {
                        setSelectedChart(item);
                        if (item.type === "chart") {
                          setActiveChart(true);
                          setActiveAdjustPropertieTab("Table");
                        } else {
                          setActiveChart(false);
                          setActiveAdjustPropertieTab("Neuro Tools Table");
                        }

                      }}
                    >
                      <div className="col-span-10 px-2 py-1 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {item.type === "table" && <div className="col-span-9 text-xs text-gray-700 truncate">📑 {item.name}</div>}
                          {item.type === "chart" && <div className="col-span-9 text-xs text-gray-700 truncate">📉 {item.name}</div>}
                        </div>
                      </div>
                      <div className="col-span-2 px-3 py-1 whitespace-nowrap text-sm">
                        {item.id}
                      </div>
                    </div>
                  ))}


                </div>
              </div>
            </div>


            <div className="h-1/2 flex flex-col border border-gray-200">


              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                {activeChart && (
                  <>
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
                  </>
                )}
                {!activeChart && (
                  <>

                    <button
                      className={`px-3 py-1 text-sm cursor-pointer ${activeAdjustPropertieTab === 'Indicators'
                        ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                        }`}
                      onClick={() => setActiveAdjustPropertieTab('Indicators')}
                    >
                      Indicators
                    </button>
                    <button
                      className={`px-3 py-1 text-sm cursor-pointer ${activeAdjustPropertieTab === 'Loads'
                        ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                        }`}
                      onClick={() => setActiveAdjustPropertieTab('Loads')}
                    >
                      Loads
                    </button>
                    <button
                      className={`px-3 py-1 text-sm  cursor-pointer ${activeAdjustPropertieTab === 'Neuro Tools Table'
                        ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-800 border-t border border-b-transparent border-gray-300 hover:bg-white"
                        }`}
                      onClick={() => setActiveAdjustPropertieTab('Neuro Tools Table')}
                    >
                      Anatomy
                    </button>
                  </>
                )}

              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full mb-7">
                {activeAdjustPropertieTab === 'Property editor' && (
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {activeAdjustPropertieTab === 'Table' && selectedChart?.type === "chart" && (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto pb-10">
                    <table className="table-auto w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2 text-center">PP ID</th>
                          <th className="border px-3 py-2 text-center">
                            {chartConfig[selectedChart.id]?.lobe}
                          </th>
                          <th className="border px-3 py-2 text-center">Target</th>
                        </tr>
                      </thead>

                      <tbody>
                        {chartData.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-4 text-gray-400">
                              No data available
                            </td>
                          </tr>
                        ) : (
                          chartData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border px-3 py-2 text-center">{row.ppId}</td>
                              <td className="border px-3 py-2 text-center">{row.rmsValue}</td>
                              <td className="border px-3 py-2 text-center">
                                {chartConfig[selectedChart.id]?.target}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}



                {activeAdjustPropertieTab === 'Neuro Tools Table' && (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
                    
                    {/* Simple Lobe Dropdown */}
                    {/* Lobe selector + ON/OFF toggle */}
                    <div className="mb-4 flex items-center gap-4">
                      <select
                        value={selectedLobe}
                        onChange={(e) => setSelectedLobe(e.target.value)}
                        className="w-full max-w-xs border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">Select a lobe</option>
                        {lobeData.map((lobe) => (
                          <option key={lobe.id} value={lobe.id}>
                            {lobe.name}
                          </option>
                        ))}
                      </select>

                      {/* ON / OFF toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-sm text-gray-600">Show</span>

                        <input
                          type="checkbox"
                          checked={showLobeImage}
                          onChange={handleToggleImage}
                          className="sr-only"
                        />

                        <div
                          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors
                            ${showLobeImage ? "bg-gray-500" : "bg-gray-300"}`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform
                              ${showLobeImage ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </div>

                        <span className="text-xs font-medium text-gray-700">
                          {showLobeImage ? "ON" : "OFF"}
                        </span>
                      </label>
                    </div>


                    {/* Image Display */}
                    {/* {showLobeImage && selectedLobeData && (
                      <div>
                        <div className="relative w-64 h-64 mx-auto">
                          <Image
                            src={selectedLobeData.image}
                            alt={selectedLobeData.name}
                            fill
                            style={{ objectFit: 'contain' }}
                            className="p-4"
                          />
                        </div>

                        <p className="text-center mt-2 text-gray-700 font-medium">
                          {selectedLobeData.name}
                        </p>
                      </div>
                    )} */}

                  </div>
                )}

                {activeAdjustPropertieTab === 'Indicators' && (

                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto pb-5">
                    <table className="table-auto w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">PP ID Callout</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Target</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Frontal Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Occipital Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Parietal Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Temporal Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Frontal Lobe ®</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Occipital Lobe ®</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Parietal Lobe ®</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">RMS - Temporal Lobe ®</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicatorsData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50">
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.ppId}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.target}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS1}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS2}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS3}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS4}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS5}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS6}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS7}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.RMS8}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}


                {activeAdjustPropertieTab === 'Loads' && (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
                    <table className="table-auto w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">PP ID Callout</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Target</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Frontal Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Occipital Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Parietal Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Temporal Lobe (L)</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Frontal Lobe ®</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Occipital Lobe ®</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Parietal Lobe ®</th>
                          <th className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">Cognitive Load - Temporal Lobe ®</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicatorsWithLoads.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50">
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.ppId}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.target}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive1}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive2}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive3}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive4}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive5}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive6}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive7}</td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">{row.Cognitive8}</td>
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

        {activeChart && (
          <div ref={chartContainerRef} className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200  bg-gray-100 ml-1" style={{ backgroundColor: chartProperties.shadeArea }}>

            <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">
              {selectedChart ? `📉 ${selectedChart.name}` : 'Select a plot'}
            </h2>

            <div className="h-full overflow-auto m-5">
            <ResponsiveContainer width="100%" height="95%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="ppId">
                    <Label value="PP ID" position="insideBottom" offset={-10} />
                  </XAxis>

                  <YAxis>
                    <Label
                      value="RMS Value"
                      angle={-90}
                      position="insideLeft"
                      offset={10}
                    />
                  </YAxis>

                  <Tooltip />
                  <Legend />

                  <Line
                    type="linear"
                    dataKey="rmsValue"
                    name={chartConfig[selectedChart.id]?.lobe}
                    stroke={chartProperties.lineColor}
                    strokeWidth={chartProperties.lineThickness}
                    strokeDasharray={lineDashMap[chartProperties.lineStyle]}
                    hide={!chartProperties.visibility}
                    dot={renderDot}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>
          </div>
        )}

      </div>

      {/* Image pop Up */}
      {showLobeImage && selectedLobeData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowLobeImage(false)}
        >
          {/* Modal content */}
          <div
            className="relative bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md
                      scale-100 animate-popup"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon */}
            <button
              onClick={() => setShowLobeImage(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-500 text-xl"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative w-64 h-64 mx-auto">
              <Image
                src={selectedLobeData.image}
                alt={selectedLobeData.name}
                fill
                className="object-contain"
              />
            </div>

            {/* Title */}
            <p className="text-center mt-3 text-lg font-semibold">
              {selectedLobeData.name}
            </p>
          </div>
        </div>
      )}


    </>
  );
}

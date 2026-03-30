'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Trash2, Copy, Search, X, RefreshCw, FolderOutput } from 'lucide-react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  Label,
  Pie,
  PieChart,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import PropertyEditor from '../../components/PropertyEditor';
import { createNeedAssessment, createUnitImprovement, deleteNeedAssessment, deleteUnitImprovement, getAssessmentChain, getAuxiliarydata, getCandidateMarks, getLeaderMarks, getNeedAssessment, getNeedAssessmentSummary, getUnitImprovement, updateNeedAssessment, updateUnitImprovement } from '@/services/auxiliaryService';
import { getUnitAndMultipleCandidateSummary } from '@/services/tabulationTableService';
import BenchmarkTable from './BenchmarkTable';
import BenchmarkTableUnitLevel from './BenchmarkTableUnitLevel';
import { getInsertScoreByUnitAndCandidate } from '@/services/insertScoreService';
import html2canvas from "html2canvas-pro";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import { div } from 'three/src/nodes/math/OperatorNode';

const ROSTER_SUM_KEYS = [
  "totalTally",
  "presentCount",
  "excusedAbsences",
  "unexcusedAbsences",
  "excusedTardies",
  "unexcusedTardies",
];

export default function PlotSelections({ selectedSort, unitId, candidateId, unitType, oncandidateFormOpen, onUnitImprovementFormOpen, onLeaderMarkFormOpen, onCreateChainFormOpen, refresh, refreshUnitImprovement, refreshLeaderMarks, refreshChainData, onChartSelect, 
  filters, onResetFilters, onAssessmentChainSelect, onActiveChainIdChange  }) {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChainId, setActiveChainId] = useState(null);
  const [showBenchmarkTable, setShowBenchmarkTable] = useState(false);
  const [showChainForm, setShowChainForm] = useState(false);
  const [showCandidateMarksForm, setShowCandidateMarksForm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [refreshBenchmarks, setRefreshBenchmarks] = useState(false);
  const [refreshBenchmarksUnitLevel, setRefreshBenchmarksUnitLevel] = useState(false);
  const [chainData, setChainData] = useState([]);
  const chartContainerRef = useRef(null);
  const [engageSummary, setEngageSummary] = useState(null);

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

// console.log("candidate id : ", candidateId);
  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');
  const [auxData, setAuxData] = useState([]);
  const [rosterData, setRosterData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [candidateMarks, setCandidateMarks] = useState([]);
  const [insertScores, setInsertScores] = useState([]);
  const [leaderMarks, setleaderMarks] = useState([]);
  const [needAssessment, setNeedAssessment] = useState([]);
  const [needAssessmentSummary, setNeedAssessmentSummary] = useState([]);
  const [unitImprovement, setUnitImprovement] = useState([]);
  const [rawRosterData, setRawRosterData] = useState([]);
  const [rosterSummary, setRosterSummary] = useState({});
  
  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: 'A', uv: 400, pv: 240 },
    { name: 'B', uv: 300, pv: 139 },
    { name: 'C', uv: 200, pv: 980 },
  ];

  const [selectedChart, setSelectedChart] = useState(null);

  const [editingObservations, setEditingObservations] = useState({});
  const activateCandidateLevel = [
    {
      name: "Needs Assessment Table",
      icon: "🟦",
      type: "table",
      key: "nat",
      id: 11
    },
    {
      name: "Needs Assessment Chains",
      icon: "🟦",
      type: "table",
      key: "nac",
      id: 12
    },
    {
      name: "Task Declarations",
      icon: "🟦",
      type: "table",
      id: 13
    },
    {
      name: "Candidate Marks",
      icon: "🟦",
      type: "table",
      id: 14
    },
    {
      name: "Butler Equivalency CSD - Accumulated Time (Days) vs. PP ID",
      icon: "🔵",
      type: "line",
      key: 'be-csd',
      id: 1
    },
   
    {
      name: "Butler Equivalency USD - Accumulated Time (Days) vs. PP ID",
      icon: "🔵",
      type: "line",
      key: 'be-usd',
      id: 4
    },
   
    {
      name: "Butler Productivity CSD - Productivity Rates vs. PP ID",
      icon: "🔵",
      type: "line",
      key: 'bp-csd',
      id: 7
    },
    {
      name: "Butler Productivity USD - Productivity Rates vs. PP ID",
      icon: "🔵",
      type: "line",
      key: 'bp-usd',
      id: 8
    },

    {
      name: "Attendance Tracking",
      icon: "🔵",
      type: "pie",
      key: 'at',
      id: 9
    },
    {
      name: "Engagement Tracking",
      icon: "🔵",
      type: "pie",
      key: 'et',
      id: 10
    },
    
  ];
  
  const activateUnitLevel = [
    {
      name: "Unit Improvements & Optimization",
      icon: "🟦",
      type: "table",
      id: 7
    },
    {
      name: "Leader Marks",
      icon: "🟦",
      type: "table",
      id: 8
    },
    {
      name: "Butler Productivity CSD - Productivity Rates vs. PP ID",
      icon: "🔵",
      type: "scatter-2d",
      key: 'bp-csd',
      id: 1
    },
    {
      name: "Butler Productivity USD - Productivity Rates vs. PP ID",
      icon: "🔵",
      type: "scatter-2d",
      key: 'bp-usd',
      id: 2
    },
    {
      name: "Attendance Tracking",
      icon: "🔵",
      type: "pie",
      key: 'at',
      id: 3
    },
    {
      name: "Engagement Tracking",
      icon: "🔵",
      type: "pie",
      key: 'et',
      id: 4
    },
    {
      name: "Unit Outcomes",
      icon: "🔵",
      type: "pie",
      key: 'uo',
      id: 5
    },
    {
      name: "Needs Assessment Tracking",
      icon: "🔵",
      type: "pie",
      key: 'nat',
      id: 6
    },
  
  ];
  
  const isGraph = selectedChart && selectedChart.type !== "table";

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

  // const handlePlusClick = () => {
  //   setShowChainForm(true);
  // };

  const handleCandidateMarkForm = () => {
    oncandidateFormOpen(true);  
  };

  const handleCreateChainForm = () => {
    onCreateChainFormOpen(true);  
  };

  const handleUnitImprovementsForm = () => {
    onUnitImprovementFormOpen(true);  // or whatever state your parent expects
  };

  const handleLeaderMarksForm = () => {
    onLeaderMarkFormOpen(true);  // or whatever state your parent expects
  };
  
  
  const aggregateRosterData = (roster = []) => {
    return roster.reduce((acc, row) => {
      ROSTER_SUM_KEYS.forEach((key) => {
        acc[key] = (acc[key] || 0) + (row[key] || 0);
      });
      return acc;
    }, {});
  };

  const isChart = selectedChart?.type !== "table";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!unitId || !candidateId || (Array.isArray(candidateId) && candidateId.length === 0)) return;
  
        // Convert candidateId to comma-separated string if it's an array
        const candidateParam = Array.isArray(candidateId) ? candidateId.join(",") : candidateId;
  
        const data = await getAuxiliarydata(unitId, candidateParam, filters);
        setAuxData(data.results || []);
        setRawRosterData(data.rosterData || []);
       
        setEngageSummary(data.engageLevelSummary || {
          High: 0,
          Medium: 0,
          Low: 0,
          "N/A": 0
        });

        console.log("fetched auxiliary data: ", data.engageLevelSummary);  
        const aggregatedRoster = aggregateRosterData(data.rosterData || []);
        setRosterData(aggregatedRoster);

      } catch (err) {
        console.error("Error fetching auxiliary data", err);
      }
    };
  
    fetchData();
  }, [unitId, candidateId, filters, onResetFilters]);
  

  const csdChartData = auxData.map(r => ({
    ppId: r.ppId,
    csdTenureDays: r.csdTenureDays,
    duration: r.duration
  }));
  
  const usdChartData = auxData.map(r => ({
    ppId: r.ppId,
    usdTenureDays: r.usdTenureDays,
    duration: r.duration
  }));
  
  const BpCsdChartData = auxData.map(r => ({
    ppId: r.ppId,
    productivityCsd: r.Productivity_CSD,
  }));
  const BpUsdChartData = auxData.map(r => ({
    ppId: r.ppId,
    productivityUsd: r.Productivity_USD,
  }));

  const engageTrackData = auxData.map(r => ({
    engageLevel: r.engageLevel,
  }));

  const attendanceTrackData = rosterData
  ? [{
      totalTally: rosterData.totalTally,
      PC: rosterData.presentCount,
      EA: rosterData.excusedAbsences,
      UA: rosterData.unexcusedAbsences,
      ET: rosterData.excusedTardies,
      UT: rosterData.unexcusedTardies,
    }]
  : [];


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
  
        const { results } = data;  
  
        const formattedData = results.map(row => ({
          assessmentId: row.assessmentId,
          ppId: row.ppId,
          criticalRefDate: row.criticalRefDate || '0',
          ΔRR: row.deltaRRN || 0,
          ΔPR: row.deltaPRN || 0,
          ΔAR: row.deltaARN || 0,
          RRN: row.RRN || 0,
          PRN: row.PRN || 0,
          ARN: row.ARN || 0,
          IC: row.IC || 0,
        }));
        
        setTableData(formattedData);

        // console.log("tabulation data: ", formattedData);
        
      } catch (err) {
        console.error("Failed to fetch tabulation data:", err);
        setError("Failed to load table data.");
        
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTabulationData();
  }, [unitId, candidateId, filters, onResetFilters]);

  useEffect(() => {
    const fetchChainData = async () => {
      if (!unitId || !candidateId) return;
  
      setLoading(true);
      try {
        const res = await getAssessmentChain(unitId, candidateId);
        setChainData(res?.results || []);
      } catch (err) {
        console.error("Error fetching assessment chain:", err);
        setChainData([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChainData();
  }, [unitId, candidateId, refreshChainData, refreshBenchmarks]);

  // console.log("chain data: ", chainData);

  useEffect(() => {
    const fetchNeedAssessment = async () => {
      if (!unitId || !candidateId) {
        setNeedAssessment([]); // clear previous table data
        return;
      }
  
      setLoading(true);
      setError(null);
      try {
        const result = await getNeedAssessment(unitId, candidateId);  
        setNeedAssessment(result.data);

      } catch (err) {
        console.error("Failed to  candidate marks data:", err);
        setError("Failed to load table data.");
        
        setNeedAssessment([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchNeedAssessment();
  }, [unitId, candidateId, refreshBenchmarks]);


  useEffect(() => {
    const fetchUnitImprovement = async () => {
      if (!unitId || !candidateId) {
        setUnitImprovement([]); // clear previous table data
        return;
      }
  
      setLoading(true);
      setError(null);
      try {
        const result = await getUnitImprovement(unitId, candidateId);  
        setUnitImprovement(
          result.data.map((row) => ({
            ...row,
            bIds: Array.isArray(row.bIds)
              ? row.bIds
              : JSON.parse(row.bIds || "[]"),
            benchmarkIds: Array.isArray(row.benchmarkIds)
              ? row.benchmarkIds
              : JSON.parse(row.benchmarkIds || "[]"),
          }))
        );
        
        // console.log("unit improvement data: ", result.data);
      } catch (err) {
        console.error("Failed to  candidate marks data:", err);
        setError("Failed to load table data.");
        
        setUnitImprovement([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUnitImprovement();
  }, [unitId, candidateId, refreshUnitImprovement, refreshBenchmarksUnitLevel]);

  // console.log("unit improvement: ", unitImprovement);

  useEffect(() => {
    const fetchCandidateMarks = async () => {
      if (!unitId || !candidateId) {
        setCandidateMarks([]); // clear previous table data
        return;
      }
  
      setLoading(true);
      setError(null);
      try {
        const result = await getCandidateMarks(unitId, candidateId);  
        
        setCandidateMarks(result.data);
        
      } catch (err) {
        console.error("Failed to  candidate marks data:", err);
        setError("Failed to load table data.");
        
        setCandidateMarks([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCandidateMarks();
  }, [unitId, candidateId, refresh]);

  useEffect(() => { 
    
    const fetchScoresWithAssessment = async () => { 
      if (!unitId || !candidateId) return; 
      
      setLoading(true); 
      setError(null); 
      
      try { 
        const data = await getInsertScoreByUnitAndCandidate(unitId, candidateId); 
        
        if (!Array.isArray(data)) throw new Error("Invalid insert score response"); 
        console.log("Fetched insert scores:", data); 
        setInsertScores(data); 
      } catch (err) { 
        console.error("Error fetching insert scores:", err); 
        setError("Failed to load insert scores."); 
      } finally { 
        setLoading(false); 
        
      } 
    };
    fetchScoresWithAssessment();
  }, [unitId, candidateId]);

  const insertScoreMap = useMemo(() => {
    if (!Array.isArray(insertScores)) return {};
  
    return insertScores.reduce((acc, score) => {
      const key = Number(score.ppId);
      if (!acc[key]) acc[key] = [];
  
      acc[key].push({
        subPpId: score.subPpId,
        taskDeclaration: score.remarks || "-",
        competency: score.competency || "-",
        attainedScore: Number(score.attainedScore) || 0,
        maxScore: Number(score.maxScore) || 0,
        workflowStage: score.workflowStage || "-",
        assessmentType: score.assessmentType || "-",
        scheduleImpact: score.scheduleImpact || "-"
      });
  
      return acc;
    }, {});
  }, [insertScores]);
  

  // Merge need assessments into tableData by PP ID
  const mergedTableData = tableData.map(row => {
    const matchedNeed = needAssessment.find(n => n.ppId === row.ppId);

    return {
      ...row,
      benchmarkIds: matchedNeed ? JSON.parse(matchedNeed.benchmarkIds) : [],
      bIds: matchedNeed ? JSON.parse(matchedNeed.bIds) : [],
      observation: matchedNeed ? matchedNeed.observation : ""
    };
  });


  const finalMergedTableData = mergedTableData.map(row => ({
    ...row,
    insertScores: insertScoreMap[row.ppId] || []
  }));

  const sortedFinalTableData = [...finalMergedTableData].sort((a, b) => {
    const aNeg = a.ppId < 0;
    const bNeg = b.ppId < 0;
  
    // Both negative → sort by absolute value ASC
    if (aNeg && bNeg) {
      return Math.abs(a.ppId) - Math.abs(b.ppId);
    }
  
    // Only A is negative → A comes first
    if (aNeg && !bNeg) return -1;
  
    // Only B is negative → B comes first
    if (!aNeg && bNeg) return 1;
  
    // Both positive → normal ascending
    return a.ppId - b.ppId;
  });
  
  console.log("final merged table data: ", finalMergedTableData);
  
  useEffect(() => {
    const fetchLeaderMarks = async () => {
      if (!unitId || !candidateId) {
        setleaderMarks([]); // clear previous table data
        return;
      }
  
      setLoading(true);
      setError(null);
      try {
        const result = await getLeaderMarks(unitId, candidateId);  
        
        setleaderMarks(result.data);
        
      } catch (err) {
        console.error("Failed to  candidate marks data:", err);
        setError("Failed to load table data.");
        
        setleaderMarks([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeaderMarks();
  }, [unitId, candidateId, refreshLeaderMarks]);


  useEffect(() => {
    const fetchNeedAssessmentSummary = async () => {
      if (!unitId || !candidateId) {
        setNeedAssessmentSummary([]);
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const result = await getNeedAssessmentSummary(unitId, candidateId);
        // console.log("need assessment summary result: ", result);
        const { statusCounts } = result;
  
        const pieData = [
          { name: "Open", value: statusCounts.Open || 0 },
          { name: "Pending", value: statusCounts.Pending || 0 },
          { name: "Closed", value: statusCounts.Closed || 0 }
        ];
  
        setNeedAssessmentSummary(pieData);
  
      } catch (err) {
        console.error("Failed to load need assessment summary:", err);
        setError("Failed to load table data.");
        setNeedAssessmentSummary([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchNeedAssessmentSummary();
  }, [unitId, candidateId]);
  
  
  useEffect(() => {
    if (Object.keys(editingObservations).length === 0 && needAssessment.length > 0) {
      const initialObservations = {};
      sortedFinalTableData.forEach(row => {
        const existing = needAssessment.find(n => n.ppId === row.ppId);
        initialObservations[row.ppId] = existing ? existing.observation : "";
      });
      setEditingObservations(initialObservations);
    }
  }, [needAssessment, sortedFinalTableData, editingObservations]);
  

  // console.log("need assesssment summary: ", needAssessmentSummary);

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


  const attendanceBreakdown = rosterData && rosterData.totalTally
  ? [
      { name: "Present", value: rosterData.presentCount },
      { name: "Excused Absences", value: rosterData.excusedAbsences },
      { name: "Unexcused Absences", value: rosterData.unexcusedAbsences },
      { name: "Excused Tardies", value: rosterData.excusedTardies },
      { name: "Unexcused Tardies", value: rosterData.unexcusedTardies },
    ]
  : [];


  const unitOutcomeData = rawRosterData.length > 0
  ? [
      { name: "Ongoing", value: rawRosterData.filter(x => x.unitOutcome === "Ongoing").length },
      { name: "Pass", value: rawRosterData.filter(x => x.unitOutcome === "Pass").length },
      { name: "Fail", value: rawRosterData.filter(x => x.unitOutcome === "Fail").length },
    ]
  : [];

  
  const engagementBreakdown = engageSummary
  ? [
      { name: "High", value: engageSummary.High || 0 },
      { name: "Medium", value: engageSummary.Medium || 0 },
      { name: "Low", value: engageSummary.Low || 0 },
      { name: "N/A", value: engageSummary["N/A"] || 0 },
    ]
  : [];

  
  const exportToExcelWithImage = async () => {
    if (!selectedChart || !chartContainerRef.current) {
      alert("Please select a chart first.");
      return;
    }
  
    try {
      const keyName = selectedChart.key;
      if (!keyName) {
        alert("Invalid chart selection.");
        return;
      }
  
      // 1. Prepare the chart container for capture
      const chartContainer = chartContainerRef.current;
      
      // Store original styles
      const originalOverflow = chartContainer.style.overflow;
      const originalHeight = chartContainer.style.height;
      const originalWidth = chartContainer.style.width;
      const originalPosition = chartContainer.style.position;
      
      // Temporarily adjust styles for full capture
      chartContainer.style.overflow = 'visible';
      chartContainer.style.height = 'auto';
      chartContainer.style.width = 'auto';
      chartContainer.style.position = 'absolute';
      
      // Force a reflow
      chartContainer.offsetHeight;
  
      // 2. Capture the chart as image
      const canvas = await html2canvas(chartContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: chartContainer.scrollWidth,
        windowHeight: chartContainer.scrollHeight,
        width: chartContainer.scrollWidth,
        height: chartContainer.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all content is visible in the clone
          const clonedContainer = clonedDoc.querySelector('[ref="chartContainerRef"]');
          if (clonedContainer) {
            clonedContainer.style.overflow = 'visible';
            clonedContainer.style.height = 'auto';
            clonedContainer.style.width = 'auto';
            
            // Make sure table cells are fully visible
            const tables = clonedContainer.querySelectorAll('table');
            tables.forEach(table => {
              table.style.width = 'auto';
              table.style.overflow = 'visible';
              table.style.borderCollapse = 'collapse';
              
              const cells = table.querySelectorAll('td, th');
              cells.forEach(cell => {
                cell.style.boxSizing = 'border-box';
                cell.style.whiteSpace = 'nowrap';
              });
            });
          }
        }
      });
  
      // Restore original styles
      chartContainer.style.overflow = originalOverflow;
      chartContainer.style.height = originalHeight;
      chartContainer.style.width = originalWidth;
      chartContainer.style.position = originalPosition;
  
      // Convert canvas to buffer
      const chartImageBuffer = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve(new Uint8Array(reader.result));
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      });
  
      // 3. Create workbook (rest of your existing code...)
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Chart Report');
  
      // Set column widths
      worksheet.columns = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
      ];
  
      // Add header section
      const headerRow = worksheet.addRow(['CHART DATA EXPORT']);
      headerRow.font = { size: 14, bold: true };
      headerRow.height = 30;
      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
      worksheet.addRow(['Chart Name:', selectedChart.name]);
      worksheet.addRow(['Key Name:', keyName]);
      worksheet.addRow(['Export Date:', new Date().toLocaleString()]);
      worksheet.addRow([]);
  
      // 4. Add the chart image
      const imageId = workbook.addImage({
        buffer: chartImageBuffer,
        extension: 'png',
      });
  
      // Insert image starting from row 6
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 5 },
        br: { col: 4, row: 25 },
      });
  
      // Add data points starting from row 27
      let currentRow = 27;
  
      // Rest of your existing export code...
      // ... [existing data export logic] ...
  
      // 5. Save the workbook
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `chart_report_${keyName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);
  
      console.log("✅ Excel file exported successfully:", fileName);
  
    } catch (error) {
      console.error("❌ Failed to export Excel with image:", error);
      alert("Failed to export Excel file. Please try again. Error: " + error.message);
    }
  };

  const exportTableToExcel = () => {
    if (!selectedChart || selectedChart.type !== "table") {
      alert("Please select a table to export.");
      return;
    }
  
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Table Data');
  
      // Get table data based on selected chart
      let data = [];
      let headers = [];
  
      switch (selectedChart.id) {
        case 11: // Needs Assessment Table
          headers = ['PP ID', 'Critical Ref Date', 'RRN', 'PRN', 'ARN', 'IC', 'BIDs', 'Observation', 'Status'];
          data = sortedFinalTableData.map(item => [
            item.ppId,
            item.criticalRefDate,
            item.RRN,
            item.PRN,
            item.ARN,
            item.IC,
            item.bIds?.join(', ') || '-',
            item.observation || '-',
            item.bIds.length === 0 ? "Open" : item.bIds.length === 5 ? "Closed" : "Pending"
          ]);
          break;
        
        case 14: // Candidate Marks
          headers = ['Entry', 'Impact Type', 'Concern Identified', 'Identity Date', 'Concern Resolved', 'Resolution Date'];
          data = candidateMarks.map(item => [
            item.entryNumber,
            item.impactType,
            item.concernIdentified,
            item.identityDate,
            item.concernResolved,
            item.resolutionDate
          ]);
          break;
        
        // Add cases for other table types...
      }
  
      // Add headers
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F4FF' }
      };
  
      // Add data
      data.forEach(row => worksheet.addRow(row));
  
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });
  
      // Generate filename and save
      const fileName = `table_${selectedChart.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        saveAs(blob, fileName);
      });
  
    } catch (error) {
      console.error("Error exporting table:", error);
      alert("Failed to export table. Error: " + error.message);
    }
  };

// Updated handleBenchmarkSelection function:
const handleBenchmarkSelection = async (selectedBenchmarkIds) => {
  setShowBenchmarkTable(false);
  
  if (!selectedRow) return;

  try {
    // Check if a need assessment already exists for this PP ID
    const existingNeed = needAssessment.find(n => n.ppId === selectedRow.ppId);
    
    // Get existing benchmark IDs
    const existingBIds = existingNeed ? JSON.parse(existingNeed.bIds) : [];
    const existingBenchmarkIds = existingNeed ? JSON.parse(existingNeed.benchmarkIds) : [];
    
    // Determine which benchmarks to KEEP (selected ones)
    const benchmarksToKeep = selectedBenchmarkIds;
    
    // Determine which benchmarks to REMOVE (were previously selected but now unchecked)
    const benchmarksToRemove = existingBIds.filter(id => !selectedBenchmarkIds.includes(id));
    
    // Final list: only keep the selected ones (this removes unchecked ones)
    const finalBIds = benchmarksToKeep;
    const finalBenchmarkIds = benchmarksToKeep;
    
    console.log("Previous IDs:", existingBIds);
    console.log("Selected IDs:", selectedBenchmarkIds);
    console.log("IDs to remove:", benchmarksToRemove);
    console.log("Final IDs:", finalBIds);
    
    // If NO benchmarks are selected AND there was no existing record, don't create empty record
    if (finalBIds.length === 0 && !existingNeed) {
      console.log("No benchmarks selected and no existing record - nothing to save");
      setRefreshBenchmarks(prev => !prev);
      return;
    }
    
    // If NO benchmarks are selected BUT there was an existing record, delete it
    if (finalBIds.length === 0 && existingNeed) {
      console.log("All benchmarks removed - deleting existing record");
      try {
        await deleteNeedAssessment(existingNeed.id);
        setRefreshBenchmarks(prev => !prev);
        return;
      } catch (deleteErr) {
        console.error("Failed to delete need assessment:", deleteErr);
        alert("Failed to remove all benchmarks. Please try again.");
        return;
      }
    }
    
    // Prepare the payload with only selected benchmarks
    const payload = {
      unitId,
      candidateId,
      ppId: selectedRow.ppId,
      bIds: finalBIds,
      benchmarkIds: finalBenchmarkIds,
      observation: selectedRow.observation !== "-" ? selectedRow.observation : ""
    };

    if (existingNeed) {
      // Update existing need assessment
      console.log("Updating existing need assessment:", existingNeed.id);
      await updateNeedAssessment(existingNeed.id, payload);
    } else {
      // Create new need assessment
      console.log("Creating new need assessment");
      await createNeedAssessment(payload);
    }
    
    // Trigger refresh to show updated data
    setRefreshBenchmarks(prev => !prev);
    
  } catch (err) {
    console.error("Failed to submit need assessment:", err);
    alert("Failed to save benchmark selection. Please try again.");
  }
};

const handleBenchmarkSelectionUnitLevel = async (selectedBenchmarkIds) => {
  setShowBenchmarkTable(false);

  if (!selectedRow) return;

  try {
    // selectedBenchmarkIds = [1,2,3]
    const selectedBIds = selectedBenchmarkIds; // ✅ same thing at unit level

    const existingBenchmarkIds = selectedRow.benchmarkIds || [];
    const existingBIds = selectedRow.bIds || [];

    // 🚫 No selection + no existing record → do nothing
    if (selectedBIds.length === 0 && !selectedRow.id) {
      setRefreshBenchmarksUnitLevel(prev => !prev);
      return;
    }

    // 🗑 No selection + existing record → DELETE
    if (selectedBIds.length === 0 && selectedRow.id) {
      await deleteUnitImprovement(selectedRow.id);
      setRefreshBenchmarksUnitLevel(prev => !prev);
      return;
    }

    const payload = {
      unitId,
      candidateId,
      benchmarkIds: selectedBenchmarkIds,
      bIds: selectedBIds
    };

    if (selectedRow.id) {
      // ✅ UPDATE
      await updateUnitImprovement(selectedRow.id, payload);
    } else {
      // ✅ CREATE
      await createUnitImprovement(payload);
    }

    // ✅ refresh list
    setRefreshBenchmarksUnitLevel(prev => !prev);

  } catch (error) {
    console.error("Failed to save unit improvement benchmarks:", error);
    alert("Failed to save benchmark selection");
  }
};

  
  const getTableConfig = () => {
  if (!selectedChart) return null;

  // ❌ Not applicable for table-type charts
  if (selectedChart.type === "table") return null;

  // ---------- LINE CHARTS ----------
  if (selectedChart.type === "line") {
    switch (selectedChart.key) {
      case "be-csd":
        return {
          columns: ["PP ID", "CSD Tenure Days", "Cumulative Duration"],
          rows: csdChartData.slice() // avoid mutating original array
          .sort((a, b) => Number(a.ppId) - Number(b.ppId)).map(r => ({
            ppId: r.ppId,
            a: Number(r.csdTenureDays).toFixed(2),	
            b: r.duration
          }))
        };

      case "be-usd":
        return {
          columns: ["PP ID", "USD Tenure Days", "Cumulative Duration"],
          rows: usdChartData.slice() // avoid mutating original array
          .sort((a, b) => Number(a.ppId) - Number(b.ppId)).map(r => ({
            ppId: r.ppId,
            a: Number(r.usdTenureDays).toFixed(2),
            b: r.duration
          }))
        };

      case "bp-csd":
        return {
          columns: ["PP ID", "Productivity CSD"],
          rows: BpCsdChartData.slice() // avoid mutating original array
          .sort((a, b) => Number(a.ppId) - Number(b.ppId)).map(r => ({
            ppId: r.ppId,
            a: Number(r.productivityCsd).toFixed(3),
          }))
        };

      case "bp-usd":
        return {
          columns: ["PP ID", "Productivity USD"],
          rows: BpUsdChartData.slice() // avoid mutating original array
          .sort((a, b) => Number(a.ppId) - Number(b.ppId)).map(r => ({
            ppId: r.ppId,
            a: Number(r.productivityUsd).toFixed(3),
          }))
        };

      default:
        return null;
    }
  }

  // ---------- SCATTER ----------
  if (selectedChart.type === "scatter-2d") {
    const data =
      selectedChart.key === "bp-csd" ? BpCsdChartData : BpUsdChartData;

    return {
      columns: ["PP ID", "Value"],
      rows: data.map(r => ({
        ppId: r.ppId,
        a:
          selectedChart.key === "bp-csd"
            ? r.productivityCsd
            : r.productivityUsd
      }))
    };
  }

  // ---------- PIE ----------
  if (selectedChart.type === "pie") {
    const dataMap = {
      at: attendanceBreakdown,
      et: engagementBreakdown,
      uo: unitOutcomeData,
      nat: needAssessmentSummary
    };

    const data = dataMap[selectedChart.key] || [];

    return {
      columns: ["Category", "Count"],
      rows: data.map(r => ({
        name: r.name,
        a: r.value
      }))
    };
  }

  return null;
};

  
  // console.log("attendance tracking: ", attendanceBreakdown);
  
  const getActionStatus = (bIds = [], observation = "") => {
    const hasBids = Array.isArray(bIds) && bIds.length > 0;
    const hasObservation = observation && observation.trim() !== "";
  
    if (!hasBids && !hasObservation) return "Open";
    if (hasBids && hasObservation) return "Closed";
    return "Pending";
  };
  
  const headers = {
    RRN: "Receptive Ratio",
    PRN: "Productive Ratio",
    ARN: "Acuity Ratio",
    IC: "Interaction Class",
    "Linked BIDs": "Linked Benchmarks",
    BIDs: "Benchmark IDs",
  };
  const renderChartContent = () => {
    
    if (!selectedChart) {
      return (
        <div className="flex justify-center text-gray-400 text-lg my-3">
              {/* SELECT PLOT or TABLE */}
        </div>
      );
    }

    const hasCandidateData = auxData.length > 0 && candidateId && (!Array.isArray(candidateId) || candidateId.length > 0);

    if (
      selectedSort === "activateUnitLevel" &&
      (!candidateId || (Array.isArray(candidateId) && candidateId.length === 0))
    ) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 uppercase">Select a candidate to view</p>
        </div>
      );
    }
  
    // Check if there's no data for unit-level tables
    const hasTableData11 = selectedChart.id === 11 && sortedFinalTableData.length > 0;
    const hasTableData8 = selectedChart.id === 8 && leaderMarks.length > 0;
    const hasTableData7 = selectedChart.id === 7 && unitImprovement.length > 0;
    const hasTableData12 = selectedChart.id === 12 && chainData.length > 0;
    const hasTableData13 = selectedChart.id === 13 && sortedFinalTableData.length > 0;
    const hasTableData14 = selectedChart.id === 14 && candidateMarks.length > 0;

    // Check if there's no data for pie charts
    const hasPieDataAT = attendanceBreakdown.length > 0 && attendanceBreakdown.some(item => item.value > 0);
    const hasPieDataET = engagementBreakdown.length > 0 && engagementBreakdown.some(item => item.value > 0);
    const hasPieDataUO = unitOutcomeData.length > 0 && unitOutcomeData.some(item => item.value > 0);
    const hasPieDataNAT = needAssessmentSummary.length > 0 && needAssessmentSummary.some(item => item.value > 0);

    if (selectedChart.type === "table" && selectedChart.id === 11) {

      if (!hasTableData11) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 uppercase">NO DATA AVAILABLE</p>
          </div>
        );
      }
    
      // Tooltip component using fixed positioning — escapes ALL overflow clipping
      const TooltipTh = ({ label, tooltipText }) => {
        const [pos, setPos] = useState(null);
    
        return (
          <th
            className="border border-gray-300 px-2 py-1 text-center cursor-default select-none bg-gray-100"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setPos({ x: rect.left + rect.width / 2, y: rect.top });
            }}
            onMouseLeave={() => setPos(null)}
          >
            <span className="">{label}</span>
            {pos && ReactDOM.createPortal(
              <div
                className="px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap shadow-md"
                style={{
                  position: 'fixed',
                  top: pos.y - 36,
                  left: pos.x,
                  transform: 'translateX(-50%)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                {tooltipText}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderWidth: '4px',
                  borderStyle: 'solid',
                  borderColor: '#111827 transparent transparent transparent',
                }} />
              </div>,
              document.body
            )}
          </th>
        );
      };
    
      return (
        <>
          {showBenchmarkTable && (
            <BenchmarkTable
              onClose={(selectedBenchmarks) => {
                handleBenchmarkSelection(selectedBenchmarks);
                setRefreshBenchmarks(prev => !prev);
              }}
              selectedBenchmarks={selectedRow?.bIds || []}
            />
          )}
    
          <div className="text-xs text-gray-700 mt-2 w-full overflow-x-auto rounded-md bg-white mb-10">
            <table className="table-auto w-full border border-gray-300">
              <thead className="whitespace-nowrap bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-center bg-gray-100">PP ID</th>
                  <th className="border border-gray-300 px-2 py-1 text-center bg-gray-100">Critical Reference Date</th>
                  <TooltipTh label="RRN"        tooltipText={headers["RRN"]} />
                  <TooltipTh label="PRN"        tooltipText={headers["PRN"]} />
                  {unitType === "Third Parameter" && (
                    <TooltipTh label="ARN"      tooltipText={headers["ARN"]} />
                  )}
                  <TooltipTh label="IC"         tooltipText={headers["IC"]} />
                  <TooltipTh label="Linked BIDs" tooltipText={headers["Linked BIDs"]} />
                  <TooltipTh label="BIDs"       tooltipText={headers["BIDs"]} />
                  <th className="border border-gray-300 px-2 py-1 text-center bg-gray-100">Observations & Goals</th>
                  <th className="border border-gray-300 px-2 py-1 text-center bg-gray-100">Action Status</th>
                </tr>
              </thead>
    
              <tbody>
                {sortedFinalTableData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-center">{item.ppId}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {item.criticalRefDate ? item.criticalRefDate.split("T")[0] : "-"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{Number(item.RRN).toFixed(3)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{Number(item.PRN).toFixed(3)}</td>
                    {unitType === "Third Parameter" && (
                      <td className="border border-gray-300 px-2 py-1 text-center">{Number(item.ARN).toFixed(3)}</td>
                    )}
                    <td className="border border-gray-300 px-2 py-1 text-center">{item.IC}</td>
    
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => { setSelectedRow(item); setShowBenchmarkTable(true); }}
                      >
                        {item.bIds.length > 0 ? 'EDIT' : 'ADD'}
                      </button>
                    </td>
    
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {item.bIds.length > 0 ? item.bIds.join(", ") : "-"}
                    </td>
    
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <input
                        type="text"
                        value={editingObservations[item.ppId] || ""}
                        onChange={(e) => setEditingObservations(prev => ({ ...prev, [item.ppId]: e.target.value }))}
                        onBlur={async (e) => {
                          const newObservation = e.target.value.trim();
                          try {
                            const existingNeed = needAssessment.find(n => n.ppId === item.ppId);
                            if (!existingNeed && newObservation === "") return;
                            const payload = {
                              unitId, candidateId, ppId: item.ppId,
                              bIds: existingNeed ? JSON.parse(existingNeed.bIds) : [],
                              benchmarkIds: existingNeed ? JSON.parse(existingNeed.benchmarkIds) : [],
                              observation: newObservation
                            };
                            if (existingNeed) await updateNeedAssessment(existingNeed.id, payload);
                            else await createNeedAssessment(payload);
                            setRefreshBenchmarks(prev => !prev);
                          } catch (error) {
                            console.error("Observation save failed:", error);
                            alert("Failed to save observation");
                          }
                        }}
                        className="py-1 px-2 border border-gray-300 rounded w-full"
                      />
                    </td>
    
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {getActionStatus(item.bIds, editingObservations[item.ppId])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    if (selectedChart.type === "table" && selectedChart.id === 8) {

      if (!hasTableData8) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 uppercase">No data available</p>
          </div>
        );
      }

      return (
        <>
          <div className="text-xs text-gray-700 mt-2 w-full overflow-x-auto pr-2">
            <table className="table-auto w-full border border-gray-300">
              <thead className="whitespace-nowrap text-center border border-black px-2 py-1 group relative bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-1  text-center">Entry</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Leader Last Name</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Leader First Name</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Impact Type</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Concern Identified</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Identity Date</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Concern Resolved </th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Resolution Date </th>
                  
                </tr>
              </thead>
      
              <tbody>
                {leaderMarks.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.entryNumber}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.staffFirstName}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.staffLastName}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.impactType}</td>         
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.concernIdentified}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.identityDate}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.concernResolved}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.resolutionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    else if (selectedChart.type === "table" && selectedChart.id === 7) {

      if (!hasTableData7) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 uppercase">No data available</p>
          </div>
        );
      }

      return (
        <>
          {showBenchmarkTable && (
            <BenchmarkTableUnitLevel
              onClose={(selectedBenchmarks) => {
                handleBenchmarkSelectionUnitLevel(selectedBenchmarks);
                setRefreshBenchmarksUnitLevel(prev => !prev);
              }}
              selectedBenchmarks={selectedRow?.bIds || []}
            />
          )}

          <div className="text-xs text-gray-700 mt-2 w-full overflow-x-auto pr-2 rounded-md bg-white shadow-sm">
            <table className="table-auto w-full border border-gray-300">
              <thead className="whitespace-nowrap text-center border border-black px-2 py-1 group relative bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-1  text-center">Entry</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Lesson Learned & Improvements</th>
                  <th className="border border-gray-300 px-2 py-1  text-center">Linked BIDs</th>
                  <th className="border border-gray-300 px-2 py-1  text-center"> BIDs</th>
                </tr>
              </thead>
      
              <tbody>
                {unitImprovement.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1  text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-2 py-1  text-center">{item.lesson}</td>
      
                    {/* ADD button */}
                    <td className="border border-gray-300 px-2 py-1  text-center">
                      <button className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => {
                          setSelectedRow(item);
                          setShowBenchmarkTable(true);
                          }
                        } >
                        + ADD
                      </button>
                    </td>
                    <td className="border border-gray-300 px-2 py-1  text-center">
                      {item.benchmarkIds.length > 0 ? item.benchmarkIds.join(", ") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    else if (selectedChart.type === "table" && selectedChart.id === 12) {
      if (!hasTableData12) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 uppercase">No data available</p>
          </div>
        );
      }
      return (
        <div className="text-xs text-gray-600 mt-2 w-full pr-2 space-y-6">
    
          {chainData.map((chain, chainIndex) => {
            const isActive = activeChainId === chain.chainId;
            return (
              <div
                key={chain.chainId}
                className={`border border-gray-300 rounded-md shadow-sm ${
                  isActive ? "bg-gray-100" : "bg-white"
                }`}
                onClick={() => {
                  onChartSelect("nac"); // already exists
                  onAssessmentChainSelect(chain.chainId); // 
                  setActiveChainId(chain.chainId);
                  onActiveChainIdChange(chainIndex + 1);
                }}
              >
      
                {/* 🔹 Chain Header */}
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
                  <div className="font-semibold text-gray-800">
                    Assessment Chain {chainIndex + 1}
                  </div>
                  {/* <div className="text-xs text-gray-600">
                    Unit ID: {chain.unitId} &nbsp;|&nbsp; Candidate ID: {chain.candidateId}
                  </div> */}
                </div>
      
                {/* 🔹 Chain Tables */}
                <div className="space-y-4 p-4">
                  {chain.selections.map((sel, idx) => (
                    <div key={idx} className="w-full overflow-x-auto">
                      <table className="table-auto w-full text-xs border border-gray-300">
                        <tbody>
      
                          {/* Row 1 — PP ID */}
                          <tr className="hover:bg-gray-50">
                            <td className="whitespace-nowrap font-medium border  border-gray-300 px-2 py-1  w-1/2">
                              PP ID
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-2 py-1 ">
                              {sel.ppId}
                            </td>
                          </tr>
      
                          {/* Row 2 — RRN, PRN, ARN */}
                          <tr className="hover:bg-gray-50">
                            <td className="whitespace-nowrap font-medium border border-gray-300 px-2 py-1  ">
                              RRN, PRN{sel.ARN !== null && `, ARN`}
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-2 py-1 ">
                              {[
                                sel.RRN !== null && `RRN: ${sel.RRN}`,
                                sel.PRN !== null && `PRN: ${sel.PRN}`,
                                sel.ARN !== null && `ARN: ${sel.ARN}`,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </td>
                          </tr>
      
                          {/* Row 3 — Benchmark IDs */}
                          <tr className="hover:bg-gray-50">
                            <td className="whitespace-nowrap font-medium border  border-gray-300 px-2 py-1 ">
                              Benchmark IDs
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-2 py-1 ">
                              {sel.benchmarkIds?.length
                                ? sel.benchmarkIds.join(", ")
                                : "—"}
                            </td>
                          </tr>
      
                          {/* Row 4 — Action Status */}
                          <tr className="hover:bg-gray-50">
                            <td className="whitespace-nowrap font-medium border border-gray-300 px-2 py-1 ">
                              Action Status
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-2 py-1  font-semibold text-gray-800">
                              {sel.actionStatus}
                            </td>
                          </tr>
      
                          {/* Row 5 — Critical Ref Date */}
                          <tr className="hover:bg-gray-50">
                            <td className="whitespace-nowrap font-medium border border-gray-300 px-2 py-1 ">
                              Critical Ref Date
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-2 py-1 ">
                              {sel.criticalRefDate
                                ? new Date(sel.criticalRefDate).toLocaleDateString()
                                : "—"}
                            </td>
                          </tr>
      
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
      
              </div>
            )}
          )}
    
        </div>
      );
    }

    else if (selectedChart.type === "table" && selectedChart.id === 13) {

      if (!hasTableData13) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 uppercase">No data available</p>
          </div>
        );
      }

      const computeActionStatus = (benchmarkIds = [], observation = "") => {
        if (benchmarkIds.length > 0 && observation) return "Closed";
        if (
          (benchmarkIds.length > 0 && !observation) ||
          (benchmarkIds.length === 0 && observation)
        ) return "Pending";
        return "Open"; 
      };

      
      return (
        <div className="text-xs text-gray-600 mt-2 w-full pr-2 space-y-8">
    
          {sortedFinalTableData.map((sel, idx) => (
            <div
              key={`${sel.ppId}-${idx}`}
              className="border border-gray-300 rounded-md bg-white shadow-sm p-4 space-y-6"
            >
    
              {/* ===================== */}
              {/* TABLE 1 — PP SUMMARY */}
              {/* ===================== */}
              <table className="table-auto w-full text-xs border border-gray-300">
                <tbody>
    
                  <tr>
                    <td className="font-medium border px-2 py-1  w-1/2">PP ID</td>
                    <td className="border px-2 py-1 ">{sel.ppId}</td>
                  </tr>
    
                  <tr>
                    <td className="font-medium border px-2 py-1 ">RRN, PRN{unitType === 'Third Parameter' && `, ARN`}</td>
                    <td className="border px-2 py-1 ">
                      {[ 
                        sel.RRN != null && `RRN: ${sel.RRN}`,
                        sel.PRN != null && `PRN: ${sel.PRN}`,
                        unitType === 'Third Parameter' && sel.ARN != null && `ARN: ${sel.ARN}`
                      ].filter(Boolean).join(", ")}
                    </td>
                  </tr>
    
                  <tr>
                    <td className="font-medium border px-2 py-1 ">Benchmark IDs</td>
                    <td className="border px-2 py-1 ">
                      {sel.benchmarkIds?.length
                        ? sel.benchmarkIds.join(", ")
                        : "—"}
                    </td>
                  </tr>
    
                  <tr>
                    <td className="font-medium border px-2 py-1 ">Action Status</td>
                    <td className="border px-2 py-1  font-semibold">
                      {computeActionStatus(sel.benchmarkIds, sel.observation)}
                    </td>
                  </tr>
    
                  <tr>
                    <td className="font-medium border px-2 py-1 ">Critical Ref Date</td>
                    <td className="border px-2 py-1 ">
                      {sel.criticalRefDate
                        ? new Date(sel.criticalRefDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
    
                </tbody>
              </table>
    
              {/* ============================= */}
              {/* TABLE 2 — INSERT SCORE DETAIL */}
              {/* ============================= */}
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-xs border border-gray-300">
                  <thead className="whitespace-nowrap text-center border border-black px-2 py-1 group relative bg-gray-50">
                    <tr>
                      <th className="border px-2 py-1 text-center">Task Declaration</th>
                      <th className="border px-2 py-1 text-center">Competency</th>
                      <th className="border px-2 py-1 text-center">Attained Score</th>
                      <th className="border px-2 py-1 text-center">Maximum Score</th>
                      <th className="border px-2 py-1 text-center">Workflow Stage</th>
                      <th className="border px-2 py-1 text-center">Assessment Type</th>
                      <th className="border px-2 py-1 text-center">Schedule Impact</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    {sel.insertScores.length ? (
                      sel.insertScores.map((s, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border px-2 py-1 text-center">{s.taskDeclaration}</td>
                          <td className="border px-2 py-1 text-center">{s.competency}</td>
                          <td className="border px-2 py-1 text-center">{Number(s.attainedScore).toFixed(2)}</td>
                          <td className="border px-2 py-1 text-center">{Number(s.maxScore).toFixed(2)}</td>
                          <td className="border px-2 py-1 text-center">{s.workflowStage}</td>
                          <td className="border px-2 py-1 text-center">{s.assessmentType}</td>
                          <td className="border px-2 py-1 text-center">{s.scheduleImpact}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-3">
                          No insert score records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
    
            </div>
          ))}
    
        </div>
      );
    }    
    
    else if (selectedChart.type === "table" && selectedChart.id === 14) {

      if (!hasTableData14) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 uppercase">No data available</p>
          </div>
        );
      }
      return (
        <div className="text-xs text-gray-600 mt-2 w-full overflow-x-auto  bg-white shadow-sm">
          <table className="table-auto w-full text-xs border border-gray-300">
            <thead className="whitespace-nowrap text-center border border-black px-2 py-1 group relative bg-gray-50">
              <tr>
                <th className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">Entry</th>
                <th className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">Impact Type</th>
                <th className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">Concern Identified</th>
                <th className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">Identity Date</th>
                <th className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">Concern Resolved</th>
                <th className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">Resolution Date</th>
              </tr>
            </thead>
            <tbody>
              {candidateMarks.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">{row.entryNumber}</td>
                  <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">{row.impactType}</td>
                  <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">{row.concernIdentified}</td>
                  <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">{row.identityDate}</td>
                  <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">{row.concernResolved}</td>
                  <td className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 ">{row.resolutionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } 
    else if (selectedChart.type === "table") {
      
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 uppercase">No data available for this table</p>
        </div>
    
      );
    } 
    
    else {

      if (selectedSort === 'activateCandidateLevel' && selectedChart.key === 'be-csd') {
        if (!hasCandidateData) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for CSD Tenure Days chart</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={csdChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ppId" label={{ value: "PP ID", position: "insideBottom", offset: -10 }} textAnchor='middle' />
              <YAxis label={{ value: "Days", angle: -90, position: "insideLeft", dy: 5 }} dx={-15} textAnchor='middle' />
              <Tooltip />
              <Legend verticalAlign="bottom"  align="center"
                              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
              <Line type="linear" dataKey="csdTenureDays" name="CSD Tenure Days" stroke="#3b82f6" dot />
              <Line type="linear" dataKey="duration" name="Cumulative Duration" stroke="#10b981" dot />
            </LineChart>
          </ResponsiveContainer>
        );
      }
    
      // Multi-line chart for USD
      if (selectedSort === 'activateCandidateLevel' && selectedChart.key === 'be-usd') {
        if (!hasCandidateData) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for USD Tenure Days chart</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={usdChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ppId" label={{ value: "PP ID", position: "insideBottom", offset: -10 }} textAnchor='middle' />
              <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} dy={0} dx={-15} textAnchor='middle' />
              <Tooltip />
              <Legend verticalAlign="bottom"  align="center"
                              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
              <Line type="linear" dataKey="usdTenureDays" name="USD Tenure Days" stroke="#10b981" dot />
              <Line type="linear" dataKey="duration" name="Cumulative Duration" stroke="#ef4444" dot />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      if (selectedSort === 'activateCandidateLevel' && selectedChart.key === "bp-csd") {
        if (!hasCandidateData) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Productivity CSD chart</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={BpCsdChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ppId" label={{ value: "PP ID", position: "insideBottom", offset: -10 }} textAnchor='middle' />
              <YAxis label={{ value: "Productivity CSD", angle: -90, position: "center", dx: -30 }} dy={0} dx={-13} textAnchor='middle' />
              <Tooltip />
              <Legend verticalAlign="bottom"  align="center"
                              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
              <Line 
                type="linear" 
                dataKey="productivityCsd" 
                name="Productivity CSD" 
                stroke="#10b981"
                dot 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      

      if (selectedSort === 'activateCandidateLevel' && selectedChart.key === "bp-usd") {
        if (!hasCandidateData) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Productivity USD chart</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={BpUsdChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ppId" label={{ value: "PP ID", position: "insideBottom", offset: -10 }} textAnchor='middle' />
              <YAxis label={{ value: "Productivity USD", angle: -90, position: "center", dx: -30  }}
               dy={0} dx={-19} textAnchor='middle' />
              <Tooltip />
              <Legend verticalAlign="bottom"  align="center"
                              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
              <Line 
                type="linear" 
                dataKey="productivityUsd" 
                name="Productivity USD" 
                stroke="#10b981"
                dot 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      if (selectedChart.key === 'at' ) {
        if (!attendanceBreakdown || attendanceBreakdown.length === 0) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Attendance Breakdown chart</p>
            </div>
          );
        }

        if (!hasPieDataAT) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Attendance Breakdown chart</p>
            </div>
          );
        }

        const total = attendanceBreakdown.reduce((sum, item) => sum + item.value, 0);
  
        // Create data with both count and percentage
        const attendanceDataWithPercentage = attendanceBreakdown.map(item => ({
          ...item,
          percentage: total > 0 ? Number((item.value / total).toFixed(3)) : 0,
          percentageValue: total > 0 ? (item.value / total) : 0
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={attendanceDataWithPercentage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value, percentage }) => {
                  const percentDisplay = (percentage).toFixed(3);
                  return `${name}: ${percentDisplay} Count: ${value}`;
                }}
                labelLine={true}
              >
                {attendanceDataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={["#3b82f6","#f59e0b","#10b981","#f43f5e","#8b5cf6"][index % 5]} 
                  />
                ))}

              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  const percentage = props?.payload?.percentage;
                  const percentDisplay = percentage ? (percentage).toFixed(3) : "0.000";
                  return [`${percentDisplay} Count: ${value}`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      

      if (selectedChart.key === 'et' && engagementBreakdown.length > 0) {
        if (!hasPieDataET) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Engagement Breakdown chart</p>
            </div>
          );
        }

        const total = engagementBreakdown.reduce((sum, item) => sum + item.value, 0);
  
        // Create data with both count and percentage
        const engageDataWithPercentage = engagementBreakdown.map(item => ({
          ...item,
          percentage: total > 0 ? Number((item.value / total).toFixed(3)) : 0,
          percentageValue: total > 0 ? (item.value / total) : 0
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
            <Pie
                data={engageDataWithPercentage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value, percentage }) => {
                  const percentDisplay = (percentage).toFixed(3);
                  return `${name}: ${percentDisplay} Count: ${value}`;
                }}
                labelLine={true}
              >
                {engageDataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={["#3b82f6","#f59e0b","#10b981","#f43f5e","#8b5cf6"][index % 5]} 
                  />
                ))}

              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  const percentage = props?.payload?.percentage;
                  const percentDisplay = percentage ? (percentage).toFixed(3) : "0.000";
                  return [`${percentDisplay} Count: ${value}`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      if (selectedChart.key === 'uo' && unitOutcomeData.length > 0) {

        if (!hasPieDataUO) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Unit Outcome chart</p>
            </div>
          );
        }

        const total = unitOutcomeData.reduce((sum, item) => sum + item.value, 0);
  
        // Create data with both count and percentage
        const unitOutcomeDataWithPercentage = unitOutcomeData.map(item => ({
          ...item,
          percentage: total > 0 ? Number((item.value / total).toFixed(3)) : 0,
          percentageValue: total > 0 ? (item.value / total) : 0
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={unitOutcomeDataWithPercentage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value, percentage }) => {
                  const percentDisplay = (percentage).toFixed(3);
                  return `${name}: ${percentDisplay} Count: ${value}`;
                }}
                labelLine={true}
              >
                {unitOutcomeDataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={["#3b82f6","#f59e0b","#10b981","#f43f5e","#8b5cf6"][index % 5]} 
                  />
                ))}

              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  const percentage = props?.payload?.percentage;
                  const percentDisplay = percentage ? (percentage).toFixed(3) : "0.000";
                  return [`${percentDisplay} Count: ${value}`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      if (selectedChart.key === 'nat' && needAssessmentSummary.length > 0) {

        if (!hasPieDataNAT) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for Need Assessment Summary chart</p>
            </div>
          );
        }

        const total = needAssessmentSummary.reduce((sum, item) => sum + item.value, 0);
  
        // Create data with both count and percentage
        const needAssessmentDataWithPercentage = needAssessmentSummary.map(item => ({
          ...item,
          percentage: total > 0 ? Number((item.value / total).toFixed(3)) : 0,
          percentageValue: total > 0 ? (item.value / total) : 0
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
            <Pie
                data={needAssessmentDataWithPercentage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value, percentage }) => {
                  const percentDisplay = (percentage).toFixed(3);
                  return `${name}: ${percentDisplay} Count: ${value}`;
                }}
                labelLine={true}
              >
                {needAssessmentDataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={["#3b82f6","#f59e0b","#10b981","#f43f5e","#8b5cf6"][index % 5]} 
                  />
                ))}

              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  const percentage = props?.payload?.percentage;
                  const percentDisplay = percentage ? (percentage).toFixed(3) : "0.000";
                  return [`${percentDisplay} Count: ${value}`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      
      // Update your scatter chart rendering logic:
      if (selectedSort === 'activateUnitLevel' && (selectedChart.key === "bp-csd" || selectedChart.key === "bp-usd")) {
        
        if (!hasCandidateData) {
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 uppercase">No data available for scatter chart</p>
            </div>
          );
        }
        
        const scatterData = selectedChart.key === "bp-csd" ? BpCsdChartData : BpUsdChartData;
        const yLabel = selectedChart.key === "bp-csd" ? "Productivity CSD" : "Productivity USD";
        const lineColor = selectedChart.key === "bp-csd" ? "#10b981" : "#10b981";
        const dataKey = selectedChart.key === "bp-csd" ? "productivityCsd" : "productivityUsd";

        // Sort data by ppId to ensure proper ordering
        const sortedData = [...scatterData].sort((a, b) => a.ppId - b.ppId);
        
        // Use unique ppId values for x-axis
        const uniquePpIds = [...new Set(sortedData.map(item => item.ppId))];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ppId" 
                label={{ value: "PP ID", position: "insideBottom", offset: -5 }}
                type="number"
                domain={['dataMin', 'dataMax']}
                allowDuplicatedCategory={false}
                textAnchor='middle'
              />
              <YAxis 
                label={{
                  value: yLabel,
                  angle: -90,
                  position: 'insideLeft',
                  textAnchor: 'middle'
                }}
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => value.toFixed(1)}
                tickMargin={10}
                offset={-10}
                textAnchor='middle'
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name, props) => [
                  value, 
                  `${name}: ${value}`,
                  `PP ID: ${props.payload.ppId}`
                ]}
              />
              <Legend verticalAlign="bottom"  align="center"
                              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
              <Scatter 
                name={yLabel} 
                data={sortedData} 
                fill={lineColor}
                dataKey={dataKey}
                
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      }      
      
    
      // Default fallback chart
      return (
        <ResponsiveContainer width="100%" height="95%">
          <LineChart data={floatChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name">
              <Label value="Time Period (X)" offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis>
              <Label value="Score / Value (Y/Z)" angle={-90} position="insideLeft" dy={0} />
            </YAxis>
            <Tooltip />
            <Legend verticalAlign="bottom"  align="center"
                              wrapperStyle={{ paddingTop: 20, paddingLeft: 50 }} />
            <Line type="monotone" dataKey="xValue" name="X Axis Value" stroke="#3b82f6" strokeWidth={2} dot />
            <Line type="monotone" dataKey="yValue" name="Y Axis Value" stroke="#10b981" strokeWidth={2} dot />
            <Line type="monotone" dataKey="zValue" name="Z Axis Value" stroke="#f59e0b" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };


  const isDayColumn = (colName = "") =>
    /day|days|duration|tenure/i.test(colName);
  
  const formatCellValue = (value, colName) => {
    if (value === null || value === undefined) return "—";
  
    // Only format day-based numeric columns
    if (isDayColumn(colName) && !isNaN(value)) {
      return Number(value).toFixed(2);
    }
  
    return value;
  };
  
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
      
      const fullWidth = container.scrollWidth;
      const fullHeight = container.scrollHeight;

      container.style.height = container.scrollHeight + 'px';
      container.style.overflow = 'visible';


      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(container, {
        scale: 2,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
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

      const fullWidth = container.scrollWidth;
      const fullHeight = container.scrollHeight;

      container.style.height = container.scrollHeight + 'px';
      container.style.overflow = 'visible';


      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(container, {
        scale: 2,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
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

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className='pl-2 text-md'>Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2">
        <div className='w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200  p-1'>
            <div className="flex items-center justify-between px-1 mx-1 text-gray-700">
              <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              
              { selectedChart?.id === 14 &&  (
                <button 
                  onClick={handleCandidateMarkForm}
                  title="Add Chain"
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4 hover:text-blue-600" />
                </button>
              )}

              { selectedChart?.id === 12 &&  (
                <button 
                  onClick={handleCreateChainForm}
                  title="Add Chain"
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4 hover:text-blue-600" />
                </button>
              )}

              {/* ADD THIS NEW BUTTON */}
              {( selectedSort === 'activateUnitLevel' && selectedChart?.id === 7) && (
                <button
                  onClick={handleUnitImprovementsForm}
                  title="Add Unit Improvement"
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* ADD THIS NEW BUTTON */}
              { (selectedSort === 'activateUnitLevel' && selectedChart?.id) === 8 && (
                <button
                  onClick={handleLeaderMarksForm}
                  title="Add Unit Improvement"
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <button onClick={() => setShowCreateMaterial(true)} title="Create Material" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <RefreshCw className="w-4 h-4 hover:text-blue-800" onClick={() => {
                    if (typeof onResetFilters === "function") {
                      onResetFilters(); // ✅ reset filters in parent
                    }
                  }}  />
              </button>
              
              {isGraph && (
  
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="Export Graph"
                  className="text-blue-600 hover:text-blue-800 cursor-pointer pt-2"
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
              )}
              
            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className="h-[40%] flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1">
                {/* Fixed Header */}
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                 
                  <div className="col-span-9 px-1 py-1 text-left">Entities</div>
                  
                  <div className="col-span-2  py-1 text-left">ID</div>
                </div>
                
                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(100%-40px)]">
                  {selectedSort === 'activateCandidateLevel' ? (
                    activateCandidateLevel.map((chart, index) => (
                      <div
                        key={chart.id} // Use id instead of index
                        className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer  ${selectedChart?.name === chart.name ? "bg-gray-200" : "hover:bg-gray-200"} `}
                        onClick={() => {
                          setSelectedChart(chart);
                          onChartSelect?.(chart.key); 
                        }}
                      >
                        <div className="col-span-9 text-xs text-gray-700 truncate">{chart.icon} {chart.name}</div>
                        <div className="col-span-2 pl-3 text-xs text-gray-400">{index +1}</div>
                      </div>
                    ))
                  ) : selectedSort === 'activateUnitLevel' ? (
                    activateUnitLevel.map((chart, index) => (
                      <div
                        key={chart.id} // Use id instead of index
                        className={`grid grid-cols-12 items-center gap-2 px-2 py-1 cursor-pointer  ${selectedChart?.name === chart.name ? "bg-gray-200" : "hover:bg-gray-200"} `}
                        onClick={() => setSelectedChart(chart)}
                      >
                        <div className="col-span-9 text-xs text-gray-700 truncate">{chart.icon} {chart.name}</div>
                        <div className="col-span-2 pl-3 text-xs text-gray-400">{index + 1}</div>
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
                  className={`px-3 py-1 text-sm  cursor-pointer ${activeAdjustPropertieTab === 'Property editor'
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
                {activeAdjustPropertieTab === 'Property editor' && isGraph && !(selectedChart.type === "pie") &&  (
                  
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {activeAdjustPropertieTab === "Table" && (() => {
                  const tableConfig = getTableConfig();
                  if (!tableConfig) return null;

                  if (selectedSort === 'activateUnitLevel') return (
                    <div className='text-center text-sm text-gray-400 py-4 italic'>NOT AVAILABLE AT UNIT LEVEL</div>
                  );

                  if (selectedChart.type === "pie") return (
                    <div className='text-center text-sm text-gray-400 py-4 italic'>NOT AVAILABLE FOR SELECTED CHART </div>
                  );

                  return (
                    <div className="text-xs text-gray-600 w-full overflow-x-auto mb-15">
                      <h3 className="text-gray-600 font-semibold mb-2 ml-2">Positive PP IDs</h3>
                      <table className="table-auto w-full text-xs border border-gray-300">
                        <thead className="whitespace-nowrap text-center border border-black px-2 py-1 group relative bg-gray-50">
                          <tr>
                            {tableConfig.columns.map(col => (
                              <th
                                key={col}
                                className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 "
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableConfig.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50">
                              {Object.values(row).map((cell, i) => (
                                <td
                                  key={i}
                                  className="whitespace-nowrap text-center border border-gray-300 px-2 py-1 "
                                >
                                  {cell ?? "—"}
                                </td>
                              ))}
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

        <div ref={chartContainerRef} className={`w-6/12 lg:w-8/12 flex flex-col border-2 h-full border-gray-200  bg-gray-100 ml-1`} style={{ backgroundColor: chartProperties.shadeArea }}>

          {selectedChart ? (
            <h2 className="text-lg text-center font-semibold text-gray-700 my-3">
              {selectedChart.icon} {selectedChart.name}
            </h2>
          ) : (
            <div className="flex justify-center text-gray-400 text-lg mt-2">
              SELECT PLOT OR TABLE 
            </div>
          )}

          <div
            className={`h-full overflow-y-auto overflow-x-auto mb-16 p-3 ${
              isChart ? "flex items-center justify-center" : ""
            }`}
          >
            <div className={`${isChart ? "w-full max-w-5xl" : "min-w-max"}`}>
              {renderChartContent()}
            </div>
          </div>

        </div>
      </div>

    </>
  );
}

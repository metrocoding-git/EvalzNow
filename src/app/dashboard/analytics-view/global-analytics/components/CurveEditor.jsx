'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X } from 'lucide-react';
import ScoringCriteria from './ScoringCriteria';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { getAllGLobalAnalyticsData, getICValue, getProductivityValue, getSTAPAndSTAGStableCount, getUnitSuccessRatesByThreshold } from '@/services/globalAnalyticsService';

const assignedWeights = [
  0.500, 1.000, 0.250, 0.250,
  0.500, 0.500, 1.000, 1.000,
  0.500, 0.000, 0.000, 0.500,
  1.000, 0.000, 0.500, 1.000,
  1.000, 0.000, 0.000, 0.500,
  0.500, 1.000, 1.000, 1.000,
  1.000, 0.000, 0.500,
  1.000, 1.000, 1.000, 1.000,
  0.000, 0.000, 0.000, 0.250,
  0.500, 0.750, 1.000,
  1.000, 1.000, 1.000, 1.000,
  1.000, 1.000, 1.000, 1.000,
  0.000, 0.500, 1.000
];

function mainFunction(F6, assignedWeights) {
  let totalAssignedWeight = 0;
  let totalMetricWeight = 0;
  const arrayData = [];

  const length = Math.min(F6.length, assignedWeights.length);

  for (let i = 0; i < length; i++) {
    const metricValue = Number(F6[i]) || 0;
    const assignedWeight = Number(assignedWeights[i]) || 0;
    const metricWeight = metricValue * assignedWeight;

    arrayData.push({
      f6: metricValue.toFixed(3),
      g6: assignedWeight.toFixed(3),
      h6: metricWeight.toFixed(3),
    });

    totalAssignedWeight += assignedWeight;
    totalMetricWeight += metricWeight;
  }

  const weightedIndex =
    totalAssignedWeight > 0
      ? totalMetricWeight / totalAssignedWeight
      : 0;

  let rating = "Unknown value";

  if (weightedIndex < 0.0903) rating = "Negligent";
  else if (weightedIndex < 0.1075) rating = "Underperforming";
  else if (weightedIndex < 0.1246) rating = "Below Average";
  else if (weightedIndex < 0.6734) rating = "Average";
  else if (weightedIndex < 0.6906) rating = "Above Average";
  else rating = "Overperforming";

  return [
    rating,
    weightedIndex,
    { H6: arrayData },
    Number(totalAssignedWeight.toFixed(3)),
    Number(totalMetricWeight.toFixed(3)),
  ];
}


export default function CurveEditor() {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [thresholdAnalytics, setThresholdAnalytics] = useState(null);
  const [StableData, setStableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [icDistributionData, setIcDistributionData] = useState(null);
  const [ScoreAdd, setScoreAdd] = useState(false);
  const [ProductivityData, setProductivityData] = useState(null);

  const floatChartData = [
    { name: "Jan", xValue: 1.2, yValue: 2.1, zValue: 0.9 },
    { name: "Feb", xValue: 2.8, yValue: 1.4, zValue: 1.6 },
    { name: "Mar", xValue: 1.5, yValue: 2.9, zValue: 2.2 },
    { name: "Apr", xValue: 3.1, yValue: 3.0, zValue: 2.7 },
    { name: "May", xValue: 2.0, yValue: 1.8, zValue: 3.1 },
    { name: "Jun", xValue: 2.6, yValue: 2.2, zValue: 3.4 },
  ];

  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('IndirectPerformancePoint');
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');

  const [activeClientId, setActiveClientId] = useState(null);
  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: "Completed", value: 400 },
    { name: "In Progress", value: 300 },
    { name: "Pending", value: 200 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const chart = [
    { id: 35, name: "Shared Global Analytics Index Table", icon: "🟦", type: "table" },
    { id: 1, name: "Global Signature Case Profile Percentages", icon: "🔵", type: "pie" },
    { id: 2, name: "Global Unit Type Percentages", icon: "🔵", type: "pie" },
    { id: 3, name: "Global Candidate-to-Leader Percentages", icon: "🔵", type: "pie" },
    { id: 4, name: "Global Benchmark Count Percentages", icon: "🔵", type: "pie" },
    { id: 5, name: "Global Assessment Block Count Percentages", icon: "🔵", type: "pie" },
    { id: 6, name: "Global Attendance Percentages", icon: "🔵", type: "pie" },
    { id: 7, name: "Global Open Action Item Percentages", icon: "🔵", type: "pie" },
    { id: 8, name: "Global Percentage of Positive Candidate Marks", icon: "🔵", type: "pie" },
    { id: 9, name: "Global Percentage of Positive Leader Marks", icon: "🔵", type: "pie" },
    { id: 10, name: "Global Unit Outcome Passing Percentages", icon: "🔵", type: "pie" },
    { id: 11, name: "Global Percentages of Average Equivalent Proficiency - XEP", icon: "🔵", type: "pie" },
    { id: 12, name: "Global Percentages of Average Unilateral Proficiency - XRR", icon: "🔵", type: "pie" },
    { id: 13, name: "Global Percentages of Average Unilateral Proficiency - XLR", icon: "🔵", type: "pie" },
    { id: 14, name: "Global Percentages of Average Unilateral Proficiency - XWR", icon: "🔵", type: "pie" },
    { id: 15, name: "Global Percentages of Average Unilateral Proficiency - XSR", icon: "🔵", type: "pie" },
    { id: 16, name: "Global Percentages of Average Unilateral Proficiency - XTR", icon: "🔵", type: "pie" },
    { id: 17, name: "Global Percentages of Average Unilateral Proficiency - XPR", icon: "🔵", type: "pie" },
    { id: 18, name: "Global Percentages of Average Unilateral Proficiency - XRVSR", icon: "🔵", type: "pie" },
    { id: 19, name: "Global Percentages of Average Unilateral Proficiency - XPVSR", icon: "🔵", type: "pie" },
    { id: 20, name: "Global Percentages of Average Unilateral Proficiency - XAVSR", icon: "🔵", type: "pie" },
    { id: 21, name: "Global Percentages of Average Composite Proficiency - XCP", icon: "🔵", type: "pie" },
    { id: 22, name: "Global Percentages of Average Band Proficiency - XBP", icon: "🔵", type: "pie" },
    { id: 23, name: "Global Percentages of Stability in Proficiency - STA/P", icon: "🔵", type: "pie" },
    { id: 24, name: "Global Percentages of Average Butler Interaction Proficiency - MSIP", icon: "🔵", type: "pie" },
    { id: 25, name: "Global Percentages of Average Interaction Class - IC", icon: "🔵", type: "pie" },
    { id: 26, name: "Global Percentages of Equivalent Growth - GEQ", icon: "🔵", type: "pie" },
    { id: 27, name: "Global Percentages of Average Growth - ∆RR", icon: "🔵", type: "pie" },
    { id: 28, name: "Global Percentages of Average Growth - ∆PR", icon: "🔵", type: "pie" },
    { id: 29, name: "Global Percentages of Average Growth - ∆AR", icon: "🔵", type: "pie" },
    { id: 30, name: "Global Percentages of Cumulative Growth - ∆RR", icon: "🔵", type: "pie" },
    { id: 31, name: "Global Percentages of Cumulative Growth - ∆PR", icon: "🔵", type: "pie" },
    { id: 32, name: "Global Percentages of Cumulative Growth - ∆AR", icon: "🔵", type: "pie" },
    { id: 33, name: "Global Percentages of Stability in Growth - STA/G", icon: "🔵", type: "pie" },
    { id: 34, name: "Global Percentages of Utilization Rates", icon: "🔵", type: "pie" },
   
  ];
  

  const [selectedChart, setSelectedChart] = useState(chart[0]);

  const [selectedRow, setSelectedRow] = useState(null);

  const percent = (value, total) =>
    total ? Number((value / total).toFixed(4)) : null;
  
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClientId = sessionStorage.getItem("activeClientId");
      setActiveClientId(storedClientId);
    }
  }, []);

  if (!visible) return null;

  // useEffect(() => {
  //   if (!icDistributionData) return;
  
  //   // Build table rows for IC classes 0-5
  //   const icRows = Object.entries(icDistributionData.icDistribution).map(
  //     ([icClass, value]) => ({
  //       metricDescription: `Interaction Class ${icClass}`,
  //       metricValue: Number(value.toFixed(3)), // 0-1
  //       assignedWeight: "", 
  //       metricWeight: ""
  //     })
  //   );
  
  //   // Add IC rows to tableData
  //   setTableData(prev => [...prev, ...icRows]);
  // }, [icDistributionData]);

  const buildICPieData = () => {
    if (!icDistributionData) return [];
  
    return Object.entries(icDistributionData.icDistribution).map(([icClass, value]) => ({
      name: `IC ${icClass}`,
      value: Number((value * 100).toFixed(2)) // Pie expects 0-100%
    }));
  };

  useEffect(() => {
    if (!activeClientId) return;
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [globalRes, thresholdRes, stableData, icData, productivityData] = await Promise.all([
          getAllGLobalAnalyticsData(activeClientId),        
          getUnitSuccessRatesByThreshold(activeClientId),
          getSTAPAndSTAGStableCount(activeClientId),
          getICValue(activeClientId),
          getProductivityValue(activeClientId)
        ]);
        
        setGlobalAnalytics(globalRes);
        setThresholdAnalytics(thresholdRes);
        setStableData(stableData);
        setIcDistributionData(icData);
        setProductivityData(productivityData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAnalytics();
  }, [activeClientId]);

  const toPercentagePie = (rate) => {
    if (rate === null || rate === undefined) return [];
  
    const value = Number((rate * 100).toFixed(2));
  
    return [
      { name: "Achieved", value },
      { name: "Remaining", value: 100 - value }
    ];
  };
  
  
  const buildSTAPPieData = () => {
    if (!StableData?.totalByCandidate) return [];
  
    return StableData.totalByCandidate
      .filter(c => c.totalStableSTAPCount > 0)
      .map(c => ({
        name: `Candidate ${c.candidateId}`,
        value: c.totalStableSTAPCount
      }));
  };
  
  const buildSTAGPieData = () => {
    if (!StableData?.totalByCandidate) return [];
  
    return StableData.totalByCandidate
      .filter(c => c.totalStableSTAGCount > 0)
      .map(c => ({
        name: `Candidate ${c.candidateId}`,
        value: c.totalStableSTAGCount
      }));
  };
  
  const buildProductivityPieData = () => {
    if (!ProductivityData?.distribution) return [];
  
    return [
      {
        name: "UR < 0.300",
        value: Number((ProductivityData.distribution.low * 100).toFixed(2)),
      },
      {
        name: "0.300 ≤ UR ≤ 0.600",
        value: Number((ProductivityData.distribution.mid * 100).toFixed(2)),
      },
      {
        name: "UR > 0.600",
        value: Number((ProductivityData.distribution.high * 100).toFixed(2)),
      },
    ];
  };
  
  const buildPieData = () => {
    if (!selectedChart || !globalAnalytics || !thresholdAnalytics) return [];
  
    const regular = thresholdAnalytics?.summary?.regularMetrics;
    const avgDelta = thresholdAnalytics?.summary?.averageDeltaMetrics;
    const sumDelta = thresholdAnalytics?.summary?.cumulativeSumDeltaMetrics;
  
    switch (selectedChart.id) {
      // ================= GLOBAL ANALYTICS =================
      case 1:
        return Object.entries(globalAnalytics.signatureProfiles || {})
          .map(([name, value]) => ({ name, value }));
  
      case 2:
        return Object.entries(globalAnalytics.unitTypes || {})
          .map(([name, value]) => ({ name, value }));
  
      case 3:
        return buildCandidateStaffRatioPie();
          
      case 4:
        return Object.entries(globalAnalytics.benchmarkCounts || {})
          .map(([name, value]) => ({ name, value }));
  
      case 5:
        return Object.entries(globalAnalytics.assessmentBlocks || {})
          .map(([name, value]) => ({ name, value }));
  
      case 6:
        return Object.entries(globalAnalytics.attendance || {})
          .map(([name, value]) => ({ name, value }));
      
      case 7: {
        const total = globalAnalytics.needAssessments?.total ?? 0;
        const open = globalAnalytics.needAssessments?.open ?? 0;
        const closed = total - open;
      
        if (total === 0) return [];
      
        return [
          { name: "Open", value: open },
          { name: "Pending/Closed", value: closed },
        ];
      }    
      
      case 8: { 
        const rate = globalAnalytics.candidateMarks?.impactScore;
        return toPercentagePie(rate);
      }
      
      case 9: { 
        const rate = globalAnalytics.leaderMarks?.impactScore;
        return toPercentagePie(rate);
      }
          
      case 10:
        return Object.entries(globalAnalytics.unitOutcomes || {})
          .map(([name, value]) => ({ name, value }));
  
      // ================= REGULAR METRICS (100%) =================
      case 11: return toPercentagePie(regular?.XEP?.successRate);
      case 12: return toPercentagePie(regular?.XRR?.successRate);
      case 13: return toPercentagePie(regular?.XLR?.successRate);
      case 14: return toPercentagePie(regular?.XWR?.successRate);
      case 15: return toPercentagePie(regular?.XSR?.successRate);
      case 16: return toPercentagePie(regular?.XTR?.successRate);
      case 17: return toPercentagePie(regular?.XPR?.successRate);
      case 18: return toPercentagePie(regular?.XRVSR?.successRate);
      case 19: return toPercentagePie(regular?.XPVSR?.successRate);
      case 20: return toPercentagePie(regular?.XAVSR?.successRate);
      case 21: return toPercentagePie(regular?.XCP?.successRate);
      case 22: return toPercentagePie(regular?.XBP?.successRate);
      case 24: return toPercentagePie(regular?.MSIP?.successRate);
      case 25: return buildICPieData();
      case 26: return toPercentagePie(regular?.GEQ?.successRate);
  
      // ================= AVERAGE DELTA =================
      case 27: return toPercentagePie(avgDelta?.avgDeltaRRN?.successRate);
      case 28: return toPercentagePie(avgDelta?.avgDeltaPRN?.successRate);
      case 29: return toPercentagePie(avgDelta?.avgDeltaARN?.successRate);
  
      // ================= CUMULATIVE DELTA =================
      case 30: return toPercentagePie(sumDelta?.sumDeltaRRN?.successRate);
      case 31: return toPercentagePie(sumDelta?.sumDeltaPRN?.successRate);
      case 32: return toPercentagePie(sumDelta?.sumDeltaARN?.successRate);
  
      // ================= STABILITY =================
      // case 33: return toPercentagePie(sumDelta?.sumDeltaRRN?.successRate);

      case 23: // STA/P
        return buildSTAPPieData();

      case 33: // STA/G
        return buildSTAGPieData();
       
      case 34:
        return buildProductivityPieData();

      default:
        return [];
    }
  };
  
  
  const totalStabilityOpportunities = () => {
    if (!StableData?.unitWiseData?.length) return null;
  
    return StableData.unitWiseData.reduce(
      (sum, unit) => sum + (unit.candidates?.length ?? 0),
      0
    );
  };
  
  const metricRows = [
    "Global Percentage of Case 1 Profiles",
    "Global Percentage of Case 2 Profiles",
    "Global Percentage of Case 3a Profiles",
    "Global Percentage of Case 3b Profiles",
    "Global Percentage of CI/CO",
    "Global Percentage of T&P",
    "Global Percentage of Third Parameter",
    "Global Percentage of Units with Candidate-to-Leader Ratio, CTL ≤ 20",
    "Global Percentage of Units with Candidate-to-Leader Ratio, 20 < CTL ≤ 30",
    "Global Percentage of Units with Candidate-to-Leader Ratio, CTL > 30",
    "Global Percentage of Benchmark Counts, BC ≤ 10",
    "Global Percentage of Benchmark Counts, 10 < BC ≤ 25",
    "Global Percentage of Benchmark Counts, BC > 25",
    "Global Percentage of Assessment Blocks, AB ≤ 8",
    "Global Percentage of Assessment Blocks, 8 < AB ≤ 20",
    "Global Percentage of Assessment Blocks, AB > 20",
    "Global Percentage of Attendance - Present",
    "Global Percentage of Attendance - Excused Absences",
    "Global Percentage of Attendance - Unexcused Absences",
    "Global Percentage of Attendance - Excused Tardies",
    "Global Percentage of Attendance - Unexcused Tardies",
    "Global Percentage Open Items for All Courses",
    "Global Percentage of Positive Candidate Marks",
    "Global Percentage of Positive Leader Marks",
    "Global Percentage of Passing Candidates",
    "Global Percentage of Failed Candidates",
    "Global Percentage of Ongoing Candidates",
    "Global Percentage of Average Passed Equivalent Proficiency - XEP",
    "Global Percentage of Average Passed Composite Proficiency - XCP",
    "Global Percentage of Average Passed Band Proficiency - XBP",
    "Global Percentages of Stable Proficiency - STA/P",
    "Global Percentage of Average Passed Butler Interaction Proficiency - MSIP",
    "Global Percentage of Average Interaction Class 0",
    "Global Percentage of Average Interaction Class 1",
    "Global Percentage of Average Interaction Class 2",
    "Global Percentage of Average Interaction Class 3",
    "Global Percentage of Average Interaction Class 4",
    "Global Percentage of Average Interaction Class 5",
    "Global Percentage of Average Passed Equivalent Growth - ∆GEQ",
    "Global Percentage of Passed Average Growth - ∆RR",
    "Global Percentage of Passed Average Growth - ∆PR",
    "Global Percentage of Passed Average Growth - ∆AR",
    "Global Percentage of Passed Cumulative Growth - ∆RR",
    "Global Percentage of Passed Cumulative Growth - ∆PR",
    "Global Percentage of Passed Cumulative Growth - ∆AR",
    "Global Percentages of Stable Growth - STA/G",
    "Global Percentage of Productivity Rates, UR < 0.300",
    "Global Percentage of Productivity Rates, 0.300 ≤ UR ≤ 0.600",
    "Global Percentage of Productivity Rates, UR > 0.600",
  ];

  const stableSTAPRate = () => {
    if (!StableData?.totalByCandidate) return null;
  
    const totalStable = StableData.totalByCandidate.reduce(
      (sum, c) => sum + (c.totalStableSTAPCount ?? 0),
      0
    );
  
    const totalPossible = totalStabilityOpportunities();
    if (!totalPossible) return null;
  
    return Number((totalStable / totalPossible).toFixed(4));
  };
  
  
  const stableSTAGRate = () => {
    if (!StableData?.totalByCandidate) return null;
  
    const totalStable = StableData.totalByCandidate.reduce(
      (sum, c) => sum + (c.totalStableSTAGCount ?? 0),
      0
    );
  
    const totalPossible = totalStabilityOpportunities();
    if (!totalPossible) return null;
  
    return Number((totalStable / totalPossible).toFixed(4));
  };
  
  
  const buildCandidateStaffRatioPie = () => {
    if (!globalAnalytics?.candidateStaffRatio || !globalAnalytics?.totalUnits)
      return [];
  
    const total = globalAnalytics.totalUnits;
  
    return Object.entries(globalAnalytics.candidateStaffRatio).map(
      ([name, count]) => ({
        name,
        value: Number(((count / total) * 100).toFixed(2)), // pie expects %
      })
    );
  };
  
  const totalOutcomeCount = (g) =>
    (g.unitOutcomes?.pass ?? 0) +
    (g.unitOutcomes?.fail ?? 0) +
    (g.unitOutcomes?.ongoing ?? 0);
    
  
  const totalAttendanceCount = (g) =>
    (g.attendance?.present ?? 0) +
    (g.attendance?.excusedAbsences ?? 0) +
    (g.attendance?.unexcusedAbsences ?? 0) +
    (g.attendance?.excusedTardies ?? 0) +
    (g.attendance?.unexcusedTardies ?? 0);
    
  
  const metricValueResolvers = {
    // ===== Signature Profiles =====
    "Global Percentage of Case 1 Profiles": (g) =>
      percent(g.signatureProfiles?.["Case 1: Solid Balanced"], g.totalUnits),
  
    "Global Percentage of Case 2 Profiles": (g) =>
      percent(g.signatureProfiles?.["Case 2: Rigorous Balanced"], g.totalUnits),
  
    "Global Percentage of Case 3a Profiles": (g) =>
      percent(g.signatureProfiles?.["Case 3a: Productive-Weighted"], g.totalUnits),
  
    "Global Percentage of Case 3b Profiles": (g) =>
      percent(g.signatureProfiles?.["Case 3b: Receptive-Weighed"], g.totalUnits),
  
    // ===== Unit Types =====
    "Global Percentage of CI/CO": (g) =>
      percent(g.unitTypes?.["Communicative I/O"], g.totalUnits),
  
    "Global Percentage of T&P": (g) =>
      percent(g.unitTypes?.["Theory & Practice"], g.totalUnits),
  
    "Global Percentage of Third Parameter": (g) =>
      percent(g.unitTypes?.["Third Parameter"], g.totalUnits),
  
    // ===== Candidate-to-Leader Ratio =====
    "Global Percentage of Units with Candidate-to-Leader Ratio, CTL ≤ 20": (g) =>
      percent(g.candidateStaffRatio?.["≤ 20"], g.totalUnits),

    "Global Percentage of Units with Candidate-to-Leader Ratio, 20 < CTL ≤ 30": (g) =>
      percent(g.candidateStaffRatio?.["20–30"], g.totalUnits),

    "Global Percentage of Units with Candidate-to-Leader Ratio, CTL > 30": (g) =>
      percent(g.candidateStaffRatio?.["≥ 30"], g.totalUnits),

    // ===== Benchmark Counts =====
    "Global Percentage of Benchmark Counts, BC ≤ 10": (g) =>
      percent(g.benchmarkCounts?.["BC ≤ 10"], g.totalUnits),
  
    "Global Percentage of Benchmark Counts, 10 < BC ≤ 25": (g) =>
      percent(g.benchmarkCounts?.["10 < BC ≤ 25"], g.totalUnits),
  
    "Global Percentage of Benchmark Counts, BC > 25": (g) =>
      percent(g.benchmarkCounts?.["BC > 25"], g.totalUnits),
  
    // ===== Assessment Blocks =====
    "Global Percentage of Assessment Blocks, AB ≤ 8": (g) =>
      percent(g.assessmentBlocks?.["AB ≤ 8"], g.totalUnits),
  
    "Global Percentage of Assessment Blocks, 8 < AB ≤ 20": (g) =>
      percent(g.assessmentBlocks?.["8 < AB ≤ 20"], g.totalUnits),
  
    "Global Percentage of Assessment Blocks, AB > 20": (g) =>
      percent(g.assessmentBlocks?.["AB > 20"], g.totalUnits),
  
    // ===== Attendance =====
    "Global Percentage of Attendance - Present": (g) =>
      percent(g.attendance?.present, totalAttendanceCount(g)),

    "Global Percentage of Attendance - Excused Absences": (g) =>
      percent(g.attendance?.excusedAbsences, totalAttendanceCount(g)),

    "Global Percentage of Attendance - Unexcused Absences": (g) =>
      percent(g.attendance?.unexcusedAbsences, totalAttendanceCount(g)),

    "Global Percentage of Attendance - Excused Tardies": (g) =>
      percent(g.attendance?.excusedTardies, totalAttendanceCount(g)),

    "Global Percentage of Attendance - Unexcused Tardies": (g) =>
      percent(g.attendance?.unexcusedTardies, totalAttendanceCount(g)),

    // ===== Marks =====
    "Global Percentage of Positive Candidate Marks": (g) =>
      g.candidateMarks?.impactScore !== undefined
        ? g.candidateMarks.impactScore
        : null,

    "Global Percentage of Positive Leader Marks": (g) =>
      g.leaderMarks?.impactScore !== undefined
        ? g.leaderMarks.impactScore
        : null,

    // ===== Open Items =====
    "Global Percentage Open Items for All Courses": (g) =>
      percent(g.needAssessments?.open, g.needAssessments?.total),
  
    // ===== Outcomes =====
    "Global Percentage of Passing Candidates": (g) =>
      percent(g.unitOutcomes?.pass, totalOutcomeCount(g)),

    "Global Percentage of Failed Candidates": (g) =>
      percent(g.unitOutcomes?.fail, totalOutcomeCount(g)),

    "Global Percentage of Ongoing Candidates": (g) =>
      percent(g.unitOutcomes?.ongoing, totalOutcomeCount(g)),
  
    // ===== Proficiency =====
    "Global Percentage of Average Passed Equivalent Proficiency - XEQ": (_, t) =>
      t.summary?.regularMetrics?.XEP?.successRate,
  
    "Global Percentage of Average Passed Composite Proficiency - XCP": (_, t) =>
      t.summary?.regularMetrics?.XCP?.successRate,
  
    "Global Percentage of Average Passed Band Proficiency - XBP": (_, t) =>
      t.summary?.regularMetrics?.XBP?.successRate,
  
    "Global Percentage of Average Passed Butler Interaction Proficiency - MSIP": (_, t) =>
      t.summary?.regularMetrics?.MSIP?.successRate,

    "Global Percentage of Average Interaction Class 0": () =>
      icDistributionData?.icDistribution?.[0] ?? null,
    "Global Percentage of Average Interaction Class 1": () =>
      icDistributionData?.icDistribution?.[1] ?? null,
    "Global Percentage of Average Interaction Class 2": () =>
      icDistributionData?.icDistribution?.[2] ?? null,
    "Global Percentage of Average Interaction Class 3": () =>
      icDistributionData?.icDistribution?.[3] ?? null,
    "Global Percentage of Average Interaction Class 4": () =>
      icDistributionData?.icDistribution?.[4] ?? null,
    "Global Percentage of Average Interaction Class 5": () =>
      icDistributionData?.icDistribution?.[5] ?? null,
  
    // ===== Stability =====
    "Global Percentages of Stable Proficiency - STA/P": () =>
      stableSTAPRate(),
  
    "Global Percentages of Stable Growth - STA/G": () =>
      stableSTAGRate(),
  
    // ===== Growth =====
    "Global Percentage of Average Passed Equivalent Growth - ∆GEQ": (_, t) =>
      t.summary?.regularMetrics?.GEQ?.successRate,
  
    "Global Percentage of Passed Average Growth - ∆RR": (_, t) =>
      t.summary?.averageDeltaMetrics?.avgDeltaRRN?.successRate,
  
    "Global Percentage of Passed Average Growth - ∆PR": (_, t) =>
      t.summary?.averageDeltaMetrics?.avgDeltaPRN?.successRate,
  
    "Global Percentage of Passed Average Growth - ∆AR": (_, t) =>
      t.summary?.averageDeltaMetrics?.avgDeltaARN?.successRate,
  
    "Global Percentage of Passed Cumulative Growth - ∆RR": (_, t) =>
      t.summary?.cumulativeSumDeltaMetrics?.sumDeltaRRN?.successRate,
  
    "Global Percentage of Passed Cumulative Growth - ∆PR": (_, t) =>
      t.summary?.cumulativeSumDeltaMetrics?.sumDeltaPRN?.successRate,
  
    "Global Percentage of Passed Cumulative Growth - ∆AR": (_, t) =>
      t.summary?.cumulativeSumDeltaMetrics?.sumDeltaARN?.successRate,

    // ===== Productivity (UR) =====
    "Global Percentage of Productivity Rates, UR < 0.300": () =>
      ProductivityData?.distribution?.low ?? null,

    "Global Percentage of Productivity Rates, 0.300 ≤ UR ≤ 0.600": () =>
      ProductivityData?.distribution?.mid ?? null,

    "Global Percentage of Productivity Rates, UR > 0.600": () =>
      ProductivityData?.distribution?.high ?? null,

  };
  

  // Initialize table state
  const [tableData, setTableData] = useState(
    metricRows.map((metric, index) => ({
      metricDescription: metric,
      metricValue: '',
      assignedWeight: assignedWeights[index] ?? '',
      metricWeight: '',
    }))
  );  

  useEffect(() => {
    if (!globalAnalytics || !thresholdAnalytics || !StableData) return;
  
    setTableData((prev) =>
      prev.map((row) => {
        const resolver = metricValueResolvers[row.metricDescription];
  
        const rawValue = resolver
          ? resolver(globalAnalytics, thresholdAnalytics)
          : null;
  
        const metricValue =
          rawValue !== null && rawValue !== undefined && !isNaN(rawValue)
            ? Number(rawValue)
            : null;
  
        const assignedWeight =
          row.assignedWeight !== null && row.assignedWeight !== undefined
            ? Number(row.assignedWeight)
            : null;
  
        const metricWeight =
          metricValue !== null && assignedWeight !== null
            ? (metricValue * assignedWeight).toFixed(3)
            : "";
  
        return {
          ...row,
          metricValue: metricValue !== null ? metricValue.toFixed(3) : "",
          metricWeight,
        };
      })
    );
  }, [globalAnalytics, thresholdAnalytics, StableData]);
  
  const F6 = tableData.map(row =>
    row.metricValue !== "" && !isNaN(row.metricValue)
      ? Number(row.metricValue)
      : 0
  );

  const indexResult = useMemo(() => {
    if (!F6.length) return null;
    return mainFunction(F6, assignedWeights);
  }, [F6]);
  

  
  const indexRating = indexResult?.[0] ?? "";
  const weightIndex = indexResult?.[1] ?? null;
  const totalAssignedWeight = indexResult?.[3] ?? null;
  const totalMetricWeight = indexResult?.[4] ?? null;

  const renderChartContent = () => {
    if (!selectedChart) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select a plot from the list</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-full text-gray-500">
          Loading...
        </div>
      );
    }

    if (selectedChart.type === "table") {
      return (
        <div className="text-sm text-gray-600 mt-2 w-full overflow-auto mb-5">
          <table className="table-auto w-full text-sm ">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">Metric Descriptions</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Metric Values</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Assigned Weights</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Metric Weights</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">
                    {row.metricDescription}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {row.metricValue}
                  </td>

                  {/*  3rd Column: Assigned Weights */}
                  <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                    {row.assignedWeight.toFixed(3)}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {row.metricWeight}
                  </td>
                </tr>
              ))}

              <tr  className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-right">
                  <strong>Index Rating</strong>
                </td> 
                <td className="border border-gray-300 px-3 py-2">
                 {indexRating}
                </td> 
                <td className="border border-gray-300 px-3 py-2 text-center">
                 {totalAssignedWeight?.toFixed(3)}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {totalMetricWeight?.toFixed?.(3)}
                </td> 
             </tr>

             <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-right">
                  <strong>Weight Index (WI)</strong>
                </td>
                <td className="border border-gray-300 px-3 py-2 font-mono">
                  {weightIndex !== null ? weightIndex.toFixed(4) : ""}
                </td>
                <td className="border border-gray-300 px-3 py-2"></td>
                <td className="border border-gray-300 px-3 py-2"></td>
              </tr>
            </tbody>

          </table>
        </div>
      );
    } 
    
    const pieData = buildPieData();

    if ( !pieData.length || pieData.reduce((sum, d) => sum + d.value, 0) === 0) {
    
      return (
        <div className="flex justify-center items-center h-full text-gray-400">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className='pl-2 text-md'>Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2">
        <div className='w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-gray-200  p-1'>
          <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
            <h2 className="text-sm font-semibold">Plots</h2>

          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className="h-full flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1 mb-5">
                {/* Fixed Header */}
                <div className="grid grid-cols-12 bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm border-b border-gray-200">
                 
                  <div className="col-span-10 px-1 py-1 text-left">Entities</div>
                 
                  <div className="col-span-2 py-1 text-left">ID</div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(100%-40px)]">
                  {chart.map((item, index) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 ${selectedRow === item.id ? "bg-blue-100 font-medium" : ""} cursor-pointer`}
                      onClick={() => {
                        setSelectedChart(item);
                        setSelectedRow(item.id);
                      }}
                    >
                     
                      <div className="col-span-10 text-xs text-gray-700 truncate">{item.icon} {item.name}</div>
                    
                      <div className="col-span-2 pl-3 text-xs text-gray-400">{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200  bg-gray-100 ml-1">
          <div className="h-full overflow-auto m-5">
            <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">{selectedChart.name}</h2>
            
            <div className="h-full overflow-auto m-5">
              {renderChartContent()}
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

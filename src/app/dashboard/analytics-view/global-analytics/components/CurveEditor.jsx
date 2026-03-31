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

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
    "#FF4560", "#00BFFF", "#FF69B4", "#7FFF00", "#FFD700",
    "#40E0D0", "#FF8C00", "#8A2BE2", "#DC143C", "#00FA9A"
  ];
  

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
    { id: 24, name: "Global Percentages of Average Interaction Proficiency - MSIP", icon: "🔵", type: "pie" },
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


  console.log("Global Analytics:", globalAnalytics);

  const TWO_DECIMAL_CHART_IDS = new Set([
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 24,
    26, 27, 28, 29, 30, 31, 32
  ]);
  
  const shouldFormatTwoDecimals = (chartId) =>
    TWO_DECIMAL_CHART_IDS.has(chartId);

  const toPercentagePie = (metricData, isProficiencyMetric = false) => {
    // Check if metricData exists and has the required properties
    if (!metricData || metricData.successRate === undefined || metricData.totalInstances === undefined) {
      return [];
    }
  
    const rate = metricData.successRate;
    const totalInstances = metricData.totalInstances;
    const successCount = metricData.successCount;
    const failCount = totalInstances - successCount;
  
    // Format to 3 decimal places
    const successRateValue = Number(rate.toFixed(3));
    const failRateValue = Number((1 - rate).toFixed(3));
  
    if (isProficiencyMetric) {
      return [
        { 
          name: "Pass", 
          count: successCount,
          value: successRateValue 
        },
        { 
          name: "Fail", 
          count: failCount,
          value: failRateValue 
        }
      ];
    }
  
    return [
      { 
        name: "Positive", 
        count: successCount,
        value: successRateValue 
      },
      { 
        name: "Negative", 
        count: failCount,
        value: failRateValue 
      }
    ];
  };
  
  const buildSTAPPieData = () => {
    if (!StableData?.STAP) return [];
    const stable = Number(StableData.STAP.STABLE) || 0;
    const unstable = Number(StableData.STAP.UNSTABLE) || 0;
    const total = stable + unstable;
    
    if (total === 0) return [];
  
    return [
      { name: "Stable", count: stable, value: Number(((stable / total)).toFixed(2)) }, // Convert to percentage
      { name: "Unstable", count: unstable, value: Number(((unstable / total)).toFixed(2)) }, // Convert to percentage
    ];
  };
  
  const buildSTAGPieData = () => {
    if (!StableData?.STAG) return [];
    const stable = Number(StableData.STAG.STABLE) || 0;
    const unstable = Number(StableData.STAG.UNSTABLE) || 0;
    const total = stable + unstable;
    
    if (total === 0) return [];
  
    return [
      { name: "Stable", count: stable, value: Number(((stable / total)).toFixed(2)) }, // Convert to percentage
      { name: "Unstable", count: unstable, value: Number(((unstable / total)).toFixed(2)) }, // Convert to percentage
    ];
  };
  
  const buildProductivityPieData = () => {
    if (!ProductivityData?.distribution) return [];
  
    return [
      {
        name: "UR < 0.300",
        count: Number((ProductivityData.counts.low).toFixed(2)),
        value: Number((ProductivityData.distribution.low).toFixed(2)),
      },
      {
        name: "0.300 ≤ UR ≤ 0.600",
        count: Number((ProductivityData.counts.mid).toFixed(2)),
        value: Number((ProductivityData.distribution.mid).toFixed(2)),
      },
      {
        name: "UR > 0.600",
        count: Number((ProductivityData.counts.high).toFixed(2)),
        value: Number((ProductivityData.distribution.high).toFixed(2)),
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
        const signatureProfiles = globalAnalytics.signatureProfiles || {};

        // Calculate total
        const total = Object.values(signatureProfiles).reduce((sum, val) => sum + (Number(val) || 0), 0);

        return Object.entries(signatureProfiles)
          .map(([name, value]) => ({ 
            name, 
            count: Number(value),
            value: total > 0 ? Number((Number(value) / total).toFixed(2)) : 0 
  }));
  
      case 2:
        const unitTypes = globalAnalytics.unitTypes || {};

      // Calculate total
      const totalUnit = Object.values(unitTypes).reduce((sum, val) => sum + (Number(val) || 0), 0);

      return Object.entries(unitTypes)
        .map(([name, value]) => ({ 
          name, 
          count: Number(value),
          value: totalUnit > 0 ? Number((Number(value) / totalUnit).toFixed(2)) : 0 
        }));
  
      case 3:
        return buildCandidateStaffRatioPie();
          
        case 4: {
          const bc = globalAnalytics.benchmarkCounts || {};
        
          const ORDER = [
            "BC ≤ 10",
            "10 < BC ≤ 25",
            "BC > 25",
          ];
        
          const total = Object.values(bc).reduce((sum, val) => sum + (Number(val) || 0), 0);

          // Return percentages (as decimals 0-1)
          return ORDER
            .filter(key => bc[key] !== undefined)
            .map(key => ({
              name: key,
              count: Number(bc[key]),
              value: total > 0 ? Number((Number(bc[key]) / total).toFixed(2)) : 0.00,
            }));
        }
  
      case 5:
        const assessmentBlocks = globalAnalytics.assessmentBlocks || {};

        // Calculate total
        const totalAssessmentBlocks = Object.values(assessmentBlocks).reduce((sum, val) => sum + (Number(val) || 0), 0);

        return Object.entries(assessmentBlocks)
          .map(([name, value]) => ({ 
            name, 
            count: Number(value),
            value: totalAssessmentBlocks > 0 ? Number((Number(value) / totalAssessmentBlocks).toFixed(2)) : 0.00 
          }));
  
      case 6:
        const attendance = globalAnalytics.attendance || {};

        // Calculate total
        const totalAttendance = Object.values(attendance).reduce((sum, val) => sum + (Number(val) || 0), 0);

        return Object.entries(attendance).map(([key, value]) => ({
          name: humanizeKey(key),
          count: Number(value),
          value: totalAttendance > 0 ? Number((Number(value) / totalAttendance).toFixed(2)) : 0.00,
        }));
      
      case 7: {
        const open = globalAnalytics.needAssessments?.Open ?? 0.00;
        const pending = globalAnalytics.needAssessments?.Pending ?? 0.00;
        const closed = globalAnalytics.needAssessments?.Closed ?? 0.00;
    
        const total = open + pending + closed;

        // Return percentages as decimals (0-1)
        return [
          { name: "Open", count: open, value: total > 0 ? Number((open / total).toFixed(2)) : 0.00 },
          { name: "Pending", count: pending, value: total > 0 ? Number((pending / total).toFixed(2)) : 0.00 },
          { name: "Closed", count: closed, value: total > 0 ? Number((closed / total).toFixed(2)) : 0.00 },
        ];
      }    
      
      case 8: { 
        const rate = globalAnalytics.candidateMarks?.impactScore;
        return toPercentagePie(rate, false);
      }
      
      case 9: { 
        const rate = globalAnalytics.leaderMarks?.impactScore;
        return toPercentagePie(rate, false);
      }
          
      case 10:
        const unitOutcomes = globalAnalytics.unitOutcomes || {};

        // Calculate total
        const totalUnitOutcomes = Object.values(unitOutcomes).reduce((sum, val) => sum + (Number(val) || 0), 0);

        return Object.entries(unitOutcomes)
          .map(([name, value]) => ({ 
            name, 
            count: Number(value),
            value: totalUnitOutcomes > 0 ? Number((Number(value) / totalUnitOutcomes).toFixed(2)) : 0.00 
          }));
  
      // ================= REGULAR METRICS - PROFICIENCY (Pass/Fail) =================
      case 11: return toPercentagePie(regular?.XEP, true);
      case 12: return toPercentagePie(regular?.XRR, true);
      case 13: return toPercentagePie(regular?.XLR, true);
      case 14: return toPercentagePie(regular?.XWR, true);
      case 15: return toPercentagePie(regular?.XSR, true);
      case 16: return toPercentagePie(regular?.XTR, true);
      case 17: return toPercentagePie(regular?.XPR, true);
      case 18: return toPercentagePie(regular?.XRVSR, true);
      case 19: return toPercentagePie(regular?.XPVSR, true);
      case 20: return toPercentagePie(regular?.XAVSR, true);
      case 21: return toPercentagePie(regular?.XCP, true);
      case 22: return toPercentagePie(regular?.XBP, true);
      case 24: return toPercentagePie(regular?.MSIP, true);
      case 25: return buildICPieData();
      case 26: return toPercentagePie(regular?.GEQ, true);
  
      // ================= AVERAGE DELTA (Growth - Positive/Negative) =================
      case 27: return toPercentagePie(avgDelta?.avgDeltaRRN, true);
      case 28: return toPercentagePie(avgDelta?.avgDeltaPRN, true);
      case 29: return toPercentagePie(avgDelta?.avgDeltaARN, true);
  
      // ================= CUMULATIVE DELTA (Growth - Positive/Negative) =================
      case 30: return toPercentagePie(sumDelta?.sumDeltaRRN, true);
      case 31: return toPercentagePie(sumDelta?.sumDeltaPRN, true);
      case 32: return toPercentagePie(sumDelta?.sumDeltaARN, true);
  
      // ================= STABILITY =================
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

  const humanizeKey = (key) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
      .replace(/^./, (c) => c.toUpperCase()); // capitalize first letter

      const stableSTAPRate = () => {
        if (!StableData?.STAP) return null;
      
        const stable = StableData.STAP.STABLE ?? 0;
        const unstable = StableData.STAP.UNSTABLE ?? 0;
        const total = stable + unstable;
      
        if (!total) return null;
      
        return Number((stable / total).toFixed(4));
      };
      
      const stableSTAGRate = () => {
        if (!StableData?.STAG) return null;
      
        const stable = StableData.STAG.STABLE ?? 0;
        const unstable = StableData.STAG.UNSTABLE ?? 0;
        const total = stable + unstable;
      
        if (!total) return null;
      
        return Number((stable / total).toFixed(4));
      };
  
  
  const buildCandidateStaffRatioPie = () => {
    if (!globalAnalytics?.candidateStaffRatio || !globalAnalytics?.totalUnits)
      return [];
  
    const total = globalAnalytics.totalUnits;
  
    const labelMap = {
      "≤ 20": "CTL ≤ 20",
      "20–30": "20 < CTL ≤ 30",
      "≥ 30": "CTL > 30",
    };
  
    return Object.entries(globalAnalytics.candidateStaffRatio).map(
      ([key, count]) => ({
        name: labelMap[key] ?? key,
        count: Number(count), 
        value: total > 0 ? Number((count / total).toFixed(3)) : 0, // 
      })
    );
  };
  
  const totalOutcomeCount = (g) =>
    (g.unitOutcomes?.Pass ?? 0) +
    (g.unitOutcomes?.Fail ?? 0) +
    (g.unitOutcomes?.Ongoing ?? 0);
    
  
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
    "Global Percentage Open Items for All Courses": (g) => {

      const open = g.needAssessments?.Open ?? 0;
      const pending = g.needAssessments?.Pending ?? 0;
      const closed = g.needAssessments?.Closed ?? 0;
    
      const total = open + pending + closed;
      return total ? open / total : null;
    },
  
    // ===== Outcomes =====
    "Global Percentage of Passing Candidates": (g) =>
      percent(g.unitOutcomes?.Pass, totalOutcomeCount(g)),

    "Global Percentage of Failed Candidates": (g) =>
      percent(g.unitOutcomes?.Fail, totalOutcomeCount(g)),

    "Global Percentage of Ongoing Candidates": (g) =>
      percent(g.unitOutcomes?.Ongoing, totalOutcomeCount(g)),
  
    // ===== Proficiency =====
    "Global Percentage of Average Passed Equivalent Proficiency - XEP": (_, t) =>
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

  console.log("benchmarks:", globalAnalytics);

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
        <div className="text-xs text-gray-600 mt-2 w-full overflow-auto mb-17 mt-5">
          <table className="table-auto w-full text-xs ">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-2 py-1 text-center">Metric Descriptions</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Metric Values</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Assigned Weights</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Metric Weights</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1">
                    {row.metricDescription}
                  </td>

                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {row.metricValue}
                  </td>

                  {/*  3rd Column: Assigned Weights */}
                  <td className="border border-gray-300 px-2 py-1 text-center font-medium">
                    {row.assignedWeight.toFixed(3)}
                  </td>

                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {row.metricWeight}
                  </td>
                </tr>
              ))}

              <tr  className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-right">
                  <strong>Index Rating</strong>
                </td> 
                <td className="border border-gray-300 px-2 py-1 text-center">
                 {indexRating}
                </td> 
                <td className="border border-gray-300 px-2 py-1 text-center">
                 {totalAssignedWeight?.toFixed(3)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {totalMetricWeight?.toFixed?.(3)}
                </td> 
             </tr>

             <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-right">
                  <strong>Weight Index (WI)</strong>
                </td>
                <td className="border border-gray-300 px-2 py-1 font-mono text-center">
                  {weightIndex !== null ? weightIndex.toFixed(4) : ""}
                </td>
                {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                {/* <td className="border border-gray-300 px-2 py-1"></td> */}
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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            
            label={({ name, value }) =>
              shouldFormatTwoDecimals(selectedChart.id)
                ? `${Number(value).toFixed(3)}`
                : `${Number(value).toFixed(3)}`
            }
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => {
              const percentage = `${(value).toFixed(3)}`;
              const count = props?.payload?.count;
              
              if (count !== undefined && count !== null) {
                // Format count as integer without decimals
                const formattedCount = Math.round(count);
                return [`${percentage} Count: ${formattedCount}`, name];
              }
              return [percentage, name];
            }} 
          />
          <Legend  verticalAlign="bottom" align="center" wrapperStyle={{ paddingBottom: 20 }} itemSorter={() => 0} />
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
        <div className='w-6/12 lg:w-5/12 flex flex-col border-2 h-full border-gray-200  p-1'>
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

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 ml-1">
          <div className="m-5 flex flex-col h-full">
            <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">{selectedChart.icon} {selectedChart.name}</h2>
            <div className="flex-1 flex overflow-auto p-2">
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

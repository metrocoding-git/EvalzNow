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
import ScoringCriteria from "./ScoringCriteria";
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
} from "recharts";
import PropertyEditor from "../../components/PropertyEditor";
import { getScoringCriteriaByUnitId } from "@/services/scoringCriteriaService";
import { getAttainedScoreSummary, getMaxScoresSummary, getScoringTrendsSummary } from "@/services/scoringTrendsService";

export default function PlotSelections({ filters, unitId, candidateId }) {
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
    Array.from({ length: 10 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("IndirectPerformancePoint");
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] =
    useState("Table");

  const canvasRef = useRef(null);


  // Example line chart data
  const data = [
    { name: "A", uv: 400, pv: 240 },
    { name: "B", uv: 300, pv: 139 },
    { name: "C", uv: 200, pv: 980 },
  ];

  const [chart, setChart] = useState([
    { name: "Communication (MC1) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc1", icon: "📉", id: "1" },
    { name: "Intelligence (MC2) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc2", icon: "📉", id: "2" },
    { name: "Responsiveness (MC3) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc3", icon: "📉", id: "3" },
    { name: "Efficiency (MC4) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc4", icon: "📉", id: "4" },
    { name: "Adaptation (MC5) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc5", icon: "📉", id: "5" },
    { name: "Accuracy (MC6) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc6", icon: "📉", id: "6" },
    { name: "Verbal Reasoning (MC7) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc7", icon: "📉", id: "7" },
    { name: "Spatial Reasoning (MC8) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc8", icon: "📉", id: "8" },
    { name: "Numerical Reasoning (MC9) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc9", icon: "📉", id: "9" },
    { name: "Problem Solving (MC10) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc10", icon: "📉", id: "10" },
    { name: "Memory (MC11) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc11", icon: "📉", id: "11" },
    { name: "Data Checking (MC12) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc12", icon: "📉", id: "12" },
    { name: "Work Sampling (MC13) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc13", icon: "📉", id: "13" },
    { name: "Quality of Work (MC14) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc14", icon: "📉", id: "14" },
    { name: "Resourcefulness (MC15) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc15", icon: "📉", id: "15" },
    { name: "Following Instructions (MC16) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc16", icon: "📉", id: "16" },
    { name: "Working in Teams (MC17) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc17", icon: "📉", id: "17" },
    { name: "Working Alone (MC18) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc18", icon: "📉", id: "18" },
    { name: "Initiative (MC19) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc19", icon: "📉", id: "19" },
    { name: "Sick/Injury Avoidance (MC20) vs. Insert Score Row Counter (Workforce Only - Line Graph)", key: "mc20", icon: "📉", id: "20" },
    { name: "Attained Score vs. Insert Score Row Counter (Classroom + Workforce - Line Graphs)", key: "attained", icon: "📉", id: "21" },
    { name: "Maximum Score vs. Insert Score Row Counter (Classroom + Workforce - Line Graphs)", key: "max", icon: "📉", id: "22" }
  ]
  );
  

  const [selectedChart, setSelectedChart] = useState(chart[0]);
  const [customCriteria, setCustomCriteria] = useState([]);

  const [scoringData, setScoringData] = useState(null);
  const [attainedScoreData, setAttainedScoreData] = useState(null);
  const [maxScoreData, setMaxScoreData] = useState(null);

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

  const handleDeleteCurve = () => {
    const updated = curves.filter((c) => c.id !== selectedCurveId);
    setCurves(updated);
    if (updated.length > 0) {
      setSelectedCurveId(updated[0].id);
    } else {
      setSelectedCurveId(null);
    }
  };


  useEffect(() => {
    const fetchCriteria = async () => {
      if (!unitId) return;
  
      try {
        const data = await getScoringCriteriaByUnitId(unitId);
        if (!Array.isArray(data)) throw new Error("Invalid scoring criteria response");
  
        // Sort by criteriaId
        const sorted = [...data].sort((a, b) => a.criteriaId - b.criteriaId);
  
        setChart((prev) => {
          // Find the max current numeric ID in chart (or just start from 22)
          const startId = 23;
        
          // Map new criteria with sequential IDs starting from 23 and keys starting from cc1
          const mappedCharts = sorted.map((c, index) => ({
            name: `${c.criteria} (CC${c.criteriaId}) vs. Insert Score Row Counter (Workforce Only - Line Graph)`,
            key: `cc${index + 1}`, // cc1, cc2, ...
            icon: "📉",
            id: (startId + index).toString(),
          }));
        
          return [...chart.slice(0, 22), ...mappedCharts]; // append to existing chart array
        });
        
  
        setCustomCriteria(data);
      } catch (err) {
        console.error("Failed to fetch scoring criteria:", err);
      }
    };
  
    fetchCriteria();
  }, [unitId]);

  
  useEffect(() => {
    const fetchScoringData = async () => {
      if (!unitId || !candidateId) return;

      try {
        const data = await getScoringTrendsSummary({
          unitId: unitId,
          candidate_id: candidateId,       // make sure filters contains candidate_id
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });
        setScoringData(data);
      } catch (err) {
        console.error("Failed to fetch scoring trends:", err);
      }
    };

    fetchScoringData();
  }, [unitId, filters, candidateId]);


  useEffect(() => {
    const fetchAttainedScoreData = async () => {
      if (!unitId || !candidateId) return;

      try {
        const data = await getAttainedScoreSummary({
          unitId: unitId,
          candidate_id: candidateId,       // make sure filters contains candidate_id
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });
        setAttainedScoreData(data);
      } catch (err) {
        console.error("Failed to fetch scoring trends:", err);
      }
    };

    fetchAttainedScoreData();
  }, [unitId, filters, candidateId]);


  useEffect(() => {
    const fetchMaxScoreData = async () => {
      if (!unitId || !candidateId) return;

      try {
        const data = await getMaxScoresSummary({
          unitId: unitId,
          candidate_id: candidateId,       // make sure filters contains candidate_id
          ppIdFrom: filters?.ppIdFrom ?? undefined,    
          ppIdTo: filters?.ppIdTo ?? undefined,
          criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          criticalRefDateTo: filters?.criticalDateTo ?? undefined
        });
        setMaxScoreData(data);
      } catch (err) {
        console.error("Failed to fetch scoring trends:", err);
      }
    };

    fetchMaxScoreData();
  }, [unitId, filters, candidateId]);

  const buildXYChartData = (scoringData, attainedScoreData, maxScoreData, selectedChart) => {
    if (!selectedChart) return [];
  
    const key = selectedChart.key;
  
    // Handle Attained Score chart
    if (key === "attained") {
      if (!attainedScoreData) return [];
      return attainedScoreData.map((row) => ({
        x: Number(row.attainedScore ?? 0),
        y: Number(row.totalRows ?? 0),
      })).sort((a, b) => a.x - b.x);
    }
  
    // Handle Max Score chart
    if (key === "max") {
      if (!maxScoreData) return [];
      return maxScoreData.map((row) => ({
        x: Number(row.maxScore ?? 0),
        y: Number(row.totalRows ?? 0),
      })).sort((a, b) => a.x - b.x);
    }
  
    // Handle MC/CC charts (existing logic)
    if (!scoringData || !key) return [];
  
    const points = scoringData.map((row) => {
      let val = 0;
      if (key.startsWith("mc")) {
        val = row.mcCounts?.[key] ?? 0;
      } else if (key.startsWith("cc")) {
        val = row.ccCounts?.[key] ?? 0;
      }
      return {
        x: Number(val),
        y: Number(row.totalRows ?? 0),
        ppId: row.ppId,
        label: `PP ${row.ppId}`,
      };
    });
  
    points.sort((a, b) => a.x - b.x);
    return points;
  };
  
  
  const xyData = buildXYChartData(
    scoringData,
    attainedScoreData,
    maxScoreData,
    selectedChart
  );
  
  
  console.log("Scoring Trends Data: ", scoringData);

  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className="pl-2 text-md">Plot Selections</span>
        
      </h2>
      <div className="flex h-full w-full my-2 mx-1">
        <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200  p-1">
          <div className="flex items-center justify-between px-1 mx-1  text-gray-700 ">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { }}
                title="Create Material"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <RefreshCw
                  className="w-4 h-4 hover:text-green-600"
                  onClick={() => setScoreAdd(true)}
                />
              </button>
              <button
                onClick={handleDeleteCurve}
                title="Delete Curve"
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                <FolderOutput className="w-4 h-4 hover:text-blue-600" />
              </button>
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
                      {chart.map((item, index) => (
                        <div 
                          key={index} 
                          className={`grid grid-cols-12 hover:bg-gray-200 cursor-pointer ${selectedChart.name === item.name ? "bg-gray-100" : ""}`}
                          onClick={() => setSelectedChart(item)}
                        >
                          <div className="col-span-10 px-2 py-1 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              
                              <span className="truncate">📉 {item.name}</span>
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
            </div>

            <div className="h-1/2 flex flex-col border border-gray-200">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm  cursor-pointer ${activeAdjustPropertieTab === "Property editor"
                      ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white"
                    }`}
                  onClick={() => setActiveAdjustPropertieTab("Property editor")}
                >
                  Property editor
                </button>
                <button
                  className={`px-3 py-1 text-sm  cursor-pointer ${activeAdjustPropertieTab === "Table"
                      ? "text-black bg-white  border-t-2 border-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 border-t border-r border-b-transparent border-gray-300 hover:bg-white"
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

                {activeAdjustPropertieTab === "Table" && (
                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
                    <table className="table-auto w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                            Month
                          </th>
                          <th className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                            X Axis Value
                          </th>
                          <th className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                            Y Axis Value
                          </th>
                          <th className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                            Z Axis Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {floatChartData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50">
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">
                              {row.name}
                            </td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">
                              {row.xValue}
                            </td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">
                              {row.yValue}
                            </td>
                            <td className="whitespace-nowrap text-center border border-gray-300 px-3 py-2">
                              {row.zValue}
                            </td>
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

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 bg-gray-100 ml-1">
          <div className="h-full overflow-auto m-5">
            <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">{selectedChart.icon} {selectedChart.name}</h2>

            <ResponsiveContainer width="100%" height="95%">
              <LineChart
                data={xyData}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, "dataMax"]}
                  allowDecimals={false}
                >
                  <Label value={`${selectedChart.key} (X)`} offset={-10} position="insideBottom" />
                </XAxis>

                <YAxis type="number" dataKey="y">
                  <Label value="Total Rows (Y)" angle={-90} position="insideLeft" offset={10} />
                </YAxis>

                <Tooltip
                  formatter={(value, name) => {
                    // Recharts Tooltip passes y-value as value because our Line uses dataKey="y"
                    return [value, name === "y" ? "Total Rows" : name];
                  }}
                  labelFormatter={(label) => `MC/CC value: ${label}`}
                  // show ppId in tooltip payload
                  contentStyle={{ fontSize: 12 }}
                />

                {/* <Legend verticalAlign="top" /> */}

                <Line
                  type="monotone"
                  dataKey="y"
                  name={selectedChart.name}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={false}
                />


              </LineChart>
            </ResponsiveContainer>
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

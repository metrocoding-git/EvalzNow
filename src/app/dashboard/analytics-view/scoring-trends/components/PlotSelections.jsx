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

export default function PlotSelections() {
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

  const chart = [
    {
      name: "Main Criteria vs. Insert Score Row Counter (Workforce Only, 20 plots total - Line Graphs)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Extra Criteria vs. Insert Score Row Counter (Workforce Only, 20 plots total - Line Graphs, criteria must match the unit)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Attained Score vs. Insert Score Row Counter (Classroom + Workforce - Line Graphs)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Maximum Score vs. Insert Score Row Counter (Classroom + Workforce - Line Graphs)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Main Criteria Percentage by Units (Workforce Only - Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Extra Criteria Percentage by Units (Workforce Only - Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Attained Score Average by Units (Classroom + Workforce - Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Maximum Score Average by Units (Classroom + Workforce - Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Insert Score Count by Criteria Type (Pie Chart)",
      icon: "🥧",
      id: '1'
    },
    {
      name: "Insert Score Count by Units (Pie Chart)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Insert Score Count by Month (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Insert Score Count by Day (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Average Attained Score per Month (Line Graph)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Average Attained Score per Day (Line Graph)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Average Maximum Score per Month (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Average Maximum Score per Day (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Main Criteria Completion Rate (Donut Chart)",
      icon: "🍩",
      id: '1'
    },
    {
      name: "Extra Criteria Completion Rate (Donut Chart)",
      icon: "🍩",
      id: '1'
    },
    {
      name: "Unit-wise Criteria Completion Comparison (Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Criteria Type Distribution (Stacked Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Insert Score Trend (Last 30 Days - Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Insert Score Trend (Last 12 Months - Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Classroom vs. Workforce Score Comparison (Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Insert Score Count by Instructor (Bar Chart)",
      icon: "👨‍🏫",
      id: '1'
    },
    {
      name: "Insert Score Count by Student (Bar Chart)",
      icon: "🧑‍🎓",
      id: '1'
    },
    {
      name: "Score Deviation from Maximum (Line Graph)",
      icon: "📉",
      id: '1'
    },
    {
      name: "Unit Performance vs. Overall Average (Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Monthly Performance Comparison by Unit (Grouped Bar Chart)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Main Criteria Distribution Over Time (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Extra Criteria Distribution Over Time (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Cumulative Insert Score Over Time (Area Chart)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Criteria Type by Course Category (Pie Chart)",
      icon: "🥧",
      id: '1'
    },
    {
      name: "Insert Score Range Distribution (Histogram)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Monthly Insert Activity (Calendar Heatmap)",
      icon: "📅",
      id: '1'
    },
    {
      name: "Unit-wise Attained Score Progress (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Unit-wise Maximum Score Progress (Line Graph)",
      icon: "📈",
      id: '1'
    },
    {
      name: "Insert Score Count per Day of Week (Bar Chart)",
      icon: "📆",
      id: '1'
    },
    {
      name: "Insert Score Count per Hour of Day (Bar Chart)",
      icon: "🕒",
      id: '1'
    },
    {
      name: "Score Type Proportion per Unit (Stacked Bar)",
      icon: "📊",
      id: '1'
    },
    {
      name: "Insert Score vs. Time Spent (Scatter Plot)",
      icon: "🔘",
      id: '1'
    },
    {
      name: "Criteria Fulfillment Rate by Category (Donut Chart)",
      icon: "🍩",
      id: '1'
    },
    {
      name: "Insert Score Median vs. Mean by Unit (Box Plot)",
      icon: "📦",
      id: '1'
    },
  ];

  const [selectedChart, setSelectedChart] = useState(chart[0]);

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
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Month
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            X Axis Value
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Y Axis Value
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Z Axis Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {floatChartData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50">
                            <td className="border border-gray-300 px-3 py-2">
                              {row.name}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {row.xValue}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {row.yValue}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
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
                data={floatChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name">
                  <Label
                    value="Time Period (X)"
                    offset={-10}
                    position="insideBottom"
                  />
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

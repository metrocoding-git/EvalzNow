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
} from "recharts";
import PropertyEditor from "../../components/PropertyEditor";
import CandidateSelectionTable from "./CandidateSelection";
import { getNormalDistributionData, getTDistributionData } from "@/services/unitDistributionService";

export default function PlotSelections({ onCandidatesSelected, unitId }) {
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
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] =
    useState("Table");

  const [tableData, setTableData] = useState([]);
  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: "A", uv: 400, pv: 240 },
    { name: "B", uv: 300, pv: 139 },
    { name: "C", uv: 200, pv: 980 },
  ];
  const chart = [
    { id: 1, name: "Normal Distribution - RR", icon: "📈", type: "line", key: "RR", distribution: "normal" },
    { id: 2, name: "Normal Distribution - PR", icon: "📈", type: "line", key: "PR", distribution: "normal" },
    { id: 3, name: "Normal Distribution - AR", icon: "📈", type: "line", key: "AR", distribution: "normal" },
    { id: 4, name: "Normal Distribution - XEQ", icon: "📈", type: "line", key: "XEQ", distribution: "normal" },
    { id: 5, name: "Normal Distribution - XCP", icon: "📈", type: "line", key: "XCP", distribution: "normal" },
    { id: 6, name: "Normal Distribution - XBP", icon: "📈", type: "line", key: "XBP", distribution: "normal" },
    { id: 7, name: "Normal Distribution - ∆RR", icon: "📈", type: "line", key: "deltaRR", distribution: "normal" },
    { id: 8, name: "Normal Distribution - ∆PR", icon: "📈", type: "line", key: "deltaPR", distribution: "normal" },
    { id: 9, name: "Normal Distribution - ∆AR", icon: "📈", type: "line", key: "deltaAR", distribution: "normal" },
    { id: 10, name: "Normal Distribution - ∆GEQ", icon: "📈", type: "line", key: "deltaGEQ", distribution: "normal" },
  
    { id: 11, name: "T Distribution - RR", icon: "📉", type: "line", key: "RR", distribution: "t" },
    { id: 12, name: "T Distribution - PR", icon: "📉", type: "line", key: "PR", distribution: "t" },
    { id: 13, name: "T Distribution - AR", icon: "📉", type: "line", key: "AR", distribution: "t" },
    { id: 14, name: "T Distribution - XEQ", icon: "📉", type: "line", key: "XEQ", distribution: "t" },
    { id: 15, name: "T Distribution - ∆RR", icon: "📉", type: "line", key: "deltaRR", distribution: "t" },
    { id: 16, name: "T Distribution - ∆PR", icon: "📉", type: "line", key: "deltaPR", distribution: "t" },
    { id: 17, name: "T Distribution - ∆AR", icon: "📉", type: "line", key: "deltaAR", distribution: "t" },
    { id: 18, name: "T Distribution - ∆GEQ", icon: "📉", type: "line", key: "deltaGEQ", distribution: "t" },
  
    { id: 19, name: "Exponential Distribution - RR", icon: "📈", type: "line", key: "RR", distribution: "exponential" },
    { id: 20, name: "Exponential Distribution - PR", icon: "📈", type: "line", key: "PR", distribution: "exponential" },
    { id: 21, name: "Exponential Distribution - AR", icon: "📈", type: "line", key: "AR", distribution: "exponential" },
    { id: 22, name: "Exponential Distribution - XEQ", icon: "📈", type: "line", key: "XEQ", distribution: "exponential" },
    { id: 23, name: "Exponential Distribution - ∆GEQ", icon: "📈", type: "line", key: "∆GEQ", distribution: "exponential" },
  
    { id: 24, name: "Chi-Square Distribution - 95%", icon: "📊", type: "area", key: "CHI_SQUARE", distribution: "chi-square" },
  
    { id: 25, name: "F-Distribution - Proficiency to Growth", icon: "📉", type: "line", key: "F_DIST", distribution: "f" },
  
    { id: 26, name: "Beta Distribution - STA/P", icon: "🧪", type: "line", key: "STA_P", distribution: "beta" },
    { id: 27, name: "Beta Distribution - STA/G", icon: "🧪", type: "line", key: "STA_G", distribution: "beta" },
  
    { id: 28, name: "Uniform Distribution - STA/P", icon: "🔢", type: "bar", key: "STA_P", distribution: "uniform" },
    { id: 29, name: "Uniform Distribution - STA/G", icon: "🔢", type: "bar", key: "STA_G", distribution: "uniform" },
  
    { id: 30, name: "Weibull Distribution - CDF/RDF - RR", icon: "⏳", type: "area", key: "RR", distribution: "weibull-cdf" },
    { id: 31, name: "Weibull Distribution - CDF/RDF - PR", icon: "⏳", type: "area", key: "PR", distribution: "weibull-cdf" },
    { id: 32, name: "Weibull Distribution - CDF/RDF - AR", icon: "⏳", type: "area", key: "AR", distribution: "weibull-cdf" },
    { id: 33, name: "Weibull Distribution - CDF/RDF - XEP", icon: "⏳", type: "area", key: "XEP", distribution: "weibull-cdf" },
    { id: 34, name: "Weibull Distribution - CDF/RDF - ∆GEQ", icon: "⏳", type: "area", key: "∆GEQ", distribution: "weibull-cdf" },
  
    { id: 35, name: "Weibull Distribution - PDF - RR", icon: "📈", type: "line", key: "RR", distribution: "weibull-pdf" },
    { id: 36, name: "Weibull Distribution - PDF - PR", icon: "📈", type: "line", key: "PR", distribution: "weibull-pdf" },
    { id: 37, name: "Weibull Distribution - PDF - AR", icon: "📈", type: "line", key: "AR", distribution: "weibull-pdf" },
    { id: 38, name: "Weibull Distribution - PDF - XEP", icon: "📈", type: "line", key: "XEP", distribution: "weibull-pdf" },
    { id: 39, name: "Weibull Distribution - PDF - ∆GEQ", icon: "📈", type: "line", key: "∆GEQ", distribution: "weibull-pdf" },
  
    { id: 40, name: "Weibull Distribution - RISK - RR", icon: "⚠️", type: "line", key: "RR", distribution: "weibull-risk" },
    { id: 41, name: "Weibull Distribution - RISK - PR", icon: "⚠️", type: "line", key: "PR", distribution: "weibull-risk" },
    { id: 42, name: "Weibull Distribution - RISK - AR", icon: "⚠️", type: "line", key: "AR", distribution: "weibull-risk" },
    { id: 43, name: "Weibull Distribution - RISK - XEP", icon: "⚠️", type: "line", key: "XEP", distribution: "weibull-risk" },
    { id: 44, name: "Weibull Distribution - RISK - ∆GEQ", icon: "⚠️", type: "line", key: "∆GEQ", distribution: "weibull-risk" },
  ];
  
  
  const [selectedChart, setSelectedChart] = useState(chart[0]);

 
  useEffect(() => {
    const fetchDistributionData = async () => {
      if (!unitId) return;
      if (!candidatePpList || candidatePpList.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        // Determine which API to call based on selected distribution type
        let data;
        if (selectedChart.distribution === "normal") {
          data = await getNormalDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
        } else if (selectedChart.distribution === "t") {
          data = await getTDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
        } else if (selectedChart.distribution === "exponential") {
          data = await getExponentialDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
        }
        // Add other distribution API calls here...
        else {
          // Default to normal distribution if no specific API
          data = await getNormalDistributionData({
            unitId,
            candidatePpList,
            key: selectedChart.key
          });
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
  }, [unitId, candidatePpList, selectedChart]);

  const handleChartSelect = (chartItem) => {
    setSelectedChart(chartItem);
    setSelectedKey(chartItem.key);
  };

  // Prepare chart data based on selected distribution
  const chartData = distributions[selectedKey]?.table?.map((row) => ({
    name: row.x, // X-axis values (Z-scores)
    value: row.y,
  })) || [];

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
    const mean = distributionParams?.mu || 0;
    const sigma = distributionParams?.sigma || 1;

    // Calculate reference line positions - only for normal distribution
    const getReferenceLines = () => {
      
      if (selectedChart.distribution !== "normal") {
        return [];
      }
      
      return [
        { value: mean, label: 'Mean', color: '#000000', strokeWidth: 2 },
        { value: +sigma, label: 'μ+σ', color: '#ef4444', strokeWidth: 1 },
        { value: -sigma, label: 'μ-σ', color: '#ef4444', strokeWidth: 1 },
        { value: +2 * sigma, label: 'μ+2σ', color: '#f59e0b', strokeWidth: 1 },
        { value: -2 * sigma, label: 'μ-2σ', color: '#f59e0b', strokeWidth: 1 },
        { value: +3 * sigma, label: 'μ+3σ', color: '#84cc16', strokeWidth: 1 },
        { value: -3 * sigma, label: 'μ-3σ', color: '#84cc16', strokeWidth: 1 },
      ];
    };

    // Render reference lines
  const renderReferenceLines = () => {
    const lines = getReferenceLines();
      if (!lines || lines.length === 0) return null;
    return lines.map((line, index) => (
      <ReferenceLine
        key={index}
        x={line.value}
        stroke={line.color}
        strokeWidth={line.strokeWidth}
        strokeDasharray={line.value === mean ? "0" : "3 3"}
        label={{
          value: line.label,
          position: 'top',
          fill: line.color,
          fontSize: 12,
          fontWeight: line.value === mean ? 'bold' : 'normal'
        }}
      />
    ));
  };


    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 0, bottom: 20 }
    };

    switch (selectedChart.type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name">
              <Label value={getXAxisLabel()} position="insideBottom" offset={-10} />
            </XAxis>
            <YAxis>
              <Label value={getYAxisLabel()} angle={-90} position="insideLeft" offset={10} />
            </YAxis>
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="yValue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Area type="monotone" dataKey="xValue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name">
              <Label value={getXAxisLabel()} position="insideBottom" offset={-10} />
            </XAxis>
            <YAxis>
              <Label value={getYAxisLabel()} angle={-90} position="insideLeft" offset={10} />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar dataKey="xValue" fill="#3b82f6" name="X Values" />
            <Bar dataKey="yValue" fill="#10b981" name="Y Values" />
          </BarChart>
        );

      case "line":
      default:
        return (
          <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name">
            <Label value={getXAxisLabel()} position="insideBottom" offset={-10} />
          </XAxis>
          <YAxis>
            <Label value={getYAxisLabel()} angle={-90} position="insideLeft" offset={10} />
          </YAxis>
          <Tooltip />
          <Legend />

          {selectedChart.distribution === 'normal' && renderReferenceLines()}
          
          <Line 
            type="monotone" 
            dataKey="value" 
            fill="#3b82f6" 
            strokeWidth={1} 
            dot={{ r: 2 }} 
            name="Distribution"
          />
        </LineChart>
        );
    }
  };

  // Helper functions for axis labels
  const getXAxisLabel = () => {
    if (selectedChart.distribution.includes("weibull")) {
      return "Time/Value";
    }
    if (selectedChart.distribution === "chi-square") {
      return "Chi-Square Value";
    }
    return "Z-Score";
  };

  const getYAxisLabel = () => {
    if (selectedChart.distribution.includes("pdf")) {
      return "Probability Density";
    }
    if (selectedChart.distribution.includes("cdf")) {
      return "Cumulative Probability";
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
                onClick={() => {}}
                title="Reset"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <RefreshCw
                  className="w-4 h-4 hover:text-blue-800"
                  onClick={() => setScoreAdd(true)}
                />
              </button>
              <button
                onClick={handleDeleteCurve}
                title="Export"
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                <FolderOutput className="w-4 h-4 hover:text-red-800" />
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
                            <td className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                              {row.name}
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                              {row.xValue}
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
                              {row.yValue}
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center">
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

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-gray-200 ml-1">
          <div className="h-full overflow-auto m-5">
            <h2 className="text-lg text-center font-semibold text-gray-700 mb-4">{selectedChart.icon} {selectedChart.name}</h2>

            <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showCandidateTable && (
        <CandidateSelectionTable
          onClose={handleCandidateSubmit} // Use the correct handler
        />
      )}

    </>
  );
}

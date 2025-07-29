'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X, RefreshCw, FolderOutput } from 'lucide-react';

import IndicatorTable from "./IndicatorTable";
import LoadTable from "./LoadTable";
import LineChart from "./LineChart";

export default function CurveEditor() {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
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

  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('IndirectPerformancePoint');
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Loads');


  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: 'A', uv: 400, pv: 240 },
    { name: 'B', uv: 300, pv: 139 },
    { name: 'C', uv: 200, pv: 980 },
  ];

  const chart = [
    {
      name: "Main Criteria vs. Insert Score Row Counter (Workforce Only, 20 plots total - Line Graphs)",
      icon: "📊",
    },
    {
      name: "Extra Criteria vs. Insert Score Row Counter (Workforce Only, 20 plots total - Line Graphs, criteria must match the unit)",
      icon: "📈",
    },
    {
      name: "Attained Score vs. Insert Score Row Counter (Classroom + Workforce - Line Graphs)",
      icon: "📉",
    },
    {
      name: "Maximum Score vs. Insert Score Row Counter (Classroom + Workforce - Line Graphs)",
      icon: "📈",
    },
    {
      name: "Main Criteria Percentage by Units (Workforce Only - Bar Chart)",
      icon: "📊",
    },
    {
      name: "Extra Criteria Percentage by Units (Workforce Only - Bar Chart)",
      icon: "📊",
    },
    {
      name: "Attained Score Average by Units (Classroom + Workforce - Bar Chart)",
      icon: "📊",
    },
    {
      name: "Maximum Score Average by Units (Classroom + Workforce - Bar Chart)",
      icon: "📊",
    },
    {
      name: "Insert Score Count by Criteria Type (Pie Chart)",
      icon: "🥧",
    },
    {
      name: "Insert Score Count by Units (Pie Chart)",
      icon: "🥧",
    },
    {
      name: "Insert Score Count by Month (Line Graph)",
      icon: "📈",
    },
    {
      name: "Insert Score Count by Day (Line Graph)",
      icon: "📈",
    },
    {
      name: "Average Attained Score per Month (Line Graph)",
      icon: "📉",
    },
    {
      name: "Average Attained Score per Day (Line Graph)",
      icon: "📉",
    },
    {
      name: "Average Maximum Score per Month (Line Graph)",
      icon: "📈",
    },
    {
      name: "Average Maximum Score per Day (Line Graph)",
      icon: "📈",
    },
    {
      name: "Main Criteria Completion Rate (Donut Chart)",
      icon: "🍩",
    },
    {
      name: "Extra Criteria Completion Rate (Donut Chart)",
      icon: "🍩",
    },
    {
      name: "Unit-wise Criteria Completion Comparison (Bar Chart)",
      icon: "📊",
    },
    {
      name: "Criteria Type Distribution (Stacked Bar Chart)",
      icon: "📊",
    },
    {
      name: "Insert Score Trend (Last 30 Days - Line Graph)",
      icon: "📈",
    },
    {
      name: "Insert Score Trend (Last 12 Months - Line Graph)",
      icon: "📈",
    },
    {
      name: "Classroom vs. Workforce Score Comparison (Bar Chart)",
      icon: "📊",
    },
    {
      name: "Insert Score Count by Instructor (Bar Chart)",
      icon: "👨‍🏫",
    },
    {
      name: "Insert Score Count by Student (Bar Chart)",
      icon: "🧑‍🎓",
    },
    {
      name: "Score Deviation from Maximum (Line Graph)",
      icon: "📉",
    },
    {
      name: "Unit Performance vs. Overall Average (Bar Chart)",
      icon: "📊",
    },
    {
      name: "Monthly Performance Comparison by Unit (Grouped Bar Chart)",
      icon: "📊",
    },
    {
      name: "Main Criteria Distribution Over Time (Line Graph)",
      icon: "📈",
    },
    {
      name: "Extra Criteria Distribution Over Time (Line Graph)",
      icon: "📈",
    },
    {
      name: "Cumulative Insert Score Over Time (Area Chart)",
      icon: "📈",
    },
    {
      name: "Criteria Type by Course Category (Pie Chart)",
      icon: "🥧",
    },
    {
      name: "Insert Score Range Distribution (Histogram)",
      icon: "📊",
    },
    {
      name: "Monthly Insert Activity (Calendar Heatmap)",
      icon: "📅",
    },
    {
      name: "Unit-wise Attained Score Progress (Line Graph)",
      icon: "📈",
    },
    {
      name: "Unit-wise Maximum Score Progress (Line Graph)",
      icon: "📈",
    },
    {
      name: "Insert Score Count per Day of Week (Bar Chart)",
      icon: "📆",
    },
    {
      name: "Insert Score Count per Hour of Day (Bar Chart)",
      icon: "🕒",
    },
    {
      name: "Score Type Proportion per Unit (Stacked Bar)",
      icon: "📊",
    },
    {
      name: "Insert Score vs. Time Spent (Scatter Plot)",
      icon: "🔘",
    },
    {
      name: "Criteria Fulfillment Rate by Category (Donut Chart)",
      icon: "🍩",
    },
    {
      name: "Insert Score Median vs. Mean by Unit (Box Plot)",
      icon: "📦",
    },
  ];


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
        <span className='pl-2 text-md'>Curve Editor</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2">
        <div className='w-full flex flex-col border-2 h-full border-blue-200 rounded-md p-1'>

          <div className=" h-full overflow-hidden w-full my-2">
            {/* <div className=" h-1/2 flex flex-col border border-gray-200  ">

              <div className="flex-1 overflow-auto  p-1 ">
                <div className="space-y-1">
                  {chart.map((chart, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 border px-2 py-1 rounded-md hover:bg-blue-100 cursor-pointer"
                    >
                      <span className="text-xl">{chart.icon}</span>
                      <span className="text-sm text-gray-700">{chart.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div> */}
            <div className=" h-1/2 flex flex-col border border-gray-200  ">
              <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
                <h2 className="text-sm font-semibold">Curve</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { }} title="Create Material" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                    <RefreshCw className="w-4 h-4 hover:text-green-600" onClick={() => setScoreAdd(true)} />
                  </button>
                  <button onClick={handleDeleteCurve} title="Delete Curve" className='text-red-600 hover:text-red-800 cursor-pointer'>
                    <FolderOutput className="w-4 h-4 hover:text-blue-600" />
                  </button>

                </div>
              </div>
              <div className="flex-1 overflow-auto px-3 ">
                <div className="flex-1 border-2 border-blue-200 rounded-md overflow-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="p-1 border">Entities</th>
                        <th className="p-1 border">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curves.map((curve) => (
                        <tr
                          key={curve.id}
                          className={`cursor-pointer hover:bg-blue-50 ${selectedCurveId === curve.id ? 'bg-blue-100' : ''}`}
                          onClick={() => setSelectedCurveId(curve.id)}
                        >
                          <td className="p-1 border">{curve.name}</td>
                          <td className="p-1 border">{curve.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="h-1/2 flex flex-col border border-gray-200">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm rounded-t cursor-pointer ${activeAdjustPropertieTab === 'Indicators'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Indicators')}
                >
                  Indicators
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-t cursor-pointer ${activeAdjustPropertieTab === 'Loads'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Loads')}
                >
                  Loads
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full">
                {activeAdjustPropertieTab === 'Indicators' && (
                  <div className="text-sm text-gray-600 mt-2 w-full">
                    <h2 className="text-xl font-bold mb-2">Neuro Indicators Table</h2>
                    <IndicatorTable />
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-1">Neuro-Indicator Trends for Proficiency</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* You will pass each RMS label to this chart component */}
                        <LineChart title="RMS (L) - Frontal Lobe vs. PP ID" />
                        <LineChart title="RMS (L) - Occipital Lobe vs. PP ID" />
                        {/* Add all 8 charts here */}
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-1">Neuro-Indicator Trends for Growth</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Add 8 more charts for growth */}
                        <LineChart title="RMS (R) - Frontal Lobe vs. PP ID" />
                      </div>
                    </div>
                  </div>
                )}

                {activeAdjustPropertieTab === 'Loads' && (

                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
                    <h2 className="text-xl font-bold mb-2">Cognitive Load Table</h2>
                    <LoadTable />
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-1">PP ID Range Plot</h3>
                      <LineChart title="PP ID Range Plot" />
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-1">Critical Reference Date Plot</h3>
                      <LineChart title="Critical Reference Date Plot" />
                    </div>
                  </div>


                )}
              </div>
            </div>
          </div>
        </div>

      </div>








    </>
  );
}

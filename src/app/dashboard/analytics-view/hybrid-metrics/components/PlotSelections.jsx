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


const renderScatter = (tableData, xKey, yKey, xLabel, yLabel) => (
  <ResponsiveContainer width="100%" height="95%">
    <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
      <CartesianGrid />
      <XAxis dataKey={xKey} name={xLabel}>
        <Label
          value={xLabel}
          position="bottom"
          offset={-2}
          style={{ fontSize: "14px", fontWeight: "500" }}
        />
      </XAxis>

      <YAxis dataKey={yKey} name={yLabel}>
        <Label
          value={yLabel}
          angle={-90}
          position="left"
          offset={-7}
          style={{ fontSize: "14px", fontWeight: "500" }}
        />
      </YAxis>
      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
      <Scatter data={tableData} fill="#3b82f6" />
    </ScatterChart>
  </ResponsiveContainer>
);

const render3DScatter = (tableData) => (
  <Plot
    data={[
      {
        x: tableData.map(r => r.RRN),
        y: tableData.map(r => r.PRN),
        z: tableData.map(r => r.ARN),
        type: "scatter3d",
        mode: "markers",
        marker: { size: 4 }
      }
    ]}
    layout={{
      autosize: true,
      scene: {
        xaxis: { title: "RR" },
        yaxis: { title: "PR" },
        zaxis: { title: "AR" },
      },
      margin: { l: 0, r: 0, b: 0, t: 0 }
    }}
    style={{ width: "100%", height: "100%" }}
  />
);


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



export default function PlotSelections({ selectedSort, unitId, candidateId, unitType, unitSignature, onInteractionClassSelect }) {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);
  const [isSelectedInteractionClass, setIsSelectedInteractionClass] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    {
      name: "Acuity Ratio (AR) vs. Productive Ratio (PR) vs. Receptive Ratio (RR) 3-D Cross Plot",
      icon: "📈",
      type: "scatter-3d", // Z, Y, X
      id: "5"
    },
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
    {
      name: "Acuity Ratio (AR) vs. Productive Ratio (PR) vs. Receptive Ratio (RR) 3-D Cross Plot",
      icon: "📈",
      type: "scatter-3d", // Z, Y, X
      id: "5"
    },
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
          // ppIdFrom: filters?.ppIdFrom ?? undefined,    
          // ppIdTo: filters?.ppIdTo ?? undefined,
          // criticalRefDateFrom: filters?.criticalDateFrom ?? undefined,
          // criticalRefDateTo: filters?.criticalDateTo ?? undefined
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
  }, [unitId, candidateId]);

  console.log("table data: ", tableData);

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
  
              <Line data={positives} dataKey="IC" name="Positive PP IDs"
                type="linear" stroke="#3b82f6" dot />
  
              <Line data={negatives} dataKey="IC" name="Negative PP IDs"
                type="linear" stroke="#ef4444" dot />
            </LineChart>
          </ResponsiveContainer>
        );
  
      case "2": // PR vs RR
        return renderScatter(tableData, "RRN", "PRN", "RR (X)", "PR (Y)");
  
      case "3": // AR vs RR
        return renderScatter(tableData, "RRN", "ARN", "RR (X)", "AR (Y)");
  
      case "4": // PR vs AR
        return renderScatter(tableData, "PRN", "ARN", "AR (X)", "PR (Y)");
  
      case "5": // AR vs PR vs RR — 3D
        return render3DScatter(tableData);

  
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
    <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
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

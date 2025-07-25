'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X } from 'lucide-react';
import ScoringCriteria from './ScoringCriteria';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

export default function PlotSelections() {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [ScoreAdd, setScoreAdd] = useState(false);


  const [points, setPoints] = useState(
    Array.from({ length: 10 }, () => ({ x: '', y: '' }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('IndirectPerformancePoint');
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');


  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: 'A', uv: 400, pv: 240 },
    { name: 'B', uv: 300, pv: 139 },
    { name: 'C', uv: 200, pv: 980 },
  ];

  const chart = [
    { icon: "📊", name: "Bar Chart" },
    { icon: "📈", name: "Line Chart" },
    { icon: "📉", name: "Area Chart" },
    { icon: "🧮", name: "Scatter Chart" },
    { icon: "🧊", name: "Pie Chart" },
  ]

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
        <span className='pl-2 text-md'>Plot Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2">
        <div className='w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1'>
          <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
            <h2 className="text-sm font-semibold">Plots</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreateMaterial(true)} title="Create Material" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <Plus className="w-4 h-4 hover:text-green-600" onClick={() => setScoreAdd(true)} />
              </button>
              <button onClick={handleDeleteCurve} title="Delete Curve" className='text-red-600 hover:text-red-800 cursor-pointer'>
                <Trash2 className="w-4 h-4 hover:text-red-600" />
              </button>
              <button title="Search Curve" className='text-gray-600 hover:text-gray-800 cursor-pointer' >
                <Search className="w-4 h-4 hover:text-gray-500" />
              </button>
            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className=" h-1/2 flex flex-col border border-gray-200  ">

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

            </div>


            <div className="h-1/2 flex flex-col border border-gray-200">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm rounded-t cursor-pointer ${activeAdjustPropertieTab === 'Property editor'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Property editor')}
                >
                  Property editor
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-t cursor-pointer ${activeAdjustPropertieTab === 'Table'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Table')}
                >
                  Table
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full">
                {activeAdjustPropertieTab === 'Property editor' && (
                  <div className="text-sm text-gray-600 mt-2 w-full">

                  </div>
                )}

                {activeAdjustPropertieTab === 'Table' && (

                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
                    <table className="table-auto w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1">Name</th>
                          <th className="border px-2 py-1">UV</th>
                          <th className="border px-2 py-1">PV</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-2 py-1">A</td>
                          <td className="border px-2 py-1">400</td>
                          <td className="border px-2 py-1">240</td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1">B</td>
                          <td className="border px-2 py-1">300</td>
                          <td className="border px-2 py-1">139</td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1">C</td>
                          <td className="border px-2 py-1">200</td>
                          <td className="border px-2 py-1">980</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-blue-200 rounded-md bg-gray-100 ">
          <div className="h-full overflow-auto  m-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
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

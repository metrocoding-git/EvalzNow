'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy, Search, X } from 'lucide-react';
import ScoringCriteria from './ScoringCriteria';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function CurveEditor() {
  const [curves, setCurves] = useState([{ id: 1, name: 'curve1' }, { id: 2, name: 'curve2' }, { id: 3, name: 'curve3' }, { id: 4, name: 'curve4' }, { id: 5, name: 'curve5' }, { id: 6, name: 'curve6' }, { id: 7, name: 'curve7' }, { id: 8, name: 'curve8' }, { id: 9, name: 'curve9' }, { id: 10, name: 'curve10' }, { id: 11, name: 'curve11' }, { id: 12, name: 'curve12' },]);
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
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');


  const canvasRef = useRef(null);

  // Example line chart data
  const data = [
    { name: "Completed", value: 400 },
    { name: "In Progress", value: 300 },
    { name: "Pending", value: 200 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const chart = [
    { name: "Global Signature Case Profile Percentages", icon: "🥧", type: "pie" },
    { name: "Global Unit Type Percentages", icon: "🥧", type: "pie" },
    { name: "Global Candidate-to-Leader Percentages", icon: "🥧", type: "pie" },
    { name: "Global Benchmark Count Percentages", icon: "🥧", type: "pie" },
    { name: "Global Assessment Block Count Percentages", icon: "🥧", type: "pie" },
    { name: "Global Attendance Percentages", icon: "🥧", type: "pie" },
    { name: "Global Open Action Item Percentages", icon: "🥧", type: "pie" },
    { name: "Global Percentage of Positive Candidate Marks", icon: "🥧", type: "pie" },
    { name: "Global Percentage of Positive Leader Marks", icon: "🥧", type: "pie" },
    { name: "Global Unit Outcome Passing Percentages", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Equivalent Proficiency - XEP", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XRR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XLR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XWR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XSR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XTR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XPR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XRVSR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XPVSR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Unilateral Proficiency - XAVSR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Composite Proficiency - XCP", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Band Proficiency - XBP", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Stability in Proficiency - STA/P", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Butler Interaction Proficiency - MSIP", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Interaction Class - IC", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Equivalent Growth - GEQ", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Growth - ∆RR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Growth - ∆PR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Average Growth - ∆AR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Cumulative Growth - ∆RR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Cumulative Growth - ∆PR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Cumulative Growth - ∆AR", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Stability in Growth - STA/G", icon: "🥧", type: "pie" },
    { name: "Global Percentages of Utilization Rates", icon: "🥧", type: "pie" }
  ];




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

          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className=" h-full flex flex-col border border-gray-200  ">

              <div className="flex-1 overflow-auto  p-1 ">
                <div className="space-y-1">
                  {chart.map((chart, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 border px-2 py-1 rounded-md hover:bg-blue-100 cursor-pointer ${index == 0 ? 'bg-blue-300' : ''}`}
                    >
                      <span className="text-xl">{chart.icon}</span>
                      <span className="text-sm text-gray-700">{chart.name}</span>
                      <span className="text-sm text-gray-400">{chart.type}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>


          </div>
        </div>

        <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-blue-200 rounded-md bg-gray-100">
          <div className="h-full overflow-auto m-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Global Signature Case Profile Percentages</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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

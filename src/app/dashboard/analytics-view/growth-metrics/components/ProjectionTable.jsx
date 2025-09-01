"use client";
import React, { useState } from "react";

export default function ProjectionTable({ visible, onClose }) {
  if (!visible) return null; // Hide when not visible

  const columns = [
    "Callout","PP ID","RRN","PRN","ARN","IC","ΔRRN","ΔPRN","ΔARN","Day Count"
  ];

  const samplePPIds = [1, 2, 3, 4, 5]; // sample PP ID options

  const [rows, setRows] = useState([
    { Callout: "First PP Selection", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Second PP Selection", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Third PP Selection", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Projection Termination Point", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Overshoot", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Undershoot", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Average", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Overshoot", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
    { Callout: "Undershoot", PP_ID: 0, RRN: 0, PRN: 0, ARN: 0, IC: 0, ΔRRN: 0, ΔPRN: 0, ΔARN: 0, DayCount: 0 },
  ]);

  const handlePPChange = (idx, value) => {
    setRows(prev =>
      prev.map((row, i) => (i === idx ? { ...row, PP_ID: value } : row))
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl p-4 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Projection Table</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            X
          </button>
        </div>

        <div className="w-full overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-2 py-1 border border-gray-300 font-semibold text-gray-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 cursor-default transition-colors">
                  <td className="px-2 py-1 border border-gray-300">{row.Callout}</td>
                  <td className="px-2 py-1 border border-gray-300">
                    <select
                      className="border rounded px-1 py-0.5 w-full text-xs"
                      value={row.PP_ID}
                      onChange={(e) => handlePPChange(idx, Number(e.target.value))}
                    >
                      <option value={0}>--Select--</option>
                      {samplePPIds.map((id) => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1 border border-gray-300">{row.RRN}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.PRN}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.ARN}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.IC}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.ΔRRN}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.ΔPRN}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.ΔARN}</td>
                  <td className="px-2 py-1 border border-gray-300">{row.DayCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

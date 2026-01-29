"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUnit } from "@/context/UnitContext";
import { getUnitById } from "@/services/unitService";

export default function BenchmarkTable({ onClose, selectedBenchmarks }) {
  const { selectedUnitId } = useUnit();
  const [benchmarkList, setBenchmarkList] = useState([]);   // <-- incoming benchmark data
  const [rows, setRows] = useState([]);                     // <-- editable table rows
  const [loading, setLoading] = useState(false);

  // Load Benchmark Data
  // Load Benchmark Data
  useEffect(() => {
    if (!selectedUnitId) return;

    const fetchBenchmarkData = async () => {
      try {
        setLoading(true);
        const data = await getUnitById(selectedUnitId);
        const benchmarks = data.benchmarks || [];
        setBenchmarkList(benchmarks);

        // Initialize rows with pre-selected benchmarks
        const initializedRows = benchmarks.map((b, index) => {
          // Check if this benchmark is already selected
          const isAlreadySelected = selectedBenchmarks.some(
            selected => Number(selected) === Number(b.benchmarkId)
          );
          
          return {
            rowId: index + 1,
            benchmarkId: b.benchmarkId || "",
            benchmarkType: b.benchmarkType || "",
            benchmarkRef: b.benchmarkRef || "",
            benchmarkDescription: b.benchmarkDescription || "",
            isSelected: isAlreadySelected // Pre-select based on selectedBenchmarks
          };
        });

        setRows(initializedRows);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarkData();
  }, [selectedUnitId, selectedBenchmarks]);

  // When selecting Benchmark ID from dropdown
  const handleBenchmarkIdChange = (rowId, value) => {
    const selectedBench = benchmarkList.find(b => String(b.benchmarkId) === String(value));

    setRows(prev =>
      prev.map(row =>
        row.rowId === rowId
          ? {
              ...row,
              benchmarkId: value,
              benchmarkType: selectedBench?.benchmarkType || "",
              benchmarkRef: selectedBench?.benchmarkRef || "",
              benchmarkDescription: selectedBench?.benchmarkDescription || "",
              isSelected: true // Auto-select when chosen from dropdown
            }
          : row
      )
    );
  };

  // toggle row selection
  const handleRowClick = (rowId) => {
    setRows(prev =>
      prev.map(row =>
        row.rowId === rowId ? { ...row, isSelected: !row.isSelected } : row
      )
    );
  };

  
  // Select/Deselect All
  const handleSelectAll = () => {
    const allSelected = rows.every(row => row.isSelected);
    setRows(prev =>
      prev.map(row => ({ ...row, isSelected: !allSelected }))
    );
  };

 
  // In BenchmarkTable component
  const handleCloseClick = () => {
    const selectedRows = rows.filter(row => row.isSelected);
    
    // Return only the benchmarkIds
    const selectedBenchmarkIds = selectedRows.map(r => Number(r.benchmarkId));
    
    // Pass the array of benchmark IDs
    onClose(selectedBenchmarkIds);
  };
  

  const selectedCount = rows.filter(row => row.isSelected).length;
  const totalCount = rows.length;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white shadow-xl w-11/12 max-w-4xl max-h-[80vh] overflow-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Create Benchmark Links</h2>
          <X className="w-5 h-5 text-gray-500 cursor-pointer" onClick={handleCloseClick} />
        </div>

        {/* Table */}
        <div className="p-4 overflow-x-auto">
          <table className="min-w-max border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Link</th>
                <th className="px-4 py-2 border">Benchmark ID</th>
                <th className="px-4 py-2 border">Benchmark Type</th>
                <th className="px-4 py-2 border">Benchmark Ref</th>
                <th className="px-4 py-2 border">Benchmark Description</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.benchmarkId || index}
                  onClick={() => handleRowClick(row.rowId)}
                  className={`cursor-pointer transition-colors ${
                    row.isSelected 
                      ? "bg-blue-50 hover:bg-blue-100" 
                      : "hover:bg-gray-50"
                  } ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 border text-center">
                    <input
                      type="checkbox"
                      checked={row.isSelected}
                      readOnly
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-4 py-3 border">
                    <span className="font-medium text-gray-900">{row.benchmarkId}</span>
                  </td>
                  <td className="px-4 py-3 border">
                      {row.benchmarkType}
                  </td>
                  <td className="px-4 py-3 border text-gray-700">{row.benchmarkRef}</td>
                  <td className="px-4 py-3 border text-gray-600">{row.benchmarkDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button onClick={handleCloseClick} className={`px-4 py-2 text-white bg-gray-600 hover:bg-gray-700`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

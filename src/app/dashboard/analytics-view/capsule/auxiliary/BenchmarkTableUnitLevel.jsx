"use client";
import { getActiveCapsuleId } from "@/lib/activeEntity";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getCapsuleAsUnit as getUnitById } from "@/services/capsuleAnalyticsService";

export default function BenchmarkTableUnitLevel({ onClose, selectedBenchmarks }) {
  // const { selectedUnitId } = useUnit();
  const selectedUnitId = getActiveCapsuleId();
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
  const handleCancel = () => {
    onClose(null); // 
  };
  
  //  Save + close modal
  const handleSaveAndClose = () => {
    const selectedRows = rows.filter(row => row.isSelected);
    const selectedBenchmarkIds = selectedRows.map(r => Number(r.benchmarkId));
  
    onClose(selectedBenchmarkIds); // 
  };
  

  const selectedCount = rows.filter(row => row.isSelected).length;
  const totalCount = rows.length;

  return (
    <div className="fixed inset-0 bg-black/0 backdrop-blur-xs flex justify-center items-center z-50 border shadow-2xl border-gray-200">
      <div className="bg-white w-[650px] border shadow-2xl border-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center  bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Create Benchmark Links</h2>
          <button onClick={handleCancel} className="cursor-pointer p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Table */}
        <div className="p-4 overflow-x-auto text-xs flex justify-center">
          <table className="min-w-max border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border">Link</th>
                <th className="px-2 py-1 border">Benchmark ID</th>
                <th className="px-2 py-1 border">Benchmark Type</th>
                <th className="px-2 py-1 border">Benchmark Ref</th>
                <th className="px-2 py-1 border">Benchmark Description</th>
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
                  <td className="px-2 py-1 border text-center">
                    <input
                      type="checkbox"
                      checked={row.isSelected}
                      readOnly
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-2 py-1 border">
                    <span className="font-medium text-gray-900">{row.benchmarkId}</span>
                  </td>
                  <td className="px-2 py-1 border">
                      {row.benchmarkType}
                  </td>
                  <td className="px-2 py-1 border text-gray-700">{row.benchmarkRef}</td>
                  <td className="px-2 py-1 border text-gray-600">{row.benchmarkDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 py-2 px-6 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end items-center ">
            <button
              onClick={handleSaveAndClose}
              disabled={selectedCount < 1}
              className={`px-4 py-1 text-sm transition-colors bg-gray-200 hover:bg-gray-300 `}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

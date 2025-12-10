"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUnit } from "@/context/UnitContext";
import { getUnitById } from "@/services/unitService";

export default function BenchmarkTable({ onClose }) {
  const { selectedUnitId } = useUnit();
  const [benchmarkList, setBenchmarkList] = useState([]);   // <-- incoming benchmark data
  const [rows, setRows] = useState([]);                     // <-- editable table rows
  const [loading, setLoading] = useState(false);

  // Load Benchmark Data
  useEffect(() => {
    if (!selectedUnitId) return;

    const fetchBenchmarkData = async () => {
      try {
        setLoading(true);
        const data = await getUnitById(selectedUnitId);

        const benchmarks = data.benchmarks || [];

        setBenchmarkList(benchmarks);

        // Initialize table rows based on number of benchmark objects
        const initializedRows = benchmarks.map((b, index) => ({
          rowId: index + 1,
          benchmarkId: b.benchmarkId || "",
          benchmarkType: b.benchmarkType || "",
          benchmarkRef: b.benchmarkRef || "",
          benchmarkDescription: b.benchmarkDescription || "",
          isSelected: false
        }));

        setRows(initializedRows);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarkData();
  }, [selectedUnitId]);

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
              benchmarkDescription: selectedBench?.benchmarkDescription || ""
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

  // close + return selected rows
  const handleCloseClick = () => {
    const selectedRows = rows.filter(row => row.isSelected);
    onClose(selectedRows);
  };

  const selectedCount = rows.filter(row => row.isSelected).length;

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
                  key={index}
                  onClick={() => handleRowClick(row.rowId)}
                  className={`cursor-pointer ${row.isSelected ? "bg-gray-100" : ""}`}
                >
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={row.isSelected}
                      readOnly
                    />
                  </td>

                  {/* Benchmark ID dropdown */}
                  <td className="px-4 py-2 border">{row.benchmarkId}</td>
                  <td className="px-4 py-2 border text-center">{row.benchmarkType}</td>
                  <td className="px-4 py-2 border text-center">{row.benchmarkRef}</td>
                  <td className="px-4 py-2 border text-center">{row.benchmarkDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleCloseClick}
            disabled={selectedCount < 1}
            className={`px-4 py-2 text-white ${
              selectedCount >= 1
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Search,
  X,
  FolderSync,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const CompetencyAccountingTable = ({ data }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Indirect");
  const [filteredData, setFilteredData] = useState([]);

  // Filter data based on active tab
  useEffect(() => {
    const filtered = data.filter(row => {
      // Ensure ppId is treated as a string
      const ppId = String(row.ppId || "");
      return activeTab === "Indirect"
        ? ppId.startsWith("-")
        : !ppId.startsWith("-");
    });
    setFilteredData(filtered);
    
    // Reset selection when tab changes
    setSelectedRow(null);
  }, [data, activeTab]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveRowUp();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveRowDown();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRow, filteredData]);

  const moveRowUp = () => {
    if (selectedRow === null) {
      // If nothing selected, select the last row
      setSelectedRow(filteredData.length - 1);
    } else if (selectedRow > 0) {
      setSelectedRow(selectedRow - 1);
    }
  };

  const moveRowDown = () => {
    if (selectedRow === null) {
      // If nothing selected, select the first row
      setSelectedRow(0);
    } else if (selectedRow < filteredData.length - 1) {
      setSelectedRow(selectedRow + 1);
    }
  };

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index);
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      // Here you would typically update your data state
      // For now, we'll just deselect
      setSelectedRow(null);
    }
  };

  return (
    <div className="overflow-x-auto border-1 border-gray-200 shadow-sm">
      {/* Tab Buttons */}
      <div className="flex flex-col">
        <div>
          <h2 className="text-md font-semibold bg-gray-100 p-0.5 pl-2 flex items-center border-b border-gray-200">
            Competency Accounting
            <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
          </h2>
        </div>

        <div className="flex items-center justify-between border-b p-1 bg-gray-100">
          {/* Tab Buttons */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm cursor-pointer ${
                activeTab === "Indirect"
                  ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("Indirect")}
            >
              Indirect Performance Points (Sub)
            </button>
            <button
              className={`px-3 py-1 text-sm cursor-pointer ${
                activeTab === "Direct"
                  ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("Direct")}
            >
              Direct Performance Points (Sub)
            </button>
          </div>

          {/* Right side buttons */}
          <div className="mr-1 flex items-center">
            <button
              title="Add new"
              className="p-1.5 text-gray-600 hover:text-black transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {selectedRow !== null && (
              <button
                className="p-1.5 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                onClick={handleDelete}
                title="Delete selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={moveRowUp}
              title="Move Up"
              className="text-gray-600 hover:text-black cursor-pointer p-1.5"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={moveRowDown}
              title="Move Down"
              className="text-gray-600 hover:text-black cursor-pointer p-1.5"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <table className="min-w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-900">
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 border-1 border-gray-300">Master PP ID Callout</th>
            <th className="px-4 py-3 border-1 border-gray-300">Short Description</th>
            <th className="px-4 py-3 border-1 border-gray-300">Duration</th>
            <th className="px-4 py-3 border-1 border-gray-300">Critical Reference Date</th>
            <th className="px-4 py-3 border-1 border-gray-300">Missing Competencies</th>
            <th className="px-4 py-3 border-1 border-gray-300">Error</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <tr
                key={index}
                className={`border-t border-gray-100 hover:bg-gray-50 transition ${
                  index === selectedRow ? "bg-gray-100" : ""
                }`}
                onClick={() => handleRowClick(index)}
              >
                <td className="px-4 py-2">{row.ppId}</td>
                <td className="px-4 py-2">{row.shortDescription}</td>
                <td className="px-4 py-2">{row.duration}</td>
                <td className="px-4 py-2">{row.criticalRefDate}</td>
                <td className="px-4 py-2">{row.missingCompetencies}</td>
                <td className="px-4 py-2">{row.error}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                No data available for {activeTab === "Indirect" ? "Indirect" : "Direct"} Performance Points
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompetencyAccountingTable;
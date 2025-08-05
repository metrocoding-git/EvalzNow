"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, ChevronUp } from "lucide-react";
import CompetencyAccountingTable from "./components/CompetencyAccountingTable";
import MasterPpIdBinTable from "./components/MasterPpIdBinTable";

const masterPPIDData = [
  {
    ppId: -2,
    unitName: "Unit A",
    unitId: "UA123",
    unitType: "Type X",
    attainedListening: 85,
    maxListening: 100,
    attainedReading: 78,
    maxReading: 100,
    attainedSpeaking: 92,
    maxSpeaking: 100,
    attainedWriting: 88,
    maxWriting: 100,
  },
  {
    ppId: 1,
    unitName: "Unit B",
    unitId: "UB456",
    unitType: "Type Y",
    attainedListening: 75,
    maxListening: 90,
    attainedReading: 80,
    maxReading: 95,
    attainedSpeaking: 70,
    maxSpeaking: 85,
    attainedWriting: 60,
    maxWriting: 80,
  },
];

const competencyData = [
  {
    ppId: -2,
    shortDescription: "Short desc 1",
    duration: 3,
    criticalRefDate: "2025-07-01",
    missingCompetencies: "Writing",
    error: "Yes",
  },
  {
    ppId: 1,
    shortDescription: "Short desc 2",
    duration: 5,
    criticalRefDate: "2025-07-22",
    missingCompetencies: "None",
    error: "No",
  },
];

const activatedCandidates = [
  {
    lastName: "John",
    firstName: "Doe",
    ppId: 1,
    status: "Activated",
  },
  {
    lastName: "Jane",
    firstName: "Smith",
    ppId: 2,
    status: "Activated",
  },
];

export default function PreviewPage() {
  const [open, setOpen] = useState(true);
  const [sortKey, setSortKey] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedCandidates = [...activatedCandidates].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-80 flex flex-col border-2 h-full border-gray-200">
        <div className="flex-grow flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
            <div className="grid grid-cols-3 gap-1 text-gray-800 font-semibold text-sm w-full">
              {["firstName", "lastName", "ppId"].map((col) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className="flex items-center space-x-1 hover:underline"
                >
                  <span className="capitalize">
                    {col === "ppId" ? "ID" : col.replace(/([A-Z])/g, " $1")}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => console.log("Add")}
              className="hover:bg-gray-300 text-gray-950 text-sm p-1 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown toggle */}
          <div
            className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-4 py-2"
            onClick={() => setOpen(!open)}
          >
            <span
              className={`transition-transform duration-200 text-gray-600 mr-1 ${
                open ? "rotate-90" : "rotate-0"
              }`}
            >
              <ChevronRight />
            </span>
            <span
              className={`text-md text-gray-800 ml-2 ${
                open ? "font-bold text-black" : ""
              }`}
            >
              Activated Candidates
            </span>
          </div>

          {/* Candidate List */}
          {open && (
            <div className="p-2 space-y-1">
              {sortedCandidates.length === 0 ? (
                <p className="text-xs text-gray-500">No activated candidates.</p>
              ) : (
                sortedCandidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 text-sm text-gray-700 gap-2 hover:bg-gray-50 px-3 py-1 cursor-pointer"
                  >
                    <div>{candidate.lastName}</div>
                    <div>{candidate.firstName}</div>
                    <div>{candidate.ppId}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 bg-white flex flex-col border-1 h-full border-gray-200 ml-1 overflow-y-auto">
        <div className="h-full flex flex-col mx-2 my-3">
          <h1 className="text-xl font-bold px-3 pb-2 border-b border-gray-200">
            Preliminary Checkpoints
          </h1>

          {/* Master PP ID Bin Totals */}
          <div className="px-4 mt-4">
            <h2 className="text-md font-semibold text-gray-700 mb-2">
              Master PP ID Bin Totals
            </h2>
            <MasterPpIdBinTable data={masterPPIDData} />
          </div>

          {/* Competency Accounting Table */}
          <div className="px-4 mt-6 mb-6">
            <h2 className="text-md font-semibold text-gray-700 mb-2">
              Competency Accounting
            </h2>
            <CompetencyAccountingTable data={competencyData} />
          </div>
        </div>
      </div>
    </div>
  );
}

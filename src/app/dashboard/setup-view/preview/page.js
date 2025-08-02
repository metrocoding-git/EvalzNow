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
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <span className="grid grid-cols-3 gap-4 pl-2 text-blue-800 font-semibold text-sm">
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => handleSort("firstName")}
              >
                First Name
                {sortKey === "firstName" ? (
                  sortOrder === "asc" ? (
                    <ChevronUp className="ml-1 w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="ml-1 w-4 h-4 text-blue-600" />
                  )
                ) : (
                  <ChevronDown className="ml-1 w-4 h-4 text-gray-400" />
                )}
              </div>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("lastName")}
              >
                Last Name
                {sortKey === "lastName" ? (
                  sortOrder === "asc" ? (
                    <ChevronUp className="ml-1 w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="ml-1 w-4 h-4 text-blue-600" />
                  )
                ) : (
                  <ChevronDown className="ml-1 w-4 h-4 text-gray-400" />
                )}
              </div>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("ppId")}
              >
                ID
                {sortKey === "ppId" ? (
                  sortOrder === "asc" ? (
                    <ChevronUp className="ml-1 w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="ml-1 w-4 h-4 text-blue-600" />
                  )
                ) : (
                  <ChevronDown className="ml-1 w-4 h-4 text-gray-400" />
                )}
              </div>
            </span>
          </div>

          {/* Dropdown Toggle */}
          <div
            className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <ChevronDown className="w-4 h-4 text-gray-600 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 mr-1" />
            )}
            <span className="text-sm text-gray-600">Details</span>
          </div>

          {/* Dropdown Content */}
          {open && (
            <div className="p-2 space-y-2">
              {activatedCandidates.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No activated candidates.
                </p>
              ) : (
                sortedCandidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 text-sm text-gray-700 gap-4 bg-blue-50 rounded px-2 py-1"
                  >
                    <div>{candidate.lastName}</div>
                    <div> {candidate.firstName}</div>
                    <div>{candidate.ppId}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 bg-white overflow-y-auto h-full">
        <div className="h-full border-2 border-blue-200 rounded-md flex flex-col mx-1">
          <h1 className="text-xl ml-2 p-3 font-bold">
            Preliminary Checkpoints
          </h1>

          {/* Master PP ID Bin Totals Table */}
          <div className="px-4">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              Master PP ID Bin Totals
            </h2>
            <MasterPpIdBinTable data={masterPPIDData} />
          </div>

          {/* Competency Accounting Table */}
          <div className="px-4 mt-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              Competency Accounting
            </h2>
            <CompetencyAccountingTable data={competencyData} />
          </div>
        </div>
      </div>
    </div>
  );
}

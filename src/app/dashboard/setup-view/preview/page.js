"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import CompetencyAccountingTable from "./components/CompetencyAccountingTable";
import MasterPpIdBinTable from "./components/MasterPpIdBinTable";
import ClientEditor from "../../analytics-view/components/ClientEditor";

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
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

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

  // Select first candidate on page load
  useEffect(() => {
    if (sortedCandidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(sortedCandidates[0]);
    }
  }, [sortedCandidates, selectedCandidate]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-gray-200">
        <div className="flex-grow flex flex-col">
          {/* Header */}
          <div className="flex flex-col justify-between items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
            <div className="relative w-full mb-2">
              <input
                type="text"
                className="border w-full pl-2 pr-8 py-1 text-sm"
                placeholder="Search"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
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

            {/* <button
              onClick={() => console.log("Add")}
              className="hover:bg-gray-300 text-gray-950 text-sm p-1 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button> */}
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
              Details
            </span>
          </div>

          {/* Candidate List */}
          {open && (
            <div className="p-2 space-y-1">
              {/* Session Info */}
              <div className="px-4 ">
                <div className="border border-gray-200 p-2 ">
                  <p className="text-sm text-gray-600">Unit Name: Unit 1</p>
                  <p className="text-sm text-gray-600">Unit ID: UA123</p>
                  <p className="text-sm text-gray-600">Unit Type: Group</p>
                  <p className="text-sm text-gray-600">
                    Signature Profile: Signature 1
                  </p>
                </div>
              </div>

              {sortedCandidates.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No activated candidates.
                </p>
              ) : (
                sortedCandidates.map((candidate, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`grid grid-cols-3 text-sm gap-2 px-3 py-1 cursor-pointer ${
                      selectedCandidate?.ppId === candidate.ppId
                        ? "bg-blue-100 border-l-4 border-blue-400 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div>{candidate.lastName}</div>
                    <div>{candidate.firstName}</div>
                    <div>{candidate.ppId}</div>
                  </div>
                ))
              )}
            </div>
          )}

           {/* Editor Panel */}
          <div className="h-2/5 overflow-auto my-2">
            <ClientEditor
              onClose={() => setShowEdit(false)}
              entity={selectedCandidate}
              showForm={showEdit}
            />
          </div>
        </div>
        
         
        
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col border-l border-gray-200 ml-1 overflow-y-auto">
        <div className="h-full flex flex-col mx-2 my-3">
          <h1 className="text-xl font-bold px-3 pb-2 border-b border-gray-200">
            Preliminary Checkpoints
          </h1>

          {selectedCandidate && (
            <>
              {/* Master PP ID Bin Totals */}
              <div className="px-2 mt-4">
                <h2 className="text-md font-semibold text-gray-700 mb-2">
                  Master PP ID Bin Totals
                </h2>
                <MasterPpIdBinTable data={masterPPIDData} />
              </div>

              {/* Competency Accounting Table */}
              <div className="px-2 mt-4 mb-4">
                <h2 className="text-md font-semibold text-gray-700 mb-2">
                  Competency Accounting
                </h2>
                <CompetencyAccountingTable data={competencyData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

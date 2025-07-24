"use client";

import { useState } from "react";
import clsx from "clsx";
import { Plus } from "lucide-react";
import CompetencyAccountingTable from "./components/CompetencyAccountingTable";
import MasterPpIdBinTable from "./components/MasterPpIdBinTable";


// Dummy data for preview (replace with actual fetched/prop data)
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

export default function PreviewPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <span className="text-blue-800 font-semibold text-sm">Preview</span>
            <button
              onClick={() => setOpen(!open)}
              className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown Toggle */}
          <div
            className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
            onClick={() => setOpen(!open)}
          >
            <span
              className={clsx(
                "transition-transform duration-200 text-gray-600 mr-1",
                { "rotate-90": open, "rotate-0": !open }
              )}
            >
              ▶
            </span>
            <span className="text-sm text-gray-600">Details</span>
          </div>

          {/* Dropdown Content */}
          {open && (
            <div className="p-2">
              <p className="text-sm text-gray-700">
                This is the preview content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 bg-white overflow-y-auto h-full">
        <div className="h-full border-2 border-blue-200 rounded-md flex flex-col mx-1">
          <h1 className="text-xl ml-2 p-3 font-bold">Preliminary Checkpoints</h1>

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

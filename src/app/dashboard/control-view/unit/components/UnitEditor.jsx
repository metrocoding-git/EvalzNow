"use client";
import { useState } from "react";
import { Edit } from "lucide-react";

const UnitEditor = ({ onClose, showForm }) => {
  const [unit, setUnit] = useState({
    unitName: "",
    unitId: "",
    startDate: "",
    endDate: "",
    leaders: [],
    assessors: [],
    director: "",
    unitType: "",
    signatureProfile: "",
    environment: "",
    scoringSystem: "",
    benchmarks: [],
  });

  const handleChange = (field, value) => {
    setUnit((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border-2 border-blue-500 rounded-md flex flex-col h-full">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <Edit className="w-5 h-5" />
          UNIT EDITOR
        </div>
      </div>

      {!showForm ? (
        <div className="p-4 text-gray-500 text-sm">No unit selected.</div>
      ) : (
        <form className="flex flex-col gap-3 p-4 text-xs">
          {[ 
            { label: "Unit Name", key: "unitName" },
            { label: "Unit ID", key: "unitId" },
            { label: "Start Date", key: "startDate", type: "date" },
            { label: "End Date", key: "endDate" },
          ].map(({ label, key, type }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-28">{label}:</label>
              <input
                name={key}
                value={unit[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                type={type || "text"}
                className="border px-2 py-1 flex-grow"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <label className="w-28">Unit Type:</label>
            <select
              name="unitType"
              value={unit.unitType}
              onChange={(e) => handleChange("unitType", e.target.value)}
              className="border px-2 py-1 flex-grow"
            >
              <option value="">Select Unit Type</option>
              <option>Communicative I/O</option>
              <option>Theory & Practice</option>
              <option>Third Parameter</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-28">Signature Profile:</label>
            <select
              name="signatureProfile"
              value={unit.signatureProfile}
              onChange={(e) => handleChange("signatureProfile", e.target.value)}
              className="border px-2 py-1 flex-grow"
            >
              <option value="">Select Profile</option>
              <option>Case 1: Solid Balanced</option>
              <option>Case 2: Rigorous Balanced</option>
              <option>Case 3a: Productive‑Weighted</option>
              <option>Case 3b: Receptive‑Weighed</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-28">Environment:</label>
            <select
              name="environment"
              value={unit.environment}
              onChange={(e) => handleChange("environment", e.target.value)}
              className="border px-2 py-1 flex-grow"
            >
              <option value="">Select Environment</option>
              <option>Workforce</option>
              <option>Classroom</option>
            </select>
          </div>

          {unit.environment === "Workforce" && (
            <div className="flex items-center gap-3">
              <label className="w-28">Scoring System:</label>
              <select
                name="scoringSystem"
                value={unit.scoringSystem}
                onChange={(e) => handleChange("scoringSystem", e.target.value)}
                className="border px-2 py-1 flex-grow"
              >
                <option value="">Select System</option>
                <option>3‑Point</option>
                <option>5‑Point</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4 ">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Close
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UnitEditor;

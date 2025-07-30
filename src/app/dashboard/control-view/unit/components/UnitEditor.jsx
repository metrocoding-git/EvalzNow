"use client";
import { useState } from "react";
import { Edit, X } from "lucide-react";

const UnitEditor = ({ onClose }) => {
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
    <div className="border-2 border-blue-500 rounded-md flex flex-col">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <Edit className="w-5 h-5" />
          Entity Editor - Unit
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-sm hover:bg-red-100 rounded-full p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs p-4">
        {[
          { label: "Unit Name", key: "unitName" },
          { label: "Unit ID", key: "unitId" },
          { label: "Start Date", key: "startDate", type: "date" },
          { label: "End Date", key: "endDate" },
        ].map(({ label, key, type }) => (
          <div key={key} className="flex flex-col">
            <label>{label}:</label>
            <input
              name={key}
              value={unit[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              type={type || "text"}
              className="border px-2 py-1"
            />
          </div>
        ))}

        <label>Unit Type:</label>
        <select
          name="unitType"
          value={unit.unitType}
          onChange={(e) => handleChange("unitType", e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Select Unit Type</option>
          <option>Communicative I/O</option>
          <option>Theory & Practice</option>
          <option>Third Parameter</option>
        </select>

        <label>Signature Profile:</label>
        <select
          name="signatureProfile"
          value={unit.signatureProfile}
          onChange={(e) => handleChange("signatureProfile", e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Select Profile</option>
          <option>Case 1: Solid Balanced</option>
          <option>Case 2: Rigorous Balanced</option>
          <option>Case 3a: Productive‑Weighted</option>
          <option>Case 3b: Receptive‑Weighed</option>
        </select>

        <label>Environment:</label>
        <select
          name="environment"
          value={unit.environment}
          onChange={(e) => handleChange("environment", e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Select Environment</option>
          <option>Workforce</option>
          <option>Classroom</option>
        </select>

        {unit.environment === "Workforce" && (
         
            <div>
              <label>Scoring System:</label>
            <select
              name="scoringSystem"
              value={unit.scoringSystem}
              onChange={(e) => handleChange("scoringSystem", e.target.value)}
              className="border px-2 py-1"
            >
              <option value="">Select System</option>
              <option>3‑Point</option>
              <option>5‑Point</option>
            </select>
            </div>
         
        )}
      </div>
    </div>
  );
};

export default UnitEditor;

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
    <div className="h-full flex flex-col bg-white border border-gray-200">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <Edit className="w-4 h-4" />
          Entity Editor
        </div>
      </div>

      {!showForm ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-sm">No unit selected.</div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <form className="space-y-3 text-sm">
              {[ 
                { label: "Unit Name", key: "unitName" },
                { label: "Unit ID", key: "unitId" },
                { label: "Start Date", key: "startDate", type: "date" },
                { label: "End Date", key: "endDate" },
              ].map(({ label, key, type }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-gray-700 font-medium text-xs">{label}:</label>
                  <input
                    name={key}
                    value={unit[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    type={type || "text"}
                    className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-xs">Unit Type:</label>
                <select
                  name="unitType"
                  value={unit.unitType}
                  onChange={(e) => handleChange("unitType", e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">Select Unit Type</option>
                  <option value="Communicative I/O">Communicative I/O</option>
                  <option value="Theory & Practice">Theory & Practice</option>
                  <option value="Third Parameter">Third Parameter</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-xs">Signature Profile:</label>
                <select
                  name="signatureProfile"
                  value={unit.signatureProfile}
                  onChange={(e) => handleChange("signatureProfile", e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">Select Profile</option>
                  <option value="Case 1: Solid Balanced">Case 1: Solid Balanced</option>
                  <option value="Case 2: Rigorous Balanced">Case 2: Rigorous Balanced</option>
                  <option value="Case 3a: Productive‑Weighted">Case 3a: Productive‑Weighted</option>
                  <option value="Case 3b: Receptive‑Weighed">Case 3b: Receptive‑Weighed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-xs">Environment:</label>
                <select
                  name="environment"
                  value={unit.environment}
                  onChange={(e) => handleChange("environment", e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">Select Environment</option>
                  <option value="Workforce">Workforce</option>
                  <option value="Classroom">Classroom</option>
                </select>
              </div>

              {unit.environment === "Workforce" && (
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium text-xs">Scoring System:</label>
                  <select
                    name="scoringSystem"
                    value={unit.scoringSystem}
                    onChange={(e) => handleChange("scoringSystem", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="">Select System</option>
                    <option value="3‑Point">3‑Point</option>
                    <option value="5‑Point">5‑Point</option>
                  </select>
                </div>
              )}
            </form>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitEditor;
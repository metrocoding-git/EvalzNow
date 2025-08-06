import React from "react";

export default function ReviewCandidate({ candidate }) {
  if (!candidate) {
    return (
      <div className="p-4 text-gray-600">No candidate selected for review.</div>
    );
  }

  // Mock unit data (simulate DB response)
  const mockUnits = [
    { id: "U001", name: "Unit Alpha", status: "Active" },
    { id: "U002", name: "Unit Beta", status: "Inactive" },
    { id: "U003", name: "Unit Gamma", status: "Active" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Reviewing: {candidate.firstName} {candidate.lastName}
      </h2>

      <div className="border-t border-gray-200 pt-2">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          Assigned Units
        </h3>
        <ul className="space-y-2">
          {mockUnits.map((unit) => (
            <li
              key={unit.id}
              className="p-3 bg-gray-100 border border-gray-300 shadow-sm"
            >
              <div className="text-sm text-gray-600">
                Unit ID: {unit.id}
              </div>
              <div className="font-semibold">{unit.name}</div>

              <div className="text-sm text-gray-600">Status: {unit.status}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

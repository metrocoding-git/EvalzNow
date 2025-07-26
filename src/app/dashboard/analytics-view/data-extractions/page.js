"use client";
import { useState } from "react";
import ClientEditor from "../components/ClientEditor";

export default function DataExtractions() {
  const [activeTab, setActiveTab] = useState("Data Extractions");
  const [showEdit, setShowEdit] = useState(true);

  const options = [
    {
      id: "active-unit-candidates",
      label: "Extract Candidate Data for the Active Unit",
    },
    {
      id: "all-units-candidates",
      label: "Extract Candidate Data for All Units in Database",
    },
    {
      id: "all-candidates-database",
      label: "Extract All Candidate Data from Database",
    },
  ];

  return (
    <div className="w-full flex px-4 py-4 gap-4">
      {/* Left panel */}
      <div className="w-1/4 border-r pr-4">
        {showEdit && (
          <div className="h-2/3 border-1 rounded-sm p-1 overflow-auto">
            <ClientEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full bg-white shadow-md rounded-2xl p-6 overflow-y-auto">
        <div className="space-y-4">
          <p className="text-base font-semibold text-gray-800 leading-relaxed">
            EvalzNow – Human Capital & Education Quantitative and Qualitative Assessment Hybrid Proficiency & Growth Monitoring
            <br />
            <span className="text-sm font-medium">
              Candidate-Level Database Pull
            </span>
          </p>

          <div className="space-y-3 text-sm">
            {options.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  id={item.id}
                  type="checkbox"
                  name={item.id}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={item.id} className="text-gray-800">
                  {item.label}
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Extract
          </button>
        </div>
      </div>
    </div>
  );
}

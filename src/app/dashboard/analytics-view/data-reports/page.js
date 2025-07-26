"use client";
import { useState } from "react";
import ClientEditor from "../components/ClientEditor";

export default function DataReports() {
    const [activeTab, setActiveTab] = useState("Data Reports");
     const [showEdit, setShowEdit] = useState(true);

      return (
    <div className="w-full flex px-4 py-4 gap-4 ">
      {/* Left panel */}
      <div className="w-1/4 border-r pr-4">
        {showEdit && (
          <div className="h-2/3 border-1 rounded-sm p-1 overflow-auto ">
            {/* <EditorArea onClose={() => setShowEditor(false)} /> */}
            <ClientEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full bg-white shadow-md rounded-2xl p-6 overflow-y-auto">
        {/* Report Extraction Options */}
        <div className="space-y-4">
          <p className="text-base font-semibold text-gray-800 leading-relaxed">
            EvalzNow – Human Capital & Education Quantitative and Qualitative Assessment Hybrid Proficiency & Growth Monitoring <br />
            <span className="text-sm font-medium">
              Candidate & Unit Report Generation
            </span>
          </p>

          <div className="space-y-3 text-sm">
            {[
              {
                id: "candidate-report",
                label: "Extract Candidate Report for the Active Candidate",
              },
              {
                id: "all-candidates-unit",
                label: "Extract All Candidate Reports for the Active Unit",
              },
              {
                id: "unit-report",
                label: "Extract Unit Report for the Active Unit",
              },
              {
                id: "all-units",
                label: "Extract All Unit Reports",
              },
              {
                id: "global-data",
                label: "Extract Global Data Report",
              },
            ].map((item) => (
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
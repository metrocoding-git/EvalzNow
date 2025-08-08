"use client";

import React, { useState } from "react";
import { Plus, Trash2, Copy, Search, X, FolderSync, ArrowUp, ArrowDown } from "lucide-react";
import ScoringCriteria from "./ScoringCriteria";

const MAIN_CRITERIA = [
  "Communication",
  "Intelligence",
  "Responsiveness",
  "Efficiency",
  "Adaptation",
  "Accuracy",
  "Verbal Reasoning",
  "Spatial Reasoning",
  "Numerical Reasoning",
  "Problem Solving",
  "Memory",
  "Data Checking",
  "Work Sampling",
  "Quality of Work",
  "Resourcefulness",
  "Following Instructions",
  "Working in Teams",
  "Working Alone",
  "Initiative",
  "Sick/Injury Avoidance",
];

export default function CompetencyAccounting() {
  const [scoreAdd, setScoreAdd] = useState(false);
  const [scores, setScores] = useState([]);

  const handleAddScore = (newScore) => {
    setScores((prev) => [...prev, newScore]);
    setScoreAdd(false);
  };

  const [points, setPoints] = useState(
    Array.from({ length: 2 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Indirect");

  const handlePointChange = (index, field, value) => {
    const updated = [...points];
    updated[index][field] = value;
    setPoints(updated);
  };

  const handleDeleteCurve = () => {
    if (scores.length > 0) {
      setScores([]);
    } else {
      alert("No scores to delete.");
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Scoring Criteria is only applicable to the 'Workforce' Environment otherwise disable it. */}

      <div className="flex-grow h-1/2 border-1 border-gray-300  flex flex-col ">
        <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
          <span className="pl-2 text-md">
            Insert Scores for Competency Accounting
          </span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>

        <div className="flex items-center justify-between mb-1 px-1 mx-1 mt-1 pb-0.5 text-gray-700 border-b-2 border-gray-300">
          <h2 className="text-sm font-semibold ">Scoring Criteria</h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setScoreAdd(true)}
              title="Create Material"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteCurve}
              title="Delete Curve"
              className="text-red-600 hover:text-red-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              title="Update"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <FolderSync className="w-3.5 h-3.5 "/>
            </button>

            <button
              title="Move Up"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 "/>
            </button>

            <button
              title="Move Down"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5 "/>
            </button>

            <button
              title="Search Curve"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-3 ">
          <div className="flex-1  overflow-auto">
            {/* Scoring Criteria Table */}
            <table className="w-full mx-auto my-1 text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-1 border-gray-400 px-2 py-1 font-semibold">ID</th>
                  <th className="border-1 border-gray-400 px-2 py-1 font-semibold">
                    Main Criteria
                  </th>
                  <th className="border-1 border-gray-400 px-2 py-1 font-semibold">ID</th>
                  <th className="border-1 border-gray-400 px-2 py-1 font-semibold">
                    Custom Criteria
                  </th>
                </tr>
              </thead>
              <tbody>
                {MAIN_CRITERIA.map((criterion, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-1 border-gray-400 px-2 py-1">{index + 1}</td>
                    <td className="border-1 border-gray-400 px-2 py-1">{criterion}</td>
                    <td className="border-1 border-gray-400 px-2 py-1">{index + 1}</td>
                    <td className="border-1 border-gray-400 px-2 py-1"></td>
                  </tr>
                ))}

               
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="h-1/2 overflow-auto border-1 border-gray-200 mt-0.5">
      <h2> </h2> 
        <div className=" flex flex-col h-full">
          {/* bottom table */}
          <table className="w-full h-full text-left text-sm ">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">First Name</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Last Name</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">CID</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">PP ID</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Duration</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Critical Reference Date</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Task Declaration</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Workflow Stage</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Assessment Type</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Schedule Impact</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Engage Level</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Competency</th>

                {/* MC1 - MC20 */}
                {Array.from({ length: 20 }, (_, i) => (
                  <th key={`mc-${i}`} className="border-1 border-gray-400 px-2 py-1">{`MC${
                    i + 1
                  }`}</th>
                ))}

                {/* CC21 - CC40 */}
                {Array.from({ length: 20 }, (_, i) => (
                  <th key={`cc-${i + 21}`} className="border-1 border-gray-400 px-2 py-1">{`CC${
                    i + 21
                  }`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Data rows can go here later */}
              <tr>
                <td className="border-1 border-gray-400 px-2 py-1 text-center" colSpan={61}>
                  No data available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {scoreAdd && (
        <div className="overflow-auto my-2">
          <ScoringCriteria onClose={() => setScoreAdd(false)} />
        </div>
      )}
    </>
  );
}

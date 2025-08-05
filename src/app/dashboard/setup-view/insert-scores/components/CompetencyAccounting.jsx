"use client";

import React, { useState } from "react";
import { Plus, Trash2, Copy, Search, X } from "lucide-react";
import ScoringCriteria from "./ScoringCriteria";

const PERIOD_TYPES = [
  "Audit/Survey",
  "Blended - Instructor",
  "Blended - Platform",
  "Camp",
  "Case Study",
  "Certification",
  "Coaching",
  "Conditioning",
  "Exam/Test",
  "Experimental",
  "External Eval",
  "Flex",
  "Flipped",
  "Homework",
  "Immersion",
  "Intern/Co-Op",
  "Internal Eval",
  "Lab",
  "LMS - Distance",
  "Online - Distance",
  "Other",
  "Placement",
  "Probationary",
  "Promotion",
  "Pull-Out",
  "Push-In",
  "Reassigned Work",
  "Research/R&D",
  "Reskilling/CPD/CMP",
  "Rework",
  "Rotation",
  "Scaffolding",
  "Seminar",
  "Study Abroad",
  "Summer Program",
  "Training for Trainees",
  "Training for Trainers",
  "Work",
  "Workshop",
  "Work-Study",
];

const INDIRECT_DELIVERY = [
  "After Unit Operations (MISC)",
  "Before Unit Operations (MISC)",
  "Sensitivity or Exploratory Checking",
  "Pre-Employment",
];

const DIRECT_DELIVERY = [
  "During Unit Operations (on-site)",
  "During Unit Operations (practice)",
  "During Unit Operations (remote)",
  "During Unit Operations (training)",
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
      <div className="flex-grow h-1/3 border-1 border-gray-300  flex flex-col ">
        <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
          <span className="pl-2 text-md">
            Insert Scores for Competency Accounting
          </span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>

        <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
          <h2 className="text-sm font-semibold">Scoring Criteria</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScoreAdd(true)}
              title="Create Material"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <Plus className="w-4 h-4 hover:text-green-600" />
            </button>
            <button
              onClick={handleDeleteCurve}
              title="Delete Curve"
              className="text-red-600 hover:text-red-800 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 hover:text-red-600" />
            </button>
            <button
              title="Search Curve"
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <Search className="w-4 h-4 hover:text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-3 ">
          <div className="flex-1 border-2 border-gray-200  overflow-auto">
            {/* Scoring Criteria Table */}
            {scoreAdd && (
              <div className="my-2">
                <ScoringCriteria
                  onClose={() => setScoreAdd(false)}
                  onSubmit={handleAddScore}
                />
              </div>
            )}

            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1">PP ID</th>
                  <th className="border p-1">Duration (hrs)</th>
                  <th className="border p-1">Ref. Date</th>
                  <th className="border p-1">Task</th>
                  <th className="border p-1">Workflow</th>
                  <th className="border p-1">Assessment</th>
                  <th className="border p-1">Schedule Impact</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-400 p-2">
                      No scores added yet.
                    </td>
                  </tr>
                ) : (
                  scores.map((score, i) => (
                    <tr key={i}>
                      <td className="border p-1">{score.ppId}</td>
                      <td className="border p-1">{score.duration}</td>
                      <td className="border p-1">{score.referenceDate}</td>
                      <td className="border p-1">{score.task}</td>
                      <td className="border p-1">{score.workflowStage}</td>
                      <td className="border p-1">{score.assessmentType}</td>
                      <td className="border p-1">{score.scheduleImpact}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="h-3/5 overflow-auto my-2">
        <div className="border-1 border-gray-300 flex flex-col">
          {/* Tab Buttons */}
          <div className="flex space-x-2 border-b p-2">
            <button
              className={`px-3 py-1 text-sm ${
                activeTab === "Indirect"
                  ? "bg-gray-200 text-gray-800 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("Indirect")}
            >
              Indirect Performance Point
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                activeTab === "Direct"
                  ? "bg-gray-200 text-gray-800 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("Direct")}
            >
              Direct Performance Point
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-2">
            {activeTab === "Direct" && (
              <table className="w-full border text-left text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-1 w-10 text-center">PP ID</th>
                    <th className="border p-1">Period Type</th>
                    <th className="border p-1">Short Description</th>
                    <th className="border p-1">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((_, index) => (
                    <tr key={`direct-${index}`}>
                      <td className="border p-1 text-center">
                        PP ID {index + 1}
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5">
                          {PERIOD_TYPES.map((type, i) => (
                            <option key={`direct-period-${i}`}>{type}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          maxLength={50}
                          placeholder="Short Description"
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5">
                          {DIRECT_DELIVERY.map((d, i) => (
                            <option key={`direct-delivery-${i}`}>{d}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Indirect" && (
              <table className="w-full border text-left text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-1 w-10 text-center">PP ID</th>
                    <th className="border p-1">Period Type</th>
                    <th className="border p-1">Short Description</th>
                    <th className="border p-1">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((_, index) => (
                    <tr key={`indirect-${index}`}>
                      <td className="border p-1 text-center">
                        PP ID -{index + 1}
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5">
                          {PERIOD_TYPES.map((type, i) => (
                            <option key={`indirect-period-${i}`}>{type}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          maxLength={50}
                          placeholder="Short Description"
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5">
                          {INDIRECT_DELIVERY.map((d, i) => (
                            <option key={`indirect-delivery-${i}`}>{d}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

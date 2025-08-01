"use client";

import React, { useState } from "react";
import { Plus, Trash2, Copy, Search, X } from "lucide-react";

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

export default function UnitRoster() {
  const [selectedCurveId, setSelectedCurveId] = useState(1);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const [points, setPoints] = useState(
    Array.from({ length: 20 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Direct");

  const handlePointChange = (index, field, value) => {
    const updated = [...points];
    updated[index][field] = value;
    setPoints(updated);
  };

  const handleDeleteCurve = () => {
    const updated = curves.filter((c) => c.id !== selectedCurveId);
    setCurves(updated);
    if (updated.length > 0) {
      setSelectedCurveId(updated[0].id);
    } else {
      setSelectedCurveId(null);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="flex-grow h-2/5 border-2 border-blue-500 rounded-md flex flex-col ">
        <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
          <span className="pl-2 text-md">Unit Config</span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>

        <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
          <h2 className="text-sm font-semibold">Unit Roster</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateMaterial(true)}
              title="Create Material"
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
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
          <div className="flex-1 border-2 border-blue-200 rounded-md overflow-auto">
            <table className="w-full border text-left text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-1 w-10 text-center">#</th>
                  <th className="border p-1">Last Name</th>
                  <th className="border p-1">First Name</th>
                  <th className="border p-1">Candidate ID</th>
                  <th className="border p-1">Unit Outcome</th>
                  <th className="border p-1">Present Count</th>
                  <th className="border p-1">Excused Absences</th>
                  <th className="border p-1">Unexcused Absences</th>
                  <th className="border p-1">Excused Tardies</th>
                  <th className="border p-1">Unexcused Tardies</th>
                  <th className="border p-1">Total Tally</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point, index) => {
                  const present = parseInt(point.present || 0);
                  const excusedAbs = parseInt(point.excusedAbs || 0);
                  const unexcusedAbs = parseInt(point.unexcusedAbs || 0);
                  const excusedTardy = parseInt(point.excusedTardy || 0);
                  const unexcusedTardy = parseInt(point.unexcusedTardy || 0);

                  const total =
                    present +
                    excusedAbs +
                    unexcusedAbs +
                    excusedTardy +
                    unexcusedTardy;

                  return (
                    <tr key={index}>
                      <td className="border p-1 text-center">{index + 1}</td>
                      <td className="border p-1">
                        <input
                          type="text"
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5 rounded">
                          <option>Ongoing</option>
                          <option>Pass</option>
                          <option>Fail</option>
                        </select>
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={point.present || ""}
                          onChange={(e) =>
                            handlePointChange(index, "present", e.target.value)
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={point.excusedAbs || ""}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "excusedAbs",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={point.unexcusedAbs || ""}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "unexcusedAbs",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={point.excusedTardy || ""}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "excusedTardy",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={point.unexcusedTardy || ""}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "unexcusedTardy",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1 text-center">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="h-3/5 overflow-auto my-2">
        <div className="border-2 border-blue-500 rounded-md flex flex-col">
          {/* Tab Buttons */}
          <div className="flex space-x-2 border-b p-2">
            <button
              className={`px-3 py-1 text-sm rounded-t ${
                activeTab === "Indirect"
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("Indirect")}
            >
              Indirect Performance Point
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-t ${
                activeTab === "Direct"
                  ? "bg-blue-100 text-blue-600 font-semibold"
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
                        <select className="w-full border px-2 py-0.5 rounded">
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
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5 rounded">
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
                        <select className="w-full border px-2 py-0.5 rounded">
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
                          className="w-full border px-2 py-0.5 rounded"
                        />
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5 rounded">
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
    </>
  );
}
